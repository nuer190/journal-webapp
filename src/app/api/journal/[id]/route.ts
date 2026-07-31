import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { journalIdSchema } from "@/lib/validations/journals";

// Helper function
function parseScimagoCategories(categoriesStr: string | null | undefined) {
  if (!categoriesStr || !categoriesStr.trim()) return [];

  return categoriesStr
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/^(.*?)\s*\((Q[1-4])\)$/i);
      if (match) {
        return {
          area: match[1].trim(),
          rank: match[2].toUpperCase(),
        };
      }
      return {
        area: item,
        rank: null,
      };
    });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const { id } = journalIdSchema.parse({ id: rawId });

    const journal = await prisma.jOURNAL_MAIN.findUnique({
      where: { id },
      include: {
        abdc: true,
        ajg: true,
        scimago: true,
        scopus: true,
        note: true,
        journalScopusAreaDetails: {
          select: {
            scopusArea: { select: { scopus_area_name: true } },
          },
        },
        journalScopusAreaGroupDetails: {
          select: { scopusAreaGroup: { select: { scopus_area_group_name: true } } },
        },
        journalScopusMajorGroupDetails: {
          select: { scopusMajorGroup: { select: { scopus_major_group_name: true } } },
        },
      },
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    const scopusAreaGroups = journal.journalScopusAreaGroupDetails.map(
      (d) => d.scopusAreaGroup.scopus_area_group_name
    );
    const scopusMajorGroups = journal.journalScopusMajorGroupDetails.map(
      (d) => d.scopusMajorGroup.scopus_major_group_name
    );

    const parsedScimagoCategories = parseScimagoCategories(
      journal.scimago?.scimago_categories
    );

    return NextResponse.json({
      id: journal.id,
      journal_title: journal.journal_title,
      publisher: journal.publisher,

      // --- ABDC ---
      abdc: journal.abdc
        ? {
            ...journal.abdc,
            area_details: (journal.abdc.abdc_area || "")
              .split(";")
              .map((a) => a.trim())
              .filter(Boolean)
              .map((areaName) => ({
                area: areaName,
                area_group: scopusAreaGroups[0] || areaName,
                major_group: scopusMajorGroups[0] || "Business & Commerce",
                rank: journal.abdc?.rating_2025 ?? null,
              })),
          }
        : null,

      // --- AJG ---
      ajg: journal.ajg
        ? {
            ...journal.ajg,
            area_details: (journal.ajg.ajg_subject_area || "")
              .split(";")
              .map((a) => a.trim())
              .filter(Boolean)
              .map((areaName) => ({
                area: areaName,
                area_group: scopusAreaGroups[0] || areaName,
                major_group: scopusMajorGroups[0] || "Business & Management",
                rank: journal.ajg?.ajg_2024_rating ?? null,
              })),
          }
        : null,

      // --- SCIMAGO ---
      scimago: journal.scimago
        ? {
            ...journal.scimago,
            area_details:
              parsedScimagoCategories.length > 0
                ? parsedScimagoCategories.map((cat, idx) => ({
                    area: cat.area,
                    area_group:
                      scopusAreaGroups[idx] || scopusAreaGroups[0] || cat.area,
                    major_group:
                      scopusMajorGroups[idx] ||
                      scopusMajorGroups[0] ||
                      "General Science",
                    rank: cat.rank || journal.scimago?.sjr_best_quartile || null,
                  }))
                : (journal.scimago.scimago_areas || "")
                    .split(";")
                    .map((a) => a.trim())
                    .filter(Boolean)
                    .map((areaName, idx) => ({
                      area: areaName,
                      area_group:
                        scopusAreaGroups[idx] || scopusAreaGroups[0] || areaName,
                      major_group:
                        scopusMajorGroups[idx] ||
                        scopusMajorGroups[0] ||
                        "General Science",
                      rank: journal.scimago?.sjr_best_quartile || null,
                    })),
          }
        : null,

      // --- SCOPUS ---
      scopus: journal.scopus
        ? {
            active_status: journal.scopus?.active_status ?? null,
            coverage_years: journal.scopus?.coverage_years ?? null,
            source_type: journal.scopus?.source_type ?? null,
            discontinued: journal.scopus?.discontinued ?? null,
            area_details: journal.journalScopusAreaDetails.map(
              (d: any, idx) => ({
                area: d.scopusArea?.scopus_area_name ?? "—",
                area_group:
                  scopusAreaGroups[idx] || scopusAreaGroups[0] || "—",
                major_group:
                  scopusMajorGroups[idx] || scopusMajorGroups[0] || "—",
                rank: d?.rank ?? journal.scopus?.active_status ?? null,
              })
            ),
          }
        : null,

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