import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { journalIdSchema } from "@/lib/validations/journals";

// Helper: แปลง SciMago Categories String เป็น Array
function parseScimagoCategories(categoriesStr: string | null | undefined) {
  if (!categoriesStr?.trim()) return [];

  return categoriesStr
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/^(.*?)\s*\((Q[1-4])\)$/i);
      return {
        area: match ? match[1].trim() : item,
        rank: match ? match[2].toUpperCase() : null,
      };
    });
}

// Helper: Split string สั้นๆ
function splitAndClean(str: string | null | undefined): string[] {
  if (!str?.trim()) return [];
  return str.split(";").map((a) => a.trim()).filter(Boolean);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const { id } = journalIdSchema.parse({ id: rawId });

    // 1. Query ดึงข้อมูลแยก Scopus Area กับ General Area/Group/MajorGroup
    const journal = await prisma.jOURNAL_MAIN.findUnique({
      where: { id },
      select: {
        id: true,
        journal_title: true,
        publisher: true,
        abdc: {
          select: {
            abdc_area: true,
            rating_2025: true,
          },
        },
        ajg: {
          select: {
            ajg_subject_area: true,
            ajg_2024_rating: true,
          },
        },
        scimago: {
          select: {
            scimago_categories: true,
            scimago_areas: true,
            sjr_best_quartile: true,
          },
        },
        scopus: {
          select: {
            active_status: true,
            coverage_years: true,
            source_type: true,
            discontinued: true,
          },
        },
        note: true,

        // --- SCOPUS Specific Area ---
        journalScopusAreaDetails: {
          select: {
            scopusArea: {
              select: {
                scopus_area_name: true,
              },
            },
          },
        },

        // --- General Area, Area Group & Major Group ---
        journalAreaDetails: {
          select: {
            area: {
              select: {
                area_name: true,
              },
            },
          },
        },
        journalAreaGroupDetails: {
          select: {
            areaGroup: {
              select: {
                area_group_name: true,
              },
            },
          },
        },
        journalMajorGroupDetails: {
          select: {
            majorGroup: {
              select: {
                major_group_name: true,
              },
            },
          },
        },
      },
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // 2. ดึง List ของ Area Group และ Major Group
    const areaGroups = journal.journalAreaGroupDetails
      .map((d) => d.areaGroup?.area_group_name)
      .filter((name): name is string => Boolean(name));

    const majorGroups = journal.journalMajorGroupDetails
      .map((d) => d.majorGroup?.major_group_name)
      .filter((name): name is string => Boolean(name));

    const primaryAreaGroup = areaGroups[0] || "—";
    const primaryMajorGroup = majorGroups[0] || "—";

    // 3. ABDC Breakdown
    const abdcAreas = splitAndClean(journal.abdc?.abdc_area);
    const abdcDetails = journal.abdc
      ? {
          ...journal.abdc,
          area_details: abdcAreas.map((areaName, idx) => ({
            area: areaName,
            area_group: areaGroups[idx] || primaryAreaGroup,
            major_group: majorGroups[idx] || primaryMajorGroup || "Business & Commerce",
            rank: journal.abdc?.rating_2025 ?? null,
          })),
        }
      : null;

    // 4. AJG Breakdown
    const ajgAreas = splitAndClean(journal.ajg?.ajg_subject_area);
    const ajgDetails = journal.ajg
      ? {
          ...journal.ajg,
          area_details: ajgAreas.map((areaName, idx) => ({
            area: areaName,
            area_group: areaGroups[idx] || primaryAreaGroup,
            major_group: majorGroups[idx] || primaryMajorGroup || "Business & Management",
            rank: journal.ajg?.ajg_2024_rating ?? null,
          })),
        }
      : null;

    // 5. SCIMAGO Breakdown
    const parsedScimagoCat = parseScimagoCategories(
      journal.scimago?.scimago_categories
    );
    const scimagoAreas =
      parsedScimagoCat.length > 0
        ? parsedScimagoCat
        : splitAndClean(journal.scimago?.scimago_areas).map((a) => ({
            area: a,
            rank: null,
          }));

    const scimagoDetails = journal.scimago
      ? {
          ...journal.scimago,
          area_details: scimagoAreas.map((cat, idx) => ({
            area: cat.area,
            area_group: areaGroups[idx] || primaryAreaGroup,
            major_group: majorGroups[idx] || primaryMajorGroup || "General Science",
            rank: cat.rank || journal.scimago?.sjr_best_quartile || null,
          })),
        }
      : null;

    // 6. SCOPUS Breakdown (ดึงจาก Scopus Area โดยตรง)
    const scopusDetails = journal.scopus
      ? {
          ...journal.scopus,
          area_details: journal.journalScopusAreaDetails.map((d, idx) => ({
            area: d.scopusArea?.scopus_area_name ?? "—",
            area_group: areaGroups[idx] || primaryAreaGroup,
            major_group: majorGroups[idx] || primaryMajorGroup,
            rank: journal.scopus?.active_status ?? null,
          })),
        }
      : null;

    return NextResponse.json({
      id: journal.id,
      journal_title: journal.journal_title,
      publisher: journal.publisher,
      abdc: abdcDetails,
      ajg: ajgDetails,
      scimago: scimagoDetails,
      scopus: scopusDetails,
      note: journal.note,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}