import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const majorGroup = searchParams.get("majorGroup");
    const areaGroup = searchParams.get("areaGroup");
    const source = searchParams.get("source");
    const rank = searchParams.get("rank");

    // 1. เงื่อนไขสำหรับดึง areaGroup (กรองตาม source, majorGroup)
    const paramsAreaGroup: any[] = [];
    let areaGroupWhere = "WHERE area_group IS NOT NULL AND area_group != ''";
    if (source) {
      paramsAreaGroup.push(source);
      areaGroupWhere += ` AND LOWER(source) = LOWER($${paramsAreaGroup.length})`;
    }
    if (majorGroup) {
      paramsAreaGroup.push(majorGroup);
      areaGroupWhere += ` AND major_group = $${paramsAreaGroup.length}`;
    }

    // 2. เงื่อนไขสำหรับดึง area (กรองตาม source, majorGroup, areaGroup)
    const paramsArea: any[] = [];
    let areaWhere = "WHERE area IS NOT NULL AND area != ''";
    if (source) {
      paramsArea.push(source);
      areaWhere += ` AND LOWER(source) = LOWER($${paramsArea.length})`;
    }
    if (majorGroup) {
      paramsArea.push(majorGroup);
      areaWhere += ` AND major_group = $${paramsArea.length}`;
    }
    if (areaGroup) {
      paramsArea.push(areaGroup);
      areaWhere += ` AND area_group = $${paramsArea.length}`;
    }

    // 3. เงื่อนไขสำหรับดึง rank (กรองตาม source ถ้ามีเลือก)
    const paramsRank: any[] = [];
    let rankWhere = "WHERE rank IS NOT NULL AND rank != ''";
    if (source) {
      paramsRank.push(source);
      rankWhere += ` AND LOWER(source) = LOWER($${paramsRank.length})`;
    }

    // 4. Query ข้อมูลพร้อมกันแบบ Parallel
    const [majorGroupsRes, areaGroupsRes, areasRes, sourcesRes, ranksRes] = await Promise.all([
      prisma.$queryRaw<Array<{ major_group: string }>>`
        SELECT DISTINCT major_group FROM journal_area 
        WHERE major_group IS NOT NULL AND major_group != '' 
        ORDER BY major_group ASC
      `,
      prisma.$queryRawUnsafe<Array<{ area_group: string }>>(
        `SELECT DISTINCT area_group FROM journal_area ${areaGroupWhere} ORDER BY area_group ASC`,
        ...paramsAreaGroup
      ),
      prisma.$queryRawUnsafe<Array<{ area: string }>>(
        `SELECT DISTINCT area FROM journal_area ${areaWhere} ORDER BY area ASC`,
        ...paramsArea
      ),
      prisma.$queryRaw<Array<{ source: string }>>`
        SELECT DISTINCT source FROM journal_area 
        WHERE source IS NOT NULL AND source != '' 
        ORDER BY source ASC
      `,
      prisma.$queryRawUnsafe<Array<{ rank: string }>>(
        `SELECT DISTINCT rank FROM journal_area ${rankWhere} ORDER BY rank ASC`,
        ...paramsRank
      ),
    ]);

    return NextResponse.json({
      majorGroups: majorGroupsRes.map((i) => i.major_group).filter(Boolean),
      areaGroups: areaGroupsRes.map((i) => i.area_group).filter(Boolean),
      areas: areasRes.map((i) => i.area).filter(Boolean),
      sources: sourcesRes.map((i) => i.source).filter(Boolean),
      ranks: ranksRes.map((i) => i.rank).filter(Boolean),
    });
  } catch (error: any) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}