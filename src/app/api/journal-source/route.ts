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

    // 🟢 อ่านค่า Pagination Params
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // 1. Where Condition สำหรับ Filter
    const andConditions: Prisma.NEW_JOURNALWhereInput[] = [];

    if (sourceId) {
      andConditions.push({
        OR: [
          { NEW_JOURNAL_AREA_MAPPING: { some: { subject_area: { source_id: sourceId } } } },
          { NEW_JOURNAL_RANKING: { some: { source_id: sourceId } } },
        ],
      });
    }

    if (selectedAreas.length > 0) {
      andConditions.push({
        NEW_JOURNAL_AREA_MAPPING: {
          some: { subject_area_id: { in: selectedAreas } },
        },
      });
    }

    if (selectedRanks.length > 0) {
      andConditions.push({
        NEW_JOURNAL_RANKING: {
          some: {
            ...(sourceId ? { source_id: sourceId } : {}),
            rank_value: { in: selectedRanks },
          },
        },
      });
    }

    const journalWhereCondition: Prisma.NEW_JOURNALWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    // 2. Fetch Data
    const [
      totalCount,
      rawJournals,
      sources,
      filteredAreasOptions,
      filteredRanksOptions,
      publishersGroup,
    ] = await Promise.all([
      prisma.nEW_JOURNAL.count({ where: journalWhereCondition }),
      prisma.nEW_JOURNAL.findMany({
        where: journalWhereCondition,
        skip,
        take: limit,
        orderBy: { journal_title: "asc" },
        include: {
          NEW_JOURNAL_ISSN: true,
          NEW_JOURNAL_RANKING: { include: { source: true } },
          NEW_JOURNAL_AREA_MAPPING: { include: { subject_area: true } },
        },
      }),
      prisma.nEW_SOURCE.findMany({ orderBy: { source_name: "asc" } }),

      // 🔴 [จุดที่แก้ไขแก้ AJG หาย]: ดึง Area โดยเจาะผ่าน Journal Mapping ของ Source นั้นๆ
      sourceId
        ? prisma.nEW_SUBJECT_AREA.findMany({
            where: {
              OR: [
                { source_id: sourceId },
                {
                  NEW_JOURNAL_AREA_MAPPING: {
                    some: {
                      journal: {
                        NEW_JOURNAL_RANKING: {
                          some: { source_id: sourceId },
                        },
                      },
                    },
                  },
                },
                {
                  NEW_JOURNAL_AREA_MAPPING: {
                    some: {
                      journal: {
                        NEW_JOURNAL_AREA_MAPPING: {
                          some: { subject_area: { source_id: sourceId } },
                        },
                      },
                    },
                  },
                },
              ],
            },
            orderBy: { area_name: "asc" },
          })
        : prisma.nEW_SUBJECT_AREA.findMany({
            orderBy: { area_name: "asc" },
          }),

      prisma.nEW_JOURNAL_RANKING.findMany({
        where: sourceId ? { source_id: sourceId } : undefined,
        distinct: ["rank_value"],
        select: { rank_value: true },
        orderBy: { rank_value: "asc" },
      }),

      prisma.nEW_JOURNAL.groupBy({
        by: ["publisher"],
        where: {
          ...journalWhereCondition,
          AND: [
            ...(journalWhereCondition.AND
              ? Array.isArray(journalWhereCondition.AND)
                ? journalWhereCondition.AND
                : [journalWhereCondition.AND]
              : []),
            { publisher: { not: undefined } },
          ],
        },
      }),
    ]);

    // 🟢 3. Dynamic Chart Data (ปรับให้โชว์ Top 10 ตอนยังไม่เลือก Area หรือ Rank)
    const hasAreaOrRankFilter = selectedAreas.length > 0 || selectedRanks.length > 0;
    const isTop10 = !hasAreaOrRankFilter; // 👈 เป็น Top 10 ถ้าไม่มีการเลือก Area หรือ Rank (เลือกแค่ Source ก็ยังเป็น Top 10)

    const mappingWhereCondition: Prisma.NEW_JOURNAL_AREA_MAPPINGWhereInput = {
      journal: journalWhereCondition,
      ...(selectedAreas.length > 0
        ? { subject_area_id: { in: selectedAreas } }
        : sourceId
        ? {
            OR: [
              { subject_area: { source_id: sourceId } },
              { journal: { NEW_JOURNAL_RANKING: { some: { source_id: sourceId } } } },
            ],
          }
        : {}),
    };

    // จัดกลุ่มและเรียงลำดับจำนวนมากไปน้อย
    const chartSummaryRaw = await prisma.nEW_JOURNAL_AREA_MAPPING.groupBy({
      by: ["subject_area_id"],
      where: mappingWhereCondition,
      _count: { journal_id: true },
      orderBy: { _count: { journal_id: "desc" } },
    });

    // ถ้ายังไม่ได้เลือก Area/Rank เฉพาะเจาะจง ให้ตัดเอา Top 10
    const finalChartSummary = isTop10 ? chartSummaryRaw.slice(0, 10) : chartSummaryRaw;

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

    // 4. คำนวณค่า Summary รวม
    const validPublishersCount = publishersGroup.filter(
      (p) => p.publisher && p.publisher.trim() !== ""
    ).length;

    const summary = {
      totalJournals: totalCount,
      totalPublishers: validPublishersCount,
      totalAreas: chartSummaryRaw.length,
    };

    // 5. Format Journals Table
    const formattedJournals = rawJournals.map((j) => {
      const issnPrint =
        j.NEW_JOURNAL_ISSN.find((i) => i.issn_type?.toUpperCase() === "PRINT")?.issn ||
        j.NEW_JOURNAL_ISSN[0]?.issn ||
        "—";

      const issnOnline =
        j.NEW_JOURNAL_ISSN.find((i) => i.issn_type?.toUpperCase() === "ONLINE")?.issn ||
        j.NEW_JOURNAL_ISSN[1]?.issn ||
        "—";

      const currentSourceRanks = sourceId
        ? j.NEW_JOURNAL_RANKING.filter((r) => r.source_id === sourceId)
        : j.NEW_JOURNAL_RANKING;

      const rankQuality = currentSourceRanks.map((r) => ({
        sourceName: r.source?.source_name || "",
        rankValue: r.rank_value,
      }));

      return {
        ...j,
        title: j.journal_title,
        issn: issnPrint,
        issnOnline: issnOnline,
        rankQuality,
        topRank: currentSourceRanks[0]?.rank_value || "—",
      };
    });

    return NextResponse.json({
      success: true,
      summary,
      isTop10, // 🟢 ส่ง flag true เมื่อเปิดหน้าแรก หรือเมื่อเลือกแค่ Source อย่างเดียว
      sources,
      areas: filteredAreasOptions,
      ranks: filteredRanksOptions.map((r) => r.rank_value).filter(Boolean),
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
    console.error("[JOURNALS_SOURCE_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}