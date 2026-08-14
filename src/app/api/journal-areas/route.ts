import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const area = searchParams.get("area");
  const areaGroup = searchParams.get("areaGroup");
  const majorGroup = searchParams.get("majorGroup");
  const source = searchParams.get("source");
  const rank = searchParams.get("rank");
  const rawAreaRules = searchParams.get("areaRules");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const where: Record<string, unknown> = {};

  const normalizedSource = source ? source.toUpperCase() : null;

  // 1. จัดการ Filter Source และ Rank
  if (normalizedSource) {
    switch (normalizedSource) {
      case "ABDC":
        where.abdc = rank
          ? { rating_2025: rank }
          : { rating_2025: { not: null, notIn: ["", "—", "N/A"] } };
        break;
      case "AJG":
        where.ajg = rank
          ? { ajg_2024_rating: rank }
          : { ajg_2024_rating: { not: null, notIn: ["", "—", "N/A"] } };
        break;
      case "SCIMAGO":
        where.scimago = rank
          ? { sjr_best_quartile: rank }
          : { sjr_best_quartile: { not: null, notIn: ["", "—", "N/A"] } };
        break;
      case "SCOPUS":
        // Scopus ไม่มี Rank ให้เช็คว่ามี Record ในตาราง Scopus
        where.scopus = { isNot: null };
        break;
    }
  } else if (rank) {
    // กรณีเลือกเฉพาะ Rank โดยไม่เลือก Source
    const abdcRanks = ["A*", "A", "B", "C"];
    const ajgRanks = ["4*", "4", "3", "2", "1"];
    const scimagoRanks = ["Q1", "Q2", "Q3", "Q4"];

    const rankConditions: Record<string, unknown>[] = [];
    if (abdcRanks.includes(rank)) {
      rankConditions.push({ abdc: { rating_2025: rank } });
    }
    if (ajgRanks.includes(rank)) {
      rankConditions.push({ ajg: { ajg_2024_rating: rank } });
    }
    if (scimagoRanks.includes(rank)) {
      rankConditions.push({ scimago: { sjr_best_quartile: rank } });
    }

    if (rankConditions.length > 0) {
      where.OR = rankConditions;
    }
  }

  // Helper สำหรับสร้าง Filter Area + Source
  const buildAreaFilter = (areaNameCondition: Record<string, unknown>) => {
    return {
      area: {
        area_name: areaNameCondition,
        ...(source ? { source: source } : {}),
      },
    };
  };

  // 2. จัดการเงื่อนไข Area Rules (AND / OR / NOT)
  if (rawAreaRules) {
    const andAreas: string[] = [];
    const orAreas: string[] = [];
    const notAreas: string[] = [];

    rawAreaRules.split(",").forEach((item) => {
      const [areaName, operator] = item.split(":");
      const decodedArea = decodeURIComponent(areaName || "").trim();
      if (decodedArea) {
        if (operator === "AND") andAreas.push(decodedArea);
        else if (operator === "NOT") notAreas.push(decodedArea);
        else orAreas.push(decodedArea);
      }
    });

    const areaConditions: Record<string, unknown>[] = [];

    if (orAreas.length > 0) {
      areaConditions.push({
        journalAreaDetails: {
          some: buildAreaFilter({ in: orAreas }),
        },
      });
    }

    if (andAreas.length > 0) {
      andAreas.forEach((a) => {
        areaConditions.push({
          journalAreaDetails: {
            some: buildAreaFilter({ equals: a }),
          },
        });
      });
    }

    if (notAreas.length > 0) {
      areaConditions.push({
        journalAreaDetails: {
          none: buildAreaFilter({ in: notAreas }),
        },
      });
    }

    if (areaConditions.length > 0) {
      where.AND = areaConditions;
    }
  } else if (area) {
    where.journalAreaDetails = {
      some: buildAreaFilter({ equals: area }),
    };
  }

  // 3. กรองตาม Area Group
  if (areaGroup) {
    where.journalAreaGroupDetails = {
      some: {
        areaGroup: {
          area_group_name: areaGroup,
        },
      },
    };
  }

  // 4. กรองตาม Major Group
  if (majorGroup) {
    where.journalMajorGroupDetails = {
      some: {
        majorGroup: {
          major_group_name: majorGroup,
        },
      },
    };
  }

  // 5. Query ข้อมูล
  const [journals, total] = await Promise.all([
    prisma.jOURNAL_MAIN.findMany({
      where,
      include: {
        abdc: {
          select: {
            issn_print: true,
            issn_online: true,
            rating_2025: true,
            abdc_area: true,
          },
        },
        ajg: { select: { ajg_2024_rating: true } },
        scimago: { select: { sjr_best_quartile: true } },
        scopus: {
          select: {
            scopus_title: true,
            active_status: true,
            source_type: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { journal_title: "asc" },
    }),
    prisma.jOURNAL_MAIN.count({ where }),
  ]);

  return NextResponse.json({
    journals: journals.map((j) => ({
      id: j.id,
      journal_title: j.journal_title,
      publisher: j.publisher,
      issn_print: j.abdc?.issn_print ?? null,
      issn_online: j.abdc?.issn_online ?? null,
      rating_2025: j.abdc?.rating_2025 ?? null,
      abdc_area: j.abdc?.abdc_area ?? null,
      ajg: j.ajg,
      scimago: j.scimago,
      scopus: j.scopus,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}