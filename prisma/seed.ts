import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import path from "path";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const CSV_DIR = path.join(__dirname, "..", "database");

type CsvRow = Record<string, string>;

function readCsv(filename: string): CsvRow[] {
  const content = readFileSync(path.join(CSV_DIR, filename), "utf-8");
  return parse(content, { 
    columns: true, 
    skip_empty_lines: true, 
    relaxColumnCount: true,
    bom: true // ลบ character BOM ป้องกัน Header ตัวแรกเพี้ยน
  });
}

function cleanString(val: string | undefined | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
}

function emptyToNull(val: string | undefined): string | null {
  return cleanString(val);
}

function toInt(val: string | undefined): number | null {
  const v = emptyToNull(val);
  if (v === null) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

async function seedJournalMain() {
  const rows = readCsv("ABDC_DB.csv");
  for (const row of rows) {
    const id = parseInt(row.id, 10);
    if (isNaN(id)) continue;
    await prisma.jOURNAL_MAIN.upsert({
      where: { id },
      update: {
        journal_title: row.journal_title?.trim() ?? "",
        publisher: emptyToNull(row.publisher),
      },
      create: {
        id,
        journal_title: row.journal_title?.trim() ?? "",
        publisher: emptyToNull(row.publisher),
      },
    });
  }
  console.log(`Seeded ${rows.length} JOURNAL_MAIN rows`);
}

async function seedAbdc() {
  const rows = readCsv("ABDC_DB.csv");
  for (const row of rows) {
    const id = parseInt(row.id, 10);
    if (isNaN(id)) continue;
    await prisma.aBDC_DB.upsert({
      where: { id },
      update: {
        issn_print: emptyToNull(row.issn_print),
        issn_online: emptyToNull(row.issn_online),
        year_inception: toInt(row.year_inception),
        for_code: toInt(row.for_code),
        abdc_area: emptyToNull(row.abdc_area),
        rating_2025: emptyToNull(row.rating_2025),
        notes: emptyToNull(row.notes),
      },
      create: {
        id,
        issn_print: emptyToNull(row.issn_print),
        issn_online: emptyToNull(row.issn_online),
        year_inception: toInt(row.year_inception),
        for_code: toInt(row.for_code),
        abdc_area: emptyToNull(row.abdc_area),
        rating_2025: emptyToNull(row.rating_2025),
        notes: emptyToNull(row.notes),
      },
    });
  }
  console.log(`Seeded ${rows.length} ABDC_DB rows`);
}

async function seedAjg() {
  const rows = readCsv("AJG_DB.csv");
  for (const row of rows) {
    const id = parseInt(row.id, 10);
    if (isNaN(id)) continue;
    await prisma.aJG_DB.upsert({
      where: { id },
      update: {
        ajg_match_key: emptyToNull(row.ajg_match_key),
        ajg_issn: emptyToNull(row.ajg_issn),
        ajg_title: emptyToNull(row.ajg_title),
        ajg_subject_area: emptyToNull(row.ajg_subject_area),
        ajg_2024_rating: emptyToNull(row.ajg_2024_rating),
      },
      create: {
        id,
        ajg_match_key: emptyToNull(row.ajg_match_key),
        ajg_issn: emptyToNull(row.ajg_issn),
        ajg_title: emptyToNull(row.ajg_title),
        ajg_subject_area: emptyToNull(row.ajg_subject_area),
        ajg_2024_rating: emptyToNull(row.ajg_2024_rating),
      },
    });
  }
  console.log(`Seeded ${rows.length} AJG_DB rows`);
}

async function seedScimago() {
  const rows = readCsv("SCIMAGO_DB.csv");
  for (const row of rows) {
    const id = parseInt(row.id, 10);
    if (isNaN(id)) continue;
    await prisma.sCIMAGO_DB.upsert({
      where: { id },
      update: {
        scimago_match_key: emptyToNull(row.scimago_match_key),
        scimago_issn: emptyToNull(row.scimago_issn),
        scimago_eissn: emptyToNull(row.scimago_eissn),
        scimago_title: emptyToNull(row.Scimago_Title),
        sjr_best_quartile: emptyToNull(row.SJR_Best_Quartile),
        scimago_categories: emptyToNull(row.Scimago_Categories),
        scimago_areas: emptyToNull(row.Scimago_Areas),
      },
      create: {
        id,
        scimago_match_key: emptyToNull(row.scimago_match_key),
        scimago_issn: emptyToNull(row.scimago_issn),
        scimago_eissn: emptyToNull(row.scimago_eissn),
        scimago_title: emptyToNull(row.Scimago_Title),
        sjr_best_quartile: emptyToNull(row.SJR_Best_Quartile),
        scimago_categories: emptyToNull(row.Scimago_Categories),
        scimago_areas: emptyToNull(row.Scimago_Areas),
      },
    });
  }
  console.log(`Seeded ${rows.length} SCIMAGO_DB rows`);
}

async function seedScopus() {
  const rows = readCsv("SCOPUS_DB.csv");

  for (const row of rows) {
    const id = parseInt(row.id, 10);
    if (isNaN(id)) continue;

    await prisma.sCOPUS_DB.upsert({
      where: { id },
      update: {
        scopus_match_key: emptyToNull(row.scopus_match_key),
        scopus_issn: emptyToNull(row.scopus_issn),
        scopus_eissn: emptyToNull(row.scopus_eissn),
        scopus_title: emptyToNull(row.scopus_title),
        active_status: emptyToNull(row.active_status),
        coverage_years: emptyToNull(row.coverage_years),
        discontinued: emptyToNull(row.discontinued),
        source_type: emptyToNull(row.source_type),
      },
      create: {
        id,
        scopus_match_key: emptyToNull(row.scopus_match_key),
        scopus_issn: emptyToNull(row.scopus_issn),
        scopus_eissn: emptyToNull(row.scopus_eissn),
        scopus_title: emptyToNull(row.scopus_title),
        active_status: emptyToNull(row.active_status),
        coverage_years: emptyToNull(row.coverage_years),
        discontinued: emptyToNull(row.discontinued),
        source_type: emptyToNull(row.source_type),
      },
    });
  }
  console.log(`Seeded ${rows.length} SCOPUS_DB rows`);
}

async function seedNote() {
  const rows = readCsv("NOTE_DB.csv");
  for (const row of rows) {
    const id = parseInt(row.id, 10);
    if (isNaN(id)) continue;
    await prisma.nOTE_DB.upsert({
      where: { id },
      update: {
        note_primary: emptyToNull(row.note_primary),
        note_secondary_1: emptyToNull(row.note_secondary_1),
        note_secondary_2: emptyToNull(row.note_secondary_2),
        note_secondary_3: emptyToNull(row.note_secondary_3),
        adjustment_reason: emptyToNull(row.adjustment_reason),
      },
      create: {
        id,
        note_primary: emptyToNull(row.note_primary),
        note_secondary_1: emptyToNull(row.note_secondary_1),
        note_secondary_2: emptyToNull(row.note_secondary_2),
        note_secondary_3: emptyToNull(row.note_secondary_3),
        adjustment_reason: emptyToNull(row.adjustment_reason),
      },
    });
  }
  console.log(`Seeded ${rows.length} NOTE_DB rows`);
}

async function seedJournalArea() {
  const rows = readCsv("journal_area.csv");
  const validRows = rows.filter(row => row && Object.keys(row).length > 0);

  const data = validRows.map(row => ({
    journal_title: row.journal_title?.trim() ?? "", 
    issn_print: cleanString(row.issn_print),
    issn_online: cleanString(row.issn_online),
    source: row.source?.trim() ?? "",
    area: cleanString(row.area),
    rank: cleanString(row.rank),
    active_status: cleanString(row.active_status),
    source_type: cleanString(row.source_type),
    best_rank: cleanString(row.best_rank),
    area_group: cleanString(row.area_group),
    major_group: row.major_group?.trim() ?? "",
  }));

  await prisma.journal_area.createMany({ 
    data,
    skipDuplicates: true,
  });
  
  console.log(`Seeded ${data.length} journal_area rows`);
}

async function seedArea() {
  const rows = readCsv("journal_area.csv");
  const uniqueAreas = new Set<string>();
  
  for (const row of rows) {
    const area = cleanString(row.area);
    if (area) {
      uniqueAreas.add(area);
    }
  }
  
  await prisma.aREA.createMany({
    data: Array.from(uniqueAreas).map(areaName => ({ area_name: areaName })),
    skipDuplicates: true,
  });
  
  console.log(`Seeded ${uniqueAreas.size} AREA rows`);
}

async function seedJournalAreaDetail() {
  const rows = readCsv("journal_area.csv");
  
  const journals = await prisma.jOURNAL_MAIN.findMany({
    select: { id: true, journal_title: true },
  });
  const titleToId = new Map(
    journals.filter(j => j.journal_title).map(j => [j.journal_title.trim(), j.id])
  );
  
  const areas = await prisma.aREA.findMany({
    select: { area_id: true, area_name: true },
  });
  const nameToId = new Map(
    areas.filter(a => a.area_name).map(a => [a.area_name.trim(), a.area_id])
  );
  
  const pairs = new Set<string>();
  const data = [];
  
  for (const row of rows) {
    const title = row.journal_title?.trim();
    const area = cleanString(row.area);
    
    if (!title || !area) continue;
    
    const journalId = titleToId.get(title);
    const areaId = nameToId.get(area);
    
    if (!journalId || !areaId) continue;
    
    const pairKey = `${journalId}-${areaId}`;
    if (pairs.has(pairKey)) continue;
    
    pairs.add(pairKey);
    data.push({
      journal_id: journalId,
      area_id: areaId,
    });
  }
  
  if (data.length > 0) {
    await prisma.jOURNAL_AREA_DETAIL.createMany({
      data,
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${data.length} JOURNAL_AREA_DETAIL rows`);
}

async function seedAreaGroup() {
  const rows = readCsv("journal_area.csv");
  const uniqueAreaGroups = new Set<string>();
  
  for (const row of rows) {
    const areaGroup = cleanString(row.area_group);
    if (areaGroup) {
      uniqueAreaGroups.add(areaGroup);
    }
  }
  
  await prisma.aREA_GROUP.createMany({
    data: Array.from(uniqueAreaGroups).map(name => ({ area_group_name: name })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${uniqueAreaGroups.size} AREA_GROUP rows`);
}

async function seedJournalAreaGroupDetail() {
  const rows = readCsv("journal_area.csv");
  
  const journals = await prisma.jOURNAL_MAIN.findMany({
    select: { id: true, journal_title: true },
  });
  const titleToId = new Map(
    journals.filter(j => j.journal_title).map(j => [j.journal_title.trim(), j.id])
  );
  
  const areaGroups = await prisma.aREA_GROUP.findMany({
    select: { area_group_id: true, area_group_name: true },
  });
  const nameToId = new Map(
    areaGroups.filter(ag => ag.area_group_name).map(ag => [ag.area_group_name.trim(), ag.area_group_id])
  );
  
  const pairs = new Set<string>();
  const data = [];
  
  for (const row of rows) {
    const title = row.journal_title?.trim();
    const areaGroup = cleanString(row.area_group);
    
    if (!title || !areaGroup) continue;
    
    const journalId = titleToId.get(title);
    const areaGroupId = nameToId.get(areaGroup);
    
    if (!journalId || !areaGroupId) continue;
    
    const pairKey = `${journalId}-${areaGroupId}`;
    if (pairs.has(pairKey)) continue;
    
    pairs.add(pairKey);
    data.push({
      journal_id: journalId,
      area_group_id: areaGroupId,
    });
  }
  
  if (data.length > 0) {
    await prisma.jOURNAL_AREA_GROUP_DETAIL.createMany({
      data,
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${data.length} JOURNAL_AREA_GROUP_DETAIL rows`);
}

async function seedMajorGroup() {
  const rows = readCsv("journal_area.csv");
  const uniqueMajorGroups = new Set<string>();
  
  for (const row of rows) {
    const majorGroup = cleanString(row.major_group);
    if (majorGroup) {
      uniqueMajorGroups.add(majorGroup);
    }
  }
  
  await prisma.mAJOR_GROUP.createMany({
    data: Array.from(uniqueMajorGroups).map(name => ({ major_group_name: name })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${uniqueMajorGroups.size} MAJOR_GROUP rows`);
}

async function seedJournalMajorGroupDetail() {
  const rows = readCsv("journal_area.csv");
  
  const journals = await prisma.jOURNAL_MAIN.findMany({
    select: { id: true, journal_title: true },
  });
  const titleToId = new Map(
    journals.filter(j => j.journal_title).map(j => [j.journal_title.trim(), j.id])
  );
  
  const majorGroups = await prisma.mAJOR_GROUP.findMany({
    select: { major_group_id: true, major_group_name: true },
  });
  const nameToId = new Map(
    majorGroups.filter(mg => mg.major_group_name).map(mg => [mg.major_group_name.trim(), mg.major_group_id])
  );
  
  const pairs = new Set<string>();
  const data = [];
  
  for (const row of rows) {
    const title = row.journal_title?.trim();
    const majorGroup = cleanString(row.major_group);
    
    if (!title || !majorGroup) continue;
    
    const journalId = titleToId.get(title);
    const majorGroupId = nameToId.get(majorGroup);
    
    if (!journalId || !majorGroupId) continue;
    
    const pairKey = `${journalId}-${majorGroupId}`;
    if (pairs.has(pairKey)) continue;
    
    pairs.add(pairKey);
    data.push({
      journal_id: journalId,
      major_group_id: majorGroupId,
    });
  }
  
  if (data.length > 0) {
    await prisma.jOURNAL_MAJOR_GROUP_DETAIL.createMany({
      data,
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${data.length} JOURNAL_MAJOR_GROUP_DETAIL rows`);
}

async function seedScopusArea() {
  const rows = readCsv("SCOPUS_DB.csv");

  const asjcColumns: Record<string, string> = {
    asjc_1000_general: "1000 General",
    asjc_1100_agricultural_and_biological_sciences: "1100 Agricultural and Biological Sciences",
    asjc_1200_arts_and_humanities: "1200 Arts and Humanities",
    asjc_1300_biochemistry_genetics_molecular_biology: "1300 Biochemistry, Genetics and Molecular Biology",
    asjc_1400_business_management_accounting: "1400 Business, Management and Accounting",
    asjc_1500_chemical_engineering: "1500 Chemical Engineering",
    asjc_1600_chemistry: "1600 Chemistry",
    asjc_1700_computer_science: "1700 Computer Science",
    asjc_1800_decision_sciences: "1800 Decision Sciences",
    asjc_1900_earth_and_planetary_sciences: "1900 Earth and Planetary Sciences",
    asjc_2000_economics_econometrics_finance: "2000 Economics, Econometrics and Finance",
    asjc_2100_energy: "2100 Energy",
    asjc_2200_engineering: "2200 Engineering",
    asjc_2300_environmental_science: "2300 Environmental Science",
    asjc_2400_immunology_and_microbiology: "2400 Immunology and Microbiology",
    asjc_2500_materials_science: "2500 Materials Science",
    asjc_2600_mathematics: "2600 Mathematics",
    asjc_2700_medicine: "2700 Medicine",
    asjc_2800_neuroscience: "2800 Neuroscience",
    asjc_2900_nursing: "2900 Nursing",
    asjc_3000_pharmacology_toxicology_pharmaceutics: "3000 Pharmacology, Toxicology and Pharmaceutics",
    asjc_3100_physics_and_astronomy: "3100 Physics and Astronomy",
    asjc_3200_psychology: "3200 Psychology",
    asjc_3300_social_sciences: "3300 Social Sciences",
    asjc_3400_veterinary: "3400 Veterinary",
    asjc_3500_dentistry: "3500 Dentistry",
    asjc_3600_health_professions: "3600 Health Professions",
  };

  const uniqueAreas = new Set<string>();

  for (const row of rows) {
    for (const [col, areaName] of Object.entries(asjcColumns)) {
      if (emptyToNull(row[col])) {
        uniqueAreas.add(areaName);
      }
    }
  }

  await prisma.sCOPUS_AREA.createMany({
    data: Array.from(uniqueAreas).map(areaName => ({ scopus_area_name: areaName })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${uniqueAreas.size} SCOPUS_AREA rows`);
}

async function seedScopusAreaGroup() {
  const rows = readCsv("SCOPUS_DB.csv");

  const topLevelColumns: Record<string, string> = {
    top_level_life_sciences: "Life Sciences",
    top_level_social_sciences: "Social Sciences",
    top_level_physical_sciences: "Physical Sciences",
    top_level_health_sciences: "Health Sciences",
  };

  const uniqueAreaGroups = new Set<string>();

  for (const row of rows) {
    for (const [col, groupName] of Object.entries(topLevelColumns)) {
      if (emptyToNull(row[col])) {
        uniqueAreaGroups.add(groupName);
      }
    }
  }

  await prisma.sCOPUS_AREA_GROUP.createMany({
    data: Array.from(uniqueAreaGroups).map(name => ({ scopus_area_group_name: name })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${uniqueAreaGroups.size} SCOPUS_AREA_GROUP rows`);
}

async function seedScopusMajorGroup() {
  const rows = readCsv("journal_area.csv");
  const uniqueMajorGroups = new Set<string>();

  for (const row of rows) {
    if (row.source?.trim() !== "Scopus") continue;
    const majorGroup = cleanString(row.major_group);
    if (majorGroup) {
      uniqueMajorGroups.add(majorGroup);
    }
  }

  await prisma.sCOPUS_MAJOR_GROUP.createMany({
    data: Array.from(uniqueMajorGroups).map(name => ({ scopus_major_group_name: name })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${uniqueMajorGroups.size} SCOPUS_MAJOR_GROUP rows`);
}

async function seedJournalScopusAreaDetail() {
  const rows = readCsv("SCOPUS_DB.csv");

  const asjcColumns: Record<string, string> = {
    asjc_1000_general: "1000 General",
    asjc_1100_agricultural_and_biological_sciences: "1100 Agricultural and Biological Sciences",
    asjc_1200_arts_and_humanities: "1200 Arts and Humanities",
    asjc_1300_biochemistry_genetics_molecular_biology: "1300 Biochemistry, Genetics and Molecular Biology",
    asjc_1400_business_management_accounting: "1400 Business, Management and Accounting",
    asjc_1500_chemical_engineering: "1500 Chemical Engineering",
    asjc_1600_chemistry: "1600 Chemistry",
    asjc_1700_computer_science: "1700 Computer Science",
    asjc_1800_decision_sciences: "1800 Decision Sciences",
    asjc_1900_earth_and_planetary_sciences: "1900 Earth and Planetary Sciences",
    asjc_2000_economics_econometrics_finance: "2000 Economics, Econometrics and Finance",
    asjc_2100_energy: "2100 Energy",
    asjc_2200_engineering: "2200 Engineering",
    asjc_2300_environmental_science: "2300 Environmental Science",
    asjc_2400_immunology_and_microbiology: "2400 Immunology and Microbiology",
    asjc_2500_materials_science: "2500 Materials Science",
    asjc_2600_mathematics: "2600 Mathematics",
    asjc_2700_medicine: "2700 Medicine",
    asjc_2800_neuroscience: "2800 Neuroscience",
    asjc_2900_nursing: "2900 Nursing",
    asjc_3000_pharmacology_toxicology_pharmaceutics: "3000 Pharmacology, Toxicology and Pharmaceutics",
    asjc_3100_physics_and_astronomy: "3100 Physics and Astronomy",
    asjc_3200_psychology: "3200 Psychology",
    asjc_3300_social_sciences: "3300 Social Sciences",
    asjc_3400_veterinary: "3400 Veterinary",
    asjc_3500_dentistry: "3500 Dentistry",
    asjc_3600_health_professions: "3600 Health Professions",
  };

  const areas = await prisma.sCOPUS_AREA.findMany({
    select: { scopus_area_id: true, scopus_area_name: true },
  });
  const nameToId = new Map(
    areas.filter(a => a.scopus_area_name).map(a => [a.scopus_area_name.trim(), a.scopus_area_id])
  );

  const pairs = new Set<string>();
  const data = [];

  for (const row of rows) {
    const journalId = parseInt(row.id, 10);
    if (isNaN(journalId)) continue;

    for (const [col, areaName] of Object.entries(asjcColumns)) {
      if (!emptyToNull(row[col])) continue;

      const areaId = nameToId.get(areaName);
      if (!areaId) continue;

      const pairKey = `${journalId}-${areaId}`;
      if (pairs.has(pairKey)) continue;

      pairs.add(pairKey);
      data.push({
        journal_id: journalId,
        scopus_area_id: areaId,
      });
    }
  }

  if (data.length > 0) {
    await prisma.jOURNAL_SCOPUS_AREA_DETAIL.createMany({
      data,
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${data.length} JOURNAL_SCOPUS_AREA_DETAIL rows`);
}

async function seedJournalScopusAreaGroupDetail() {
  const rows = readCsv("SCOPUS_DB.csv");

  const topLevelColumns: Record<string, string> = {
    top_level_life_sciences: "Life Sciences",
    top_level_social_sciences: "Social Sciences",
    top_level_physical_sciences: "Physical Sciences",
    top_level_health_sciences: "Health Sciences",
  };

  const areaGroups = await prisma.sCOPUS_AREA_GROUP.findMany({
    select: { scopus_area_group_id: true, scopus_area_group_name: true },
  });
  const nameToId = new Map(
    areaGroups.filter(ag => ag.scopus_area_group_name).map(ag => [ag.scopus_area_group_name.trim(), ag.scopus_area_group_id])
  );

  const pairs = new Set<string>();
  const data = [];

  for (const row of rows) {
    const journalId = parseInt(row.id, 10);
    if (isNaN(journalId)) continue;

    for (const [col, groupName] of Object.entries(topLevelColumns)) {
      if (!emptyToNull(row[col])) continue;

      const areaGroupId = nameToId.get(groupName);
      if (!areaGroupId) continue;

      const pairKey = `${journalId}-${areaGroupId}`;
      if (pairs.has(pairKey)) continue;

      pairs.add(pairKey);
      data.push({
        journal_id: journalId,
        scopus_area_group_id: areaGroupId,
      });
    }
  }

  if (data.length > 0) {
    await prisma.jOURNAL_SCOPUS_AREA_GROUP_DETAIL.createMany({
      data,
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${data.length} JOURNAL_SCOPUS_AREA_GROUP_DETAIL rows`);
}

async function seedJournalScopusMajorGroupDetail() {
  const rows = readCsv("journal_area.csv");

  const journals = await prisma.jOURNAL_MAIN.findMany({
    select: { id: true, journal_title: true },
  });
  const titleToId = new Map(
    journals.filter(j => j.journal_title).map(j => [j.journal_title.trim(), j.id])
  );

  const majorGroups = await prisma.sCOPUS_MAJOR_GROUP.findMany({
    select: { scopus_major_group_id: true, scopus_major_group_name: true },
  });
  const nameToId = new Map(
    majorGroups.filter(mg => mg.scopus_major_group_name).map(mg => [mg.scopus_major_group_name.trim(), mg.scopus_major_group_id])
  );

  const pairs = new Set<string>();
  const data = [];

  for (const row of rows) {
    if (row.source?.trim() !== "Scopus") continue;

    const title = row.journal_title?.trim();
    const majorGroup = cleanString(row.major_group);

    if (!title || !majorGroup) continue;

    const journalId = titleToId.get(title);
    const majorGroupId = nameToId.get(majorGroup);

    if (!journalId || !majorGroupId) continue;

    const pairKey = `${journalId}-${majorGroupId}`;
    if (pairs.has(pairKey)) continue;

    pairs.add(pairKey);
    data.push({
      journal_id: journalId,
      scopus_major_group_id: majorGroupId,
    });
  }

  if (data.length > 0) {
    await prisma.jOURNAL_SCOPUS_MAJOR_GROUP_DETAIL.createMany({
      data,
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${data.length} JOURNAL_SCOPUS_MAJOR_GROUP_DETAIL rows`);
}

async function main() {
  console.log("Seeding database...");
  await seedJournalMain();
  await seedAbdc();
  await seedAjg();
  await seedScimago();
  await seedScopus();
  await seedNote();
  await seedJournalArea();
  await seedArea();
  await seedJournalAreaDetail();
  await seedAreaGroup();
  await seedJournalAreaGroupDetail();
  await seedMajorGroup();
  await seedJournalMajorGroupDetail();
  await seedScopusArea();
  await seedScopusAreaGroup();
  await seedScopusMajorGroup();
  await seedJournalScopusAreaDetail();
  await seedJournalScopusAreaGroupDetail();
  await seedJournalScopusMajorGroupDetail();
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());