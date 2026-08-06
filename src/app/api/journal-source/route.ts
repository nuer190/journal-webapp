import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const sourceIdParam = searchParams.get("sourceId");
    const sourceId = sourceIdParam ? parseInt(sourceIdParam, 10) : undefined;

    const selectedAreas = searchParams.getAll("areaId").filter(Boolean).map(Number);
    const selectedRanks = searchParams.getAll("rank").filter(Boolean);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // 1. Where Condition สำหรับการ Filter Journal
    const andConditions: Prisma.NEW_JOURNALWhereInput[] = [];

    if (sourceId) {
      andConditions.push({
        OR: [
          { area_mappings: { some: { source_id: sourceId } } },
          { rankings: { some: { source_id: sourceId } } },
          { area_mappings: { some: { subject_area: { source_id: sourceId } } } },
        ],
      });
    }

    if (selectedAreas.length > 0) {
      andConditions.push({
        area_mappings: {
          some: { subject_area_id: { in: selectedAreas } },
        },
      });
    }

    if (selectedRanks.length > 0) {
      andConditions.push({
        rankings: {
          some: {
            ...(sourceId ? { source_id: sourceId } : {}),
            overall_rank: { in: selectedRanks },
          },
        },
      });
    }

    const journalWhereCondition: Prisma.NEW_JOURNALWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    // 2. Query ตัวเลือก Filter Areas
    let areasWhereCondition: Prisma.NEW_SUBJECT_AREAWhereInput | undefined = undefined;

    if (sourceId) {
      areasWhereCondition = {
        OR: [
          { source_id: sourceId },
          {
            journal_mappings: {
              some: {
                OR: [
                  { source_id: sourceId },
                  {
                    journal: {
                      rankings: { some: { source_id: sourceId } },
                    },
                  },
                ],
              },
            },
          },
        ],
      };
    }

    const hasAreaOrRankFilter = selectedAreas.length > 0 || selectedRanks.length > 0;

    // ⚡ 3. ตรวจสอบว่าเป็นการกดเปลี่ยนหน้าอย่างเดียวหรือไม่ (ไม่มีการเพิ่ม/ลด filter)
    const isOnlyPagination = page > 1 && !hasAreaOrRankFilter;

    // 4. ยิง Query ชุดหลักพร้อมกันผ่าน Promise.all
    const [
      totalCount,
      uniquePublishersCount,
      rawJournals,
      sources,
      filteredAreasOptions,
      filteredRanksOptions,
      chartSummaryRaw,
    ] = await Promise.all([
      // Count จำนวน Journal ทั้งหมด
      prisma.nEW_JOURNAL.count({ where: journalWhereCondition }),

      // หา unique publisher ผ่าน DB โดยตรง
      prisma.nEW_JOURNAL.groupBy({
        by: ["publisher"],
        where: {
          ...journalWhereCondition,
          publisher: { not: null },
        },
      }).then((res) => res.filter((p) => p.publisher && p.publisher.trim() !== "").length),

      // ดึงรายการ Journals เฉพาะ Page นั้นๆ
      prisma.nEW_JOURNAL.findMany({
        where: journalWhereCondition,
        skip,
        take: limit,
        orderBy: { journal_title: "asc" },
        include: {
          issns: true,
          rankings: { include: { source: true } },
          area_mappings: { include: { subject_area: true, source: true } },
        },
      }),

      // ดึง Sources
      prisma.nEW_SOURCE.findMany({ orderBy: { source_name: "asc" } }),

      // Dropdown Subject Areas
      prisma.nEW_SUBJECT_AREA.findMany({
        where: areasWhereCondition,
        orderBy: { area_name: "asc" },
        distinct: ["area_name"],
      }),

      // Dropdown Ranks
      prisma.nEW_JOURNAL_RANKING.findMany({
        where: sourceId ? { source_id: sourceId } : undefined,
        distinct: ["overall_rank"],
        select: { overall_rank: true },
        orderBy: { overall_rank: "asc" },
      }),

      // ⚡ ทำ GroupBy คำนวณกราฟเฉพาะเมื่อจำเป็น (ถ้ากด Next Page อย่างเดียว ให้ข้ามเพื่อเพิ่มความเร็ว)
      isOnlyPagination
        ? Promise.resolve([])
        : prisma.nEW_JOURNAL_AREA_MAPPING.groupBy({
            by: ["subject_area_id"],
            where: {
              journal: journalWhereCondition,
              ...(selectedAreas.length > 0 ? { subject_area_id: { in: selectedAreas } } : {}),
            },
            _count: { journal_id: true },
            orderBy: { _count: { journal_id: "desc" } },
          }),
    ]);

    // 5. จัดการข้อมูล Chart Data (คำนวณเฉพาะตอนไม่ใช่ Pagination หรือเมื่อมี Data ส่งกลับมา)
    let finalChartSummary = chartSummaryRaw;
    let displayMode: "top10" | "top30" | "all" = "all";

    if (!hasAreaOrRankFilter) {
      finalChartSummary = chartSummaryRaw.slice(0, 10);
      displayMode = "top10";
    } else if (chartSummaryRaw.length > 10) {
      finalChartSummary = chartSummaryRaw.slice(0, 30);
      displayMode = "top30";
    }

    const chartAreaIds = finalChartSummary.map((c) => c.subject_area_id);

    // ดึงเฉพาะชื่อ Area ที่จำเป็นต้องแสดงใน Chart
    const chartSubjectAreas = chartAreaIds.length > 0 
      ? await prisma.nEW_SUBJECT_AREA.findMany({
          where: { id: { in: chartAreaIds } },
          select: { id: true, area_name: true },
        })
      : [];

    const areaMap = new Map(chartSubjectAreas.map((a) => [a.id, a.area_name]));

    const chartData = finalChartSummary.map((item) => ({
      subject_area_id: item.subject_area_id,
      area_name: areaMap.get(item.subject_area_id) || `Area ${item.subject_area_id}`,
      count: item._count.journal_id,
    }));

    // 6. Formatting Journal Items
    const formattedJournals = rawJournals.map((j) => {
      let issnPrint = "—";
      let issnOnline = "—";

      if (j.issns && j.issns.length > 0) {
        const printItem = j.issns.find((i) => i.issn_type?.toUpperCase().includes("PRINT"));
        issnPrint = printItem?.issn || j.issns[0]?.issn || "—";

        const onlineItem = j.issns.find((i) => i.issn_type?.toUpperCase().match(/(ONLINE|EISSN)/));
        issnOnline = onlineItem?.issn || (j.issns.length > 1 ? j.issns[1]?.issn : "—") || "—";
      }

      const currentRanks = j.rankings || [];
      const rankQuality = currentRanks.map((r) => ({
        sourceId: r.source_id,
        sourceName: r.source?.source_name || "",
        rankValue: r.overall_rank,
      }));

      return {
        ...j,
        title: j.journal_title,
        issn: issnPrint,
        issnOnline: issnOnline,
        active_status: j.active_status || "Active",
        rankQuality,
        topRank: currentRanks[0]?.overall_rank || "—",
      };
    });

    // 7. ส่ง Response พร้อม Cache Header
    return NextResponse.json(
      {
        success: true,
        summary: {
          totalJournals: totalCount,
          totalPublishers: uniquePublishersCount,
          totalAreas: chartSummaryRaw.length,
        },
        isTop10: displayMode === "top10",
        displayLimit: finalChartSummary.length,
        sources,
        areas: filteredAreasOptions,
        ranks: filteredRanksOptions.map((r) => r.overall_rank).filter(Boolean),
        journals: formattedJournals,
        chartData,
        pagination: {
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("[JOURNALS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}