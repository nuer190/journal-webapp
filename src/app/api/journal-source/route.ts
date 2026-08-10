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

    // 🟢 1. ดึงสถานะ Active / Inactive จาก Query Parameter (รองรับ "status" หรือ "activeStatus")
    const statusParam = (searchParams.get("status") || searchParams.get("activeStatus") || "")
      .trim()
      .toLowerCase();

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

    // 🟢 2. เงื่อนไขการกรองคอลัมน์ active_status ตาม Schema
    if (statusParam === "active") {
      andConditions.push({
        OR: [
          { active_status: { equals: "Active", mode: "insensitive" } },
          { active_status: { equals: "active", mode: "insensitive" } },
          { active_status: { equals: "1" } },
          { active_status: { equals: "true" } },
          { active_status: null },
          { active_status: "" },
        ],
      });
    } else if (statusParam === "inactive") {
      andConditions.push({
        OR: [
          { active_status: { equals: "Inactive", mode: "insensitive" } },
          { active_status: { equals: "inactive", mode: "insensitive" } },
          { active_status: { equals: "0" } },
          { active_status: { equals: "false" } },
        ],
      });
    }

    const journalWhereCondition: Prisma.NEW_JOURNALWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    // 2. Query ตัวเลือก Filter Areas ให้ยืดหยุ่นขึ้น
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

    // 3. Query ข้อมูลพร้อมกันผ่าน Promise.all
    const [
      totalCount,
      allFilteredJournalsForPublishers,
      rawJournals,
      sources,
      filteredAreasOptions,
      filteredRanksOptions,
    ] = await Promise.all([
      prisma.nEW_JOURNAL.count({ where: journalWhereCondition }),
      prisma.nEW_JOURNAL.findMany({
        where: journalWhereCondition,
        select: { publisher: true },
      }),
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
      prisma.nEW_SOURCE.findMany({ orderBy: { source_name: "asc" } }),

      prisma.nEW_SUBJECT_AREA.findMany({
        where: areasWhereCondition,
        orderBy: { area_name: "asc" },
        distinct: ["area_name"],
      }),

      prisma.nEW_JOURNAL_RANKING.findMany({
        where: sourceId ? { source_id: sourceId } : undefined,
        distinct: ["overall_rank"],
        select: { overall_rank: true },
        orderBy: { overall_rank: "asc" },
      }),
    ]);

    const uniquePublishersCount = new Set(
      allFilteredJournalsForPublishers
        .map((j) => j.publisher)
        .filter((p): p is string => Boolean(p && p.trim() !== ""))
    ).size;

    // 4. คำนวณ Chart Data
    const hasAreaOrRankFilter = selectedAreas.length > 0 || selectedRanks.length > 0;

    const chartSummaryRaw = await prisma.nEW_JOURNAL_AREA_MAPPING.groupBy({
      by: ["subject_area_id"],
      where: {
        journal: journalWhereCondition,
        ...(selectedAreas.length > 0 ? { subject_area_id: { in: selectedAreas } } : {}),
      },
      _count: { journal_id: true },
      orderBy: { _count: { journal_id: "desc" } },
    });

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

    const chartSubjectAreas = await prisma.nEW_SUBJECT_AREA.findMany({
      where: { id: { in: chartAreaIds } },
      select: { id: true, area_name: true },
    });

    const chartData = finalChartSummary.map((item) => {
      const area = chartSubjectAreas.find((a) => a.id === item.subject_area_id);
      return {
        subject_area_id: item.subject_area_id,
        area_name: area ? area.area_name : `Area ${item.subject_area_id}`,
        count: item._count.journal_id,
      };
    });

    // 5. Formatting Journal Items
    const formattedJournals = rawJournals.map((j) => {
      const issnPrint =
        j.issns?.find((i) => i.issn_type?.toUpperCase().includes("PRINT"))?.issn ||
        j.issns?.[0]?.issn ||
        "—";
      const issnOnline =
        j.issns?.find((i) =>
          i.issn_type?.toUpperCase().match(/(ONLINE|EISSN)/)
        )?.issn ||
        j.issns?.[1]?.issn ||
        "—";

      const currentRanks = j.rankings || [];
      const rankQuality = currentRanks.map((r) => ({
        sourceId: r.source_id,
        sourceName: r.source?.source_name || "",
        rankValue: r.overall_rank,
      }));

      // เช็ค active_status สำหรับ Scopus / General
      const activeStatus = j.active_status || "Active";

      return {
        ...j,
        title: j.journal_title,
        issn: issnPrint,
        issnOnline: issnOnline,
        active_status: activeStatus,
        rankQuality,
        topRank: currentRanks[0]?.overall_rank || "—",
      };
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("[JOURNALS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}