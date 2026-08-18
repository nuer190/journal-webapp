import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// ฟังก์ชันแปลงข้อความให้เป็น Title Case
function toTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const sourceIdParam = searchParams.get("sourceId");
    const sourceId = sourceIdParam ? parseInt(sourceIdParam, 10) : undefined;

    const selectedAreas = searchParams.getAll("areaId").filter(Boolean).map(Number);
    const selectedRanks = searchParams.getAll("rank").filter(Boolean);

    const sourceTypeParam = (
      searchParams.get("sourceType") ||
      searchParams.get("type") ||
      ""
    ).trim();

    const statusParam = (searchParams.get("status") || searchParams.get("activeStatus") || "")
      .trim()
      .toLowerCase();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // 1. Where Condition
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

    // Filter Source Type
    if (sourceTypeParam && sourceTypeParam.toLowerCase() !== "all") {
      andConditions.push({
        source_type: {
          equals: sourceTypeParam,
          mode: "insensitive",
        },
      });
    }

    // Filter สถานะ Active / Inactive
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

    let areasWhereCondition: Prisma.NEW_SUBJECT_AREAWhereInput | undefined = undefined;

    if (sourceId) {
      areasWhereCondition = {
        OR: [
          { source_id: sourceId },
          {
            journal_mappings: {
              some: {
                source_id: sourceId,
              },
            },
          },
        ],
      };
    }

    // 2. Executing Parallel Queries
    const [
      totalCount,
      allFilteredJournalsForPublishers,
      rawJournals,
      sources,
      filteredAreasOptions,
      filteredRanksOptions,
      filteredSourceTypesOptions,
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
      }),

      prisma.nEW_JOURNAL_RANKING.findMany({
        where: sourceId ? { source_id: sourceId } : undefined,
        distinct: ["overall_rank"],
        select: { overall_rank: true },
        orderBy: { overall_rank: "asc" },
      }),

      prisma.nEW_JOURNAL.findMany({
        where: {
          source_type: { not: null },
          ...(sourceId
            ? {
                OR: [
                  { area_mappings: { some: { source_id: sourceId } } },
                  { rankings: { some: { source_id: sourceId } } },
                ],
              }
            : {}),
        },
        distinct: ["source_type"],
        select: { source_type: true },
        orderBy: { source_type: "asc" },
      }),
    ]);

    const uniquePublishersCount = new Set(
      allFilteredJournalsForPublishers
        .map((j) => j.publisher)
        .filter((p): p is string => Boolean(p && p.trim() !== ""))
    ).size;

    // ==========================================
    // 🟢 Chart Data Summary (แก้ไขเพิ่มเติม)
    // ==========================================
    const hasAreaOrRankFilter = selectedAreas.length > 0 || selectedRanks.length > 0;

    const chartSummaryRaw = await prisma.nEW_JOURNAL_AREA_MAPPING.groupBy({
      by: ["source_id", "subject_area_id"],
      where: {
        journal: journalWhereCondition,
        // 🟢 เพิ่มการกรองตาม source_id ที่เลือกเข้ามา
        ...(sourceId ? { source_id: sourceId } : {}),
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

    const chartAreaIds = Array.from(new Set(finalChartSummary.map((c) => c.subject_area_id)));
    const chartSourceIds = Array.from(new Set(finalChartSummary.map((c) => c.source_id)));

    // ดึงข้อมูล Subject Area และ Source มาแมปกับ ID
    const [chartSubjectAreas, chartSources] = await Promise.all([
      prisma.nEW_SUBJECT_AREA.findMany({
        where: { id: { in: chartAreaIds } },
        select: { id: true, area_name: true },
      }),
      prisma.nEW_SOURCE.findMany({
        where: { id: { in: chartSourceIds } },
        select: { id: true, source_name: true },
      }),
    ]);

    // สร้างข้อมูล chartData ให้มีข้อมูลทั้ง Subject Area และ Source
    const chartData = finalChartSummary.map((item) => {
      const area = chartSubjectAreas.find((a) => a.id === item.subject_area_id);
      const source = chartSources.find((s) => s.id === item.source_id);

      return {
        subject_area_id: item.subject_area_id,
        area_name: area ? area.area_name : `Area ${item.subject_area_id}`,
        source_id: item.source_id,
        source_name: source ? source.source_name : `Source ${item.source_id}`,
        count: item._count.journal_id,
      };
    });

    // Formatting Journal Items
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

      const activeStatus = j.active_status || "Active";

      return {
        ...j,
        title: j.journal_title,
        source_type: j.source_type ? toTitleCase(j.source_type) : "—",
        issn: issnPrint,
        issnOnline: issnOnline,
        active_status: activeStatus,
        rankQuality,
        topRank: currentRanks[0]?.overall_rank || "—",
      };
    });

    // รวมค่า ปรับเป็น Title Case และตัดค่าซ้ำ (Deduplicate)
    const rawSourceTypes = filteredSourceTypesOptions
      .map((item) => item.source_type)
      .filter((type): type is string => Boolean(type && type.trim() !== ""));

    const sourceTypesList = Array.from(
      new Set(rawSourceTypes.map((type) => toTitleCase(type)))
    ).sort();

    return NextResponse.json({
      success: true,
      summary: {
        totalJournals: totalCount,
        totalPublishers: uniquePublishersCount,
        totalAreas: filteredAreasOptions.length,
        totalSourceTypes: sourceTypesList.length,
      },
      isTop10: displayMode === "top10",
      displayLimit: finalChartSummary.length,
      sources,
      areas: filteredAreasOptions,
      ranks: filteredRanksOptions.map((r) => r.overall_rank).filter(Boolean),
      sourceTypes: sourceTypesList,
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