import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const area = searchParams.get("area");
  const areaGroup = searchParams.get("areaGroup");
  const majorGroup = searchParams.get("majorGroup");
  const source = searchParams.get("source");
  const rank = searchParams.get("rank");
  const rawAreaRules = searchParams.get("areaRules"); // 1. เพิ่มการรับ areaRules
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const where: Record<string, unknown> = {};

  // 2. จัดการเงื่อนไข Area Rules (รองรับ AND / OR / NOT)
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
        else orAreas.push(decodedArea); // Default OR
      }
    });

    const areaConditions: Record<string, unknown>[] = [];

    // OR: วารสารต้องมีอย่างน้อย 1 Area ในกลุ่ม orAreas
    if (orAreas.length > 0) {
      areaConditions.push({
        journalAreaDetails: {
          some: {
            area: {
              area_name: { in: orAreas },
            },
          },
        },
      });
    }

    // AND: วารสารต้องมีครบ "ทุก Area" ในกลุ่ม andAreas
    if (andAreas.length > 0) {
      andAreas.forEach((a) => {
        areaConditions.push({
          journalAreaDetails: {
            some: {
              area: {
                area_name: a,
              },
            },
          },
        });
      });
    }

    // NOT: วารสารต้อง "ไม่มี" Area ใดๆ ในกลุ่ม notAreas
    if (notAreas.length > 0) {
      areaConditions.push({
        journalAreaDetails: {
          none: {
            area: {
              area_name: { in: notAreas },
            },
          },
        },
      });
    }

    if (areaConditions.length > 0) {
      where.AND = areaConditions;
    }
  } else if (area) {
    // 3. Fallback ใช้ Logic เดิมเมื่อไม่มี areaRules (ส่งมาแค่ area ตัวเดียว)
    where.journalAreaDetails = {
      some: {
        area: {
          area_name: area,
        },
      },
    };
  }

  // === ทุกอย่างด้านล่างนี้คงเดิม 100% ไม่กระทบ Logic อื่นๆ ===

  if (areaGroup) {
    where.journalAreaGroupDetails = {
      some: {
        areaGroup: {
          area_group_name: areaGroup,
        },
      },
    };
  }

  if (majorGroup) {
    where.journalMajorGroupDetails = {
      some: {
        majorGroup: {
          major_group_name: majorGroup,
        },
      },
    };
  }

  if (source) {
    const sourceMap: Record<string, Record<string, unknown>> = {
      ABDC: { abdc: { isNot: null } },
      AJG: { ajg: { isNot: null } },
      Scimago: { scimago: { isNot: null } },
      Scopus: { scopus: { isNot: null } },
    };
    const sourceFilter = sourceMap[source];
    if (sourceFilter) {
      Object.assign(where, sourceFilter);
    }
  }

  if (rank) {
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
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}