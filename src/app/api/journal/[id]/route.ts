import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { journalIdSchema } from "@/lib/validations/journals";

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

    // 1. Fetch Journal with Scopus Area and Area Group relations
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

        // General Area Details
        journalAreaDetails: {
          select: { area: { select: { area_name: true } } },
        },
        journalAreaGroupDetails: {
          select: { areaGroup: { select: { area_group_name: true } } },
        },
        journalMajorGroupDetails: {
          select: { majorGroup: { select: { major_group_name: true } } },
        },

        // SCOPUS Details (ดึง Area และ Area Group แยกตาม Junction Table)
        journalScopusAreaDetails: {
          select: { scopusArea: { select: { scopus_area_name: true } } },
        },
        journalScopusAreaGroupDetails: {
          select: { scopusAreaGroup: { select: { scopus_area_group_name: true } } },
        },
      },
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // 2. Fetch direct mapping from `journal_area`
    const areaMappings = await prisma.journal_area.findMany({
      where: { journal_title: journal.journal_title },
      select: {
        source: true,
        area: true,
        area_group: true,
        major_group: true,
      },
    });

    const findGroupMapping = (sourceName: string, areaName: string) => {
      const match = areaMappings.find(
        (m) =>
          m.source.toLowerCase() === sourceName.toLowerCase() &&
          m.area?.trim().toLowerCase() === areaName.trim().toLowerCase()
      );

      const sourceFallback = areaMappings.find(
        (m) => m.source.toLowerCase() === sourceName.toLowerCase()
      );

      return {
        area_group: match?.area_group || sourceFallback?.area_group || "—",
        major_group: match?.major_group || sourceFallback?.major_group || "—",
      };
    };

    const defaultAreaGroup =
      journal.journalAreaGroupDetails[0]?.areaGroup?.area_group_name || "—";
    const defaultMajorGroup =
      journal.journalMajorGroupDetails[0]?.majorGroup?.major_group_name || "—";

    // 3. ABDC Breakdown
    const abdcAreas = splitAndClean(journal.abdc?.abdc_area);
    const abdcDetails = journal.abdc
      ? {
          ...journal.abdc,
          area_details: abdcAreas.map((areaName) => {
            const mapping = findGroupMapping("ABDC", areaName);
            return {
              area: areaName,
              area_group:
                mapping.area_group !== "—" ? mapping.area_group : defaultAreaGroup,
              major_group:
                mapping.major_group !== "—"
                  ? mapping.major_group
                  : defaultMajorGroup !== "—"
                  ? defaultMajorGroup
                  : "Business & Commerce",
              rank: journal.abdc?.rating_2025 ?? null,
            };
          }),
        }
      : null;

    // 4. AJG Breakdown
    const ajgAreas = splitAndClean(journal.ajg?.ajg_subject_area);
    const ajgDetails = journal.ajg
      ? {
          ...journal.ajg,
          area_details: ajgAreas.map((areaName) => {
            const mapping = findGroupMapping("AJG", areaName);
            return {
              area: areaName,
              area_group:
                mapping.area_group !== "—" ? mapping.area_group : defaultAreaGroup,
              major_group:
                mapping.major_group !== "—"
                  ? mapping.major_group
                  : defaultMajorGroup !== "—"
                  ? defaultMajorGroup
                  : "Business & Management",
              rank: journal.ajg?.ajg_2024_rating ?? null,
            };
          }),
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
          area_details: scimagoAreas.map((cat) => {
            const mapping = findGroupMapping("Scimago", cat.area);
            return {
              area: cat.area,
              area_group:
                mapping.area_group !== "—" ? mapping.area_group : defaultAreaGroup,
              major_group:
                mapping.major_group !== "—"
                  ? mapping.major_group
                  : defaultMajorGroup !== "—"
                  ? defaultMajorGroup
                  : "General Science",
              rank: cat.rank || journal.scimago?.sjr_best_quartile || null,
            };
          }),
        }
      : null;

    // 6. SCOPUS Breakdown
    // ดึง Area Group ทั้งหมดของ Scopus ที่ผูกกับ Journal นี้ใน DB
    const availableScopusGroups = journal.journalScopusAreaGroupDetails
      .map((d) => d.scopusAreaGroup?.scopus_area_group_name?.trim())
      .filter((name): name is string => Boolean(name));

    const scopusDetails = journal.scopus
      ? {
          ...journal.scopus,
          area_details: journal.journalScopusAreaDetails.map((d) => {
            const rawAreaName = d.scopusArea?.scopus_area_name ?? "—";

            // 1) ตัดรหัสตัวเลข 4 หลักด้านหน้าออก (เช่น "1700 Computer Science" -> "Computer Science")
            const cleanedAreaName = rawAreaName.replace(/^\d+\s*/, "").trim();

            // 2) จับคู่กับ Area Group ของ Scopus ใน DB ที่ดึงมาได้
            const matchedGroup = availableScopusGroups.find((groupName) => {
              const gLower = groupName.toLowerCase();
              const cLower = cleanedAreaName.toLowerCase();
              const rLower = rawAreaName.toLowerCase();

              return (
                gLower === cLower ||
                rLower.includes(gLower) ||
                gLower.includes(cLower)
              );
            });

            // 3) หาจากตาราง journal_area แบบ EXACT match เท่านั้น (ไม่ใช้ Fallback มั่ว)
            const exactJournalAreaMatch = areaMappings.find(
              (m) =>
                m.source.toLowerCase() === "scopus" &&
                m.area?.trim().toLowerCase() === rawAreaName.trim().toLowerCase()
            );

            // ลำดับการเลือก Area Group:
            // - ใช้ค่าที่ Match เจอจาก Scopus Area Groups ใน DB
            // - ถ้าไม่เจอ ใช้ค่าจาก journal_area (เฉพาะตัวที่ Match ตรงกันเป๊ะๆ)
            // - ถ้ายังไม่เจอ ใช้ชื่อ Area ที่ตัดรหัสตัวเลขออกแล้ว (เพราะคือชื่อ Area Group ในตัวมันเอง)
            const finalAreaGroup =
              matchedGroup ||
              exactJournalAreaMatch?.area_group ||
              (cleanedAreaName !== "—" ? cleanedAreaName : "—");

            return {
              area: rawAreaName,
              area_group: finalAreaGroup,
              major_group: "—",
              rank: journal.scopus?.active_status ?? null,
            };
          }),
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