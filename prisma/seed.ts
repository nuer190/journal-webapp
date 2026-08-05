import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { SCOPUS_AREA_COLUMNS } from "./constants/areaMapping";
import { ABDC_FOR_MAPPING } from "./constants/areaMapping";
import path from "path";
import pg from "pg";
import * as XLSX from "xlsx";
import cliProgress from 'cli-progress';

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

function getJournalTitle(row: CsvRow): string {
  const raw = row.journal_title || row.Journal_Title || row["Journal Title"] || row.journalTitle || row.title || "";
  return raw.trim();
}

async function seedJournalArea() {
  const rows = readCsv("journal_area.csv");
  const validRows = rows.filter(row => row && Object.keys(row).length > 0);

  const data = validRows.map(row => {
    const rawTitle = row.journal_title || row.Journal_Title || row["Journal Title"] || row.journalTitle || row.title || "";
    
    return {
      journal_title: rawTitle.trim(), 
      issn_print: cleanString(row.issn_print || row.ISSN_Print || row["ISSN Print"]),
      issn_online: cleanString(row.issn_online || row.ISSN_Online || row["ISSN Online"]),
      source: (row.source || row.Source || "").trim(),
      area: cleanString(row.area || row.Area),
      rank: cleanString(row.rank || row.Rank),
      active_status: cleanString(row.active_status || row["Active Status"]),
      source_type: cleanString(row.source_type || row["Source Type"]),
      best_rank: cleanString(row.best_rank || row["Best Rank"]),
      area_group: cleanString(row.area_group || row["Area Group"]),
      major_group: (row.major_group || row["Major Group"] || "").trim(),
    };
  });

  const filteredData = data.filter(item => item.journal_title !== "");

  await prisma.journal_area.createMany({ 
    data: filteredData,
    skipDuplicates: true,
  });
  
  console.log(`Seeded ${filteredData.length} journal_area rows`);
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

// ==========================================
// FILE PATHS & CONSTANTS
// ==========================================
const FILE_PATHS = {
  ABDC: 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\ABDC.xlsx',
  SCOPUS: 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\ext_list_May_2026.xlsx',
  SCIMAGO: 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\Scimagojr2025.xlsx',
  AJG: 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\JQL-72_subject.xlsx',
};

const FOR_MAPPING: Record<number, string> = {
  3501: "Accounting, auditing and accountability",
  3502: "Banking, finance and investment",
  3503: "Business systems in context",
  3504: "Commercial services",
  3505: "Human resources and industrial relations",
  3506: "Marketing",
  3507: "Strategy, management and organisational behaviour",
  3508: "Tourism",
  3509: "Transportation, logistics and supply chains",
  3599: "Other commerce, management, tourism and services",
  3801: "Applied economics",
  3802: "Econometrics",
  3803: "Economic history",
  3899: "Other economics",
  4609: "Information systems",
  4801: "Commercial law",
  4905: "Statistics"
};

// ==========================================
// AREA GROUP & MAJOR GROUP MAPPINGS
// ==========================================
const AREA_GROUP_MAP: Record<string, string[]> = {
  "Business, Management and Accounting": [
    "Accounting", "Business, Management and Accounting", "Business and International Management",
    "Business, Management and Accounting (miscellaneous)", "General Business, Management and Accounting",
    "Strategy, management and organisational behaviour", "Industrial Relations", "Management Information Systems",
    "Management of Technology and Innovation", "Marketing", "Human Resource Management",
    "Accounting, auditing and accountability", "Organizational Behavior and Human Resource Management",
    "Organization Behavior/Studies", "Strategy and Management", "HRM/IR",
    "Tourism, Leisure and Hospitality Management", "Tourism", "Entrepreneurship"
  ],
  "Agricultural and Biological Sciences": [
    "Agricultural and Biological Sciences (miscellaneous)", "Agricultural and Biological Sciences",
    "Agronomy and Crop Science", "Animal Science and Zoology", "Aquatic Science",
    "Ecology, Evolution, Behavior and Systematics", "Food Science", "Forestry",
    "General Agricultural and Biological Sciences", "Horticulture", "Insect Science",
    "Plant Science", "Soil Science"
  ],
  "Arts and Humanities": [
    "Archeology (arts and humanities)", "Arts and Humanities (miscellaneous)", "Classics", "Conservation",
    "General Arts and Humanities", "Business History", "Arts and Humanities", "History",
    "History and Philosophy of Science", "Language and Linguistics", "Literature and Literary Theory",
    "Museology", "Music", "Philosophy", "Religious Studies", "Visual Arts and Performing Arts"
  ],
  "Biochemistry, Genetics and Molecular Biology": [
    "Aging", "Biochemistry", "Biochemistry, Genetics and Molecular Biology (miscellaneous)", "Biophysics",
    "Biotechnology", "Biochemistry, Genetics and Molecular Biology", "Cancer Research", "Cell Biology",
    "Clinical Biochemistry", "Developmental Biology", "Endocrinology",
    "General Biochemistry, Genetics and Molecular Biology", "Genetics", "Molecular Biology",
    "Molecular Medicine", "Physiology", "Structural Biology"
  ],
  "Chemical Engineering": [
    "Bioengineering", "Catalysis", "Chemical Engineering (miscellaneous)", "Chemical Engineering",
    "Chemical Health and Safety", "Colloid and Surface Chemistry", "Filtration and Separation",
    "Fluid Flow and Transfer Processes", "General Chemical Engineering", "Process Chemistry and Technology"
  ],
  "Chemistry": [
    "Analytical Chemistry", "Chemistry (miscellaneous)", "Electrochemistry", "General Chemistry",
    "Inorganic Chemistry", "Organic Chemistry", "Physical and Theoretical Chemistry", "Spectroscopy"
  ],
  "Computer Science": [
    "Artificial Intelligence", "Computational Theory and Mathematics", "Computer Graphics and Computer-Aided Design",
    "Computer Networks and Communications", "Computer Science (miscellaneous)", "Computer Science",
    "Computer Science Applications", "Computer Vision and Pattern Recognition", "General Computer Science",
    "Hardware and Architecture", "Human-Computer Interaction", "Information Systems", "Information systems",
    "Signal Processing", "Software"
  ],
  "Decision Sciences": [
    "Decision Sciences (miscellaneous)", "Management Science", "General Decision Sciences",
    "Production & Operations Management", "Decision Sciences", "Operations Research",
    "Information Systems and Management", "Management Science and Operations Research",
    "Statistics, Probability and Uncertainty"
  ],
  "Dentistry": [
    "Dental Assisting", "Dental Hygiene", "Dentistry (miscellaneous)", "General Dentistry",
    "Oral Surgery", "Orthodontics", "Periodontics"
  ],
  "Earth and Planetary Sciences": [
    "Atmospheric Science", "Computers in Earth Sciences", "Earth and Planetary Sciences (miscellaneous)",
    "Earth and Planetary Sciences", "Earth-Surface Processes", "Economic Geology", "General Earth and Planetary Sciences",
    "Geochemistry and Petrology", "Geology", "Geophysics", "Geotechnical Engineering and Engineering Geology",
    "Oceanography", "Paleontology", "Space and Planetary Science", "Stratigraphy"
  ],
  "Economics, Econometrics and Finance": [
    "Economics and Econometrics", "Economics, Econometrics and Finance (miscellaneous)",
    "Economics, Econometrics and Finance", "Finance", "General Economics, Econometrics and Finance",
    "Economics", "Finance & Accounting", "Economic history", "Other economics",
    "Banking, finance and investment", "Econometrics", "Applied economics", "Economics;"
  ],
  "Energy": [
    "Energy (miscellaneous)", "Energy Engineering and Power Technology", "Fuel Technology",
    "General Energy", "Energy", "Nuclear Energy and Engineering", "Renewable Energy, Sustainability and the Environment"
  ],
  "Engineering": [
    "Aerospace Engineering", "Architecture", "Engineering", "Automotive Engineering", "Biomedical Engineering",
    "Building and Construction", "Civil and Structural Engineering", "Computational Mechanics",
    "Control and Systems Engineering", "Electrical and Electronic Engineering", "Engineering (miscellaneous)",
    "General Engineering", "Environmental Science", "Industrial and Manufacturing Engineering",
    "Mechanical Engineering", "Mechanics of Materials", "Media Technology", "Ocean Engineering",
    "Safety, Risk, Reliability and Quality", "Operations Research & Management Science"
  ],
  "Environmental Science": [
    "Ecological Modeling", "Ecology", "Environmental Chemistry", "Environmental Engineering",
    "Environmental Science (miscellaneous)", "General Environmental Science", "Global and Planetary Change",
    "Health, Toxicology and Mutagenesis", "Management, Monitoring, Policy and Law",
    "Nature and Landscape Conservation", "Pollution", "Waste Management and Disposal",
    "Water Science and Technology"
  ],
  "Health Professions": [
    "Chiropractics", "Complementary and Manual Therapy", "Emergency Medical Services", "General Health Professions",
    "Health Information Management", "Health Professions (miscellaneous)", "Medical Assisting and Transcription",
    "Medical Laboratory Technology", "Medical Terminology", "Occupational Therapy", "Sports Science",
    "Health Professions", "Optometry", "Pharmacy", "Physical Therapy, Sports Therapy and Rehabilitation",
    "Podiatry", "Radiological and Ultrasound Technology", "Respiratory Care", "Speech and Hearing"
  ],
  "Immunology and Microbiology": [
    "Applied Microbiology and Biotechnology", "General Immunology and Microbiology", "Immunology",
    "Immunology and Microbiology (miscellaneous)", "Microbiology", "Parasitology", "Virology"
  ],
  "Materials Science": [
    "Biomaterials", "Ceramics and Composites", "Electronic, Optical and Magnetic Materials",
    "General Materials Science", "Materials Chemistry", "Materials Science (miscellaneous)",
    "Metals and Alloys", "Polymers and Plastics", "Surfaces, Coatings and Films"
  ],
  "Mathematics": [
    "Algebra and Number Theory", "Analysis", "Applied Mathematics", "Mathematics", "Computational Mathematics",
    "Control and Optimization", "Discrete Mathematics and Combinatorics", "General Mathematics",
    "Geometry and Topology", "Logic", "Mathematical Physics", "Mathematics (miscellaneous)",
    "Modeling and Simulation", "Numerical Analysis", "Statistics and Probability",
    "Theoretical Computer Science", "Statistics"
  ],
  "Medicine": [
    "Anatomy", "Anesthesiology and Pain Medicine", "Biochemistry (medical)", "Cardiology and Cardiovascular Medicine",
    "Complementary and Alternative Medicine", "Critical Care and Intensive Care Medicine", "Dermatology",
    "Drug Guides", "Medicine", "Embryology", "Emergency Medicine", "Endocrinology, Diabetes and Metabolism",
    "Epidemiology", "Family Practice", "Gastroenterology", "General Medicine", "Genetics (clinical)",
    "Geriatrics and Gerontology", "Health Informatics", "Health Policy", "Hematology", "Hepatology",
    "Histology", "Immunology and Allergy", "Infectious Diseases", "Internal Medicine",
    "Medicine (miscellaneous)", "Microbiology (medical)", "Nephrology", "Neurology (clinical)",
    "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Orthopedics and Sports Medicine",
    "Otorhinolaryngology", "Pathology and Forensic Medicine", "Pediatrics, Perinatology and Child Health",
    "Pharmacology (medical)", "Physiology (medical)", "Psychiatry and Mental Health",
    "Public Health, Environmental and Occupational Health", "Pulmonary and Respiratory Medicine",
    "Radiology, Nuclear Medicine and Imaging", "Rehabilitation", "Reproductive Medicine",
    "Reviews and References (medical)", "Rheumatology", "Surgery", "Transplantation", "Urology"
  ],
  "Multidisciplinary": ["Multidisciplinary"],
  "Neuroscience": [
    "Behavioral Neuroscience", "Biological Psychiatry", "Cellular and Molecular Neuroscience",
    "Cognitive Neuroscience", "Developmental Neuroscience", "Endocrine and Autonomic Systems",
    "General Neuroscience", "Neurology", "Neuroscience (miscellaneous)", "Neuroscience", "Sensory Systems"
  ],
  "Nursing": [
    "Advanced and Specialized Nursing", "Assessment and Diagnosis", "Care Planning", "Community and Home Care",
    "Critical Care Nursing", "Emergency Nursing", "Fundamentals and Skills", "General Nursing", "Gerontology",
    "Issues, Ethics and Legal Aspects", "LPN and LVN", "Leadership and Management", "Maternity and Midwifery",
    "Medical and Surgical Nursing", "Nurse Assisting", "Nursing", "Nursing (miscellaneous)", "Nutrition and Dietetics",
    "Oncology (nursing)", "Pathophysiology", "Pediatrics", "Pharmacology (nursing)", "Psychiatric Mental Health",
    "Research and Theory", "Review and Exam Preparation"
  ],
  "Pharmacology, Toxicology and Pharmaceutics": [
    "Drug Discovery", "General Pharmacology, Toxicology and Pharmaceutics",
    "Pharmacology, Toxicology and Pharmaceutics", "Pharmaceutical Science", "Pharmacology",
    "Pharmacology, Toxicology and Pharmaceutics (miscellaneous)", "Toxicology"
  ],
  "Physics and Astronomy": [
    "Acoustics and Ultrasonics", "Astronomy and Astrophysics", "Atomic and Molecular Physics, and Optics",
    "Condensed Matter Physics", "General Physics and Astronomy", "Instrumentation",
    "Nuclear and High Energy Physics", "Physics and Astronomy (miscellaneous)", "Radiation",
    "Statistical and Nonlinear Physics", "Surfaces and Interfaces"
  ],
  "Psychology": [
    "Applied Psychology", "Clinical Psychology", "Developmental and Educational Psychology",
    "Experimental and Cognitive Psychology", "General Psychology",
    "Neuropsychology and Physiological Psychology", "Psychology (miscellaneous)", "Social Psychology",
    "Psychology, Organization Behavior/Studies", "Psychology"
  ],
  "Social Sciences": [
    "Anthropology", "Archeology", "Communication", "Cultural Studies", "Social Sciences", "Social Work",
    "Demography", "Development", "Education", "E-learning", "Gender Studies", "General Social Sciences",
    "Geography, Planning and Development", "Health (social science)", "Human Factors and Ergonomics", "Law",
    "Library and Information Sciences", "Life-span and Life-course Studies", "Linguistics and Language",
    "Political Science and International Relations", "Public Administration", "Safety Research",
    "Social Sciences (miscellaneous)", "Sociology and Political Science", "Transportation", "Urban Studies",
    "Human resources and industrial relations", "Commercial law", "Sociology"
  ],
  "Veterinary": [
    "Equine", "Food Animals", "General Veterinary", "Small Animals", "Veterinary (miscellaneous)"
  ],
  "General": [
    "General & Strategy", "Innovation", "International Business",
    "Management Information Systems, Knowledge Management",
    "Operations Research, Management Science, Production & Operations Management",
    "Organization Behavior/Studies, Human Resource Management, Industrial Relations",
    "Public Sector Management", "Business systems in context", "Knowledge Management",
    "Commercial services", "Other commerce, management, tourism and services",
    "Transportation, logistics and supply chains"
  ]
};

const MAJOR_GROUP_MAP: Record<string, string> = {
  "Business, Management and Accounting": "Business, Economics & Management",
  "Economics, Econometrics and Finance": "Business, Economics & Management",
  "Decision Sciences": "Business, Economics & Management",

  "Computer Science": "Tech, Data & Quantitative Methods",
  "Engineering": "Tech, Data & Quantitative Methods",
  "Mathematics": "Tech, Data & Quantitative Methods",

  "Social Sciences": "Social Sciences & Humanities",
  "Psychology": "Social Sciences & Humanities",
  "Arts and Humanities": "Social Sciences & Humanities",

  "Medicine": "Healthcare & Medical Systems",
  "Nursing": "Healthcare & Medical Systems",
  "Health Professions": "Healthcare & Medical Systems",
  "Pharmacology, Toxicology and Pharmaceutics": "Healthcare & Medical Systems",
  "Neuroscience": "Healthcare & Medical Systems",

  "Environmental Science": "Applied Sciences, Sustainability & Interdisciplinary",
  "Energy": "Applied Sciences, Sustainability & Interdisciplinary",
  "Agricultural and Biological Sciences": "Applied Sciences, Sustainability & Interdisciplinary",
  "Earth and Planetary Sciences": "Applied Sciences, Sustainability & Interdisciplinary",
  "Biochemistry, Genetics and Molecular Biology": "Applied Sciences, Sustainability & Interdisciplinary",
  "Chemical Engineering": "Applied Sciences, Sustainability & Interdisciplinary",
  "Materials Science": "Applied Sciences, Sustainability & Interdisciplinary",
  "Multidisciplinary": "Applied Sciences, Sustainability & Interdisciplinary",
  "General": "Applied Sciences, Sustainability & Interdisciplinary"
};

// Create Case-Insensitive Reverse Lookup Table
const REVERSE_AREA_GROUP_MAP: Record<string, string> = {};
Object.entries(AREA_GROUP_MAP).forEach(([group, items]) => {
  items.forEach((item) => {
    const cleanItem = item
      .replace(/^\d{4}\s*/, '')
      .replace(/[\r\n]+/g, ' ')
      .trim()
      .toLowerCase();
    if (cleanItem) {
      REVERSE_AREA_GROUP_MAP[cleanItem] = group;
    }
  });
});

// ==========================================
// UTILITY & HELPER FUNCTIONS
// ==========================================
function cleanTitle(titleVal: any): string {
  if (!titleVal) return '';
  return String(titleVal)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanIssn(issnVal: any): string[] {
  if (!issnVal) return [];
  const str = String(issnVal).replace(/-/g, '');
  const matches = str.match(/[0-9X]{8}/gi);
  return matches ? Array.from(new Set(matches.map((i) => i.toUpperCase()))) : [];
}

function readExcelFile(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);
}

function deriveGroups(areaName: string) {
  const cleanName = areaName
    .replace(/^\d{4}\s*/, '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .toLowerCase();

  const areaGroup = REVERSE_AREA_GROUP_MAP[cleanName] || "General";
  const majorGroup = MAJOR_GROUP_MAP[areaGroup] || "Applied Sciences, Sustainability & Interdisciplinary";
  return { areaGroup, majorGroup };
}

function getRowValue(row: Record<string, any>, possibleKeys: string[]): any {
  const rowKeys = Object.keys(row);
  for (const pKey of possibleKeys) {
    const target = pKey.toLowerCase().trim();
    const foundKey = rowKeys.find(k => k.toLowerCase().trim() === target);
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }
  return null;
}

function createProgressBar(title: string) {
  return new cliProgress.SingleBar({
    format: `${title.padEnd(8)} |{bar}| {percentage}% | {value}/{total} Rows | ETA: {eta}s`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: false
  });
}

// 🟢 Find or Create Journal (อัปเดต Metadata เช่น coverage, active_status)
async function findOrCreateJournal(
  title: string, 
  publisher?: string, 
  issns: string[] = [], 
  metaData?: { active_status?: string; source_type?: string; coverage?: string; year_inception?: string }
): Promise<number> {
  const cleanedTitle = cleanTitle(title);
  if (!cleanedTitle) throw new Error('Journal title cannot be empty');

  let journalId: number | null = null;

  // 1. ค้นจาก ISSN
  if (issns.length > 0) {
    const existingIssn = await prisma.nEW_JOURNAL_ISSN.findFirst({
      where: { issn: { in: issns } },
      select: { journal_id: true }
    });
    if (existingIssn) journalId = existingIssn.journal_id;
  }

  // 2. ค้นจาก Title
  if (!journalId) {
    const existingTitle = await prisma.nEW_JOURNAL.findFirst({
      where: { journal_title: { equals: cleanedTitle, mode: 'insensitive' } },
      select: { id: true }
    });
    if (existingTitle) journalId = existingTitle.id;
  }

  // 3. สร้างใหม่ หรือ อัปเดตข้อมูลเพิ่มเติม
  if (!journalId) {
    const newJournal = await prisma.nEW_JOURNAL.create({
      data: {
        journal_title: cleanedTitle,
        publisher: publisher || null,
        active_status: metaData?.active_status || 'Active',
        source_type: metaData?.source_type || null,
        coverage: metaData?.coverage || null,
        year_inception: metaData?.year_inception || null
      }
    });
    journalId = newJournal.id;
  } else {
    // มี Journal อยู่แล้ว ให้อัปเดตข้อมูล Metadata ที่ยังไม่มี
    await prisma.nEW_JOURNAL.update({
      where: { id: journalId },
      data: {
        ...(publisher && { publisher }),
        ...(metaData?.active_status && { active_status: metaData.active_status }),
        ...(metaData?.source_type && { source_type: metaData.source_type }),
        ...(metaData?.coverage && { coverage: metaData.coverage }),
        ...(metaData?.year_inception && { year_inception: metaData.year_inception })
      }
    }).catch(() => {});
  }

  return journalId;
}

// 🟢 Save ISSN
async function saveIssns(journalId: number, issns: string[]) {
  for (const issn of issns) {
    if (!issn) continue;
    await prisma.nEW_JOURNAL_ISSN.upsert({
      where: { journal_id_issn: { journal_id: journalId, issn: issn } },
      update: {},
      create: { journal_id: journalId, issn: issn, issn_type: 'PRINT' }
    }).catch(() => {});
  }
}

// 🟢 Save Area & Journal Area Mapping
async function saveJournalAreaMapping(
  journalId: number,
  sourceId: number,
  areaName: string,
  areaCode?: string,
  areaRank?: string
) {
  const trimmedAreaName = areaName.trim();
  if (!trimmedAreaName) return;

  const { areaGroup, majorGroup } = deriveGroups(trimmedAreaName);

  // 1. สร้าง/อัปเดต Subject Area
  const area = await prisma.nEW_SUBJECT_AREA.upsert({
    where: {
      source_id_area_name: {
        source_id: sourceId,
        area_name: trimmedAreaName
      }
    },
    update: {
      area_code: areaCode || undefined,
      area_group: areaGroup,
      major_group: majorGroup
    },
    create: {
      source_id: sourceId,
      area_code: areaCode || null,
      area_name: trimmedAreaName,
      area_group: areaGroup,
      major_group: majorGroup
    }
  });

  // 2. แมป Journal กับ Subject Area (แก้ไขตรงนี้ให้มี source_id)
  await prisma.nEW_JOURNAL_AREA_MAPPING.upsert({
    where: {
      // 🟢 เปลี่ยนจาก journal_id_subject_area_id เป็นตัวนี้:
      journal_id_subject_area_id_source_id: {
        journal_id: journalId,
        subject_area_id: area.id,
        source_id: sourceId
      }
    },
    update: {
      ...(areaRank && { area_rank: areaRank })
    },
    create: {
      journal_id: journalId,
      subject_area_id: area.id,
      source_id: sourceId,
      area_rank: areaRank || null
    }
  });
}

// 🟢 Save Journal Overall Rank ประจำ Source
async function saveJournalRanking(journalId: number, sourceId: number, overallRank: string) {
  if (!overallRank) return;
  const cleanRank = String(overallRank).trim();
  if (!cleanRank) return;

  await prisma.nEW_JOURNAL_RANKING.upsert({
    where: {
      journal_id_source_id: {
        journal_id: journalId,
        source_id: sourceId
      }
    },
    update: { overall_rank: cleanRank },
    create: {
      journal_id: journalId,
      source_id: sourceId,
      overall_rank: cleanRank
    }
  });
}

// ==========================================
// SEED NEW SOURCES
// ==========================================
async function seedNewSources() {
  console.log('--- Seeding NEW_SOURCE ---');
  const sources = [
    { id: 1, source_name: 'Scopus' },
    { id: 2, source_name: 'Scimago' },
    { id: 3, source_name: 'AJG' },
    { id: 4, source_name: 'ABDC' },
  ];

  for (const s of sources) {
    await prisma.nEW_SOURCE.upsert({
      where: { id: s.id },
      update: { source_name: s.source_name },
      create: s,
    });
  }
}

// ==========================================
// PROCESS EXCEL FILES FOR EACH SOURCE
// ==========================================

// 1. SCOPUS (source_id = 1)
async function processScopus(filePath: string) {
  console.log('\n--- Processing Scopus ---');
  console.time('Time - Scopus');
  const rows = readExcelFile(filePath);
  const progressBar = createProgressBar('Scopus');
  progressBar.start(rows.length, 0);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = String(getRowValue(row, ['Source Title', 'Title', 'Journal']) || '').trim();

    if (title) {
      const publisher = getRowValue(row, ['Publisher']);
      const activeStatus = String(getRowValue(row, ['Active or Inactive']) || 'Active');
      const sourceType = getRowValue(row, ['Source Type']);
      const coverage = String(getRowValue(row, ['Coverage']) || '');
      const issns = [...cleanIssn(getRowValue(row, ['ISSN'])), ...cleanIssn(getRowValue(row, ['EISSN', 'ISSN Online']))];

      const journalId = await findOrCreateJournal(title, publisher, issns, {
        active_status: activeStatus,
        source_type: sourceType,
        coverage: coverage
      });
      await saveIssns(journalId, issns);

      // วนลูปอ่าน Area คอลัมน์ 1000 - 3600
      for (const rawColKey of Object.keys(row)) {
        const cleanedColKey = rawColKey.replace(/[\r\n]+/g, ' ').trim();
        const match = cleanedColKey.match(/^(\d{4})\s+(.+)$/);

        if (match) {
          const areaCode = match[1];
          const areaName = match[2].trim();
          const cellValue = row[rawColKey];
          if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== '') {
            await saveJournalAreaMapping(journalId, 1, areaName, areaCode);
          }
        }
      }
    }
    progressBar.update(i + 1);
  }
  progressBar.stop();
  console.timeEnd('Time - Scopus');
}

// 2. SCIMAGO (source_id = 2)
async function processScimago(filePath: string) {
  console.log('\n--- Processing Scimago ---');
  console.time('Time - Scimago');
  const rows = readExcelFile(filePath);
  const progressBar = createProgressBar('Scimago');
  progressBar.start(rows.length, 0);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = String(getRowValue(row, ['Title', 'Source Title', 'Journal']) || '').trim();

    if (title) {
      const publisher = getRowValue(row, ['Publisher']);
      const sourceType = getRowValue(row, ['Type']);
      const coverage = String(getRowValue(row, ['Coverage']) || '');
      const bestQuartile = getRowValue(row, ['SJR Best Quartile']);
      const issns = cleanIssn(getRowValue(row, ['Issn', 'ISSN']));

      const journalId = await findOrCreateJournal(title, publisher, issns, {
        source_type: sourceType,
        coverage: coverage
      });
      await saveIssns(journalId, issns);

      // บันทึก Overall Rank (SJR Best Quartile)
      if (bestQuartile) {
        await saveJournalRanking(journalId, 2, String(bestQuartile));
      }

      // แยก Scimago Categories ออกเป็น Area + Area Rank (Q1, Q2)
      const catStr = String(getRowValue(row, ['Scimago_Categories', 'Categories']) || '');
      if (catStr) {
        const categories = catStr.split(';');
        for (const cat of categories) {
          const match = cat.trim().match(/^(.*?)\s*\((Q[1-4])\)$/i);
          if (match) {
            const areaName = match[1].trim();
            const areaRank = match[2].toUpperCase().trim();
            await saveJournalAreaMapping(journalId, 2, areaName, undefined, areaRank);
          } else {
            const areaName = cat.trim();
            if (areaName) {
              await saveJournalAreaMapping(journalId, 2, areaName);
            }
          }
        }
      }
    }
    progressBar.update(i + 1);
  }
  progressBar.stop();
  console.timeEnd('Time - Scimago');
}

async function processAjg(filePath: string) {
  console.log('\n--- Processing AJG ---');
  console.time('Time - AJG');

  const rows = readExcelFile(filePath);
  if (rows.length === 0) {
    console.log('❌ [AJG Debug] อ่านไฟล์ได้ 0 แถว!');
    return;
  }

  //  Debug ลองดูหัวข้อ Column จริงใน Excel แถวแรก
  if (rows.length > 0) {
    console.log(' [AJG Debug] Sample Headers:', Object.keys(rows[0]));
  }

  const progressBar = createProgressBar('AJG');
  progressBar.start(rows.length, 0);

  let successAreaCount = 0;
  let missingAreaCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawTitle = getRowValue(row, [
      'Journal Title', 'Journal title', 'Journal', 'Title', 'Name of Journal', 'AJG Journal'
    ]);
    const title = cleanTitle(rawTitle);

    if (title) {
      const issns = cleanIssn(getRowValue(row, ['ISSN', 'Issn', 'EISSN', 'eISSN', 'Issn-online', 'ISSN Online']));
      
      //  เพิ่มการดึงชื่อ Column ที่ครอบคลุมขึ้นสำหรับ AJG Area
      const areaName = cleanTitle(getRowValue(row, [
        'Subject area AJG2024lowest]',
        'Subject area AJG2024 lowest',
        'Subject area AJG2024 lowest]',
        'Subject area AJG 2024',
        'Subject area AJG2021',
        'Subject area',
        'Subject Area',
        'AJG Subject Area',
        'AJG Field',
        'Field',
        'Sector'
      ]));

      const rankVal = cleanTitle(getRowValue(row, [
        'AJG 2024 4*-1', 'AJG 2024', 'AJG 2021', 'AJG Rating', 'Rank', 'Rating', 'AJG Grade'
      ]));

      try {
        const journalId = await findOrCreateJournal(title, undefined, issns);
        if (issns.length > 0) await saveIssns(journalId, issns);

        if (areaName) {
          // Pass Source ID = 3 สำหรับ AJG
          await saveJournalAreaMapping(journalId, 3, areaName);
          successAreaCount++;
        } else {
          missingAreaCount++;
        }

        if (rankVal) await saveJournalRanking(journalId, 3, rankVal);
      } catch (err) {
        // Log error ออกมาดูแทนการข้ามเฉยๆ
        console.error(`❌ Error on row ${i + 1} (${title}):`, err);
      }
    }
    progressBar.update(i + 1);
  }

  progressBar.stop();
  console.log(`\n [AJG Summary] Mapped Area: ${successAreaCount} journals | Missing Area: ${missingAreaCount} journals`);
  console.timeEnd('Time - AJG');
}

// 4. ABDC (source_id = 4)
async function processAbdc(filePath: string) {
  console.log('\n--- Processing ABDC ---');
  console.time('Time - ABDC');
  const rows = readExcelFile(filePath);
  const progressBar = createProgressBar('ABDC');
  progressBar.start(rows.length, 0);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = String(getRowValue(row, ['Journal Title', 'Journal', 'Title']) || '').trim();

    if (title) {
      const publisher = getRowValue(row, ['Publisher']);
      const yearInception = String(getRowValue(row, ['Year Inception', 'Inception']) || '');
      const issns = [...cleanIssn(getRowValue(row, ['ISSN'])), ...cleanIssn(getRowValue(row, ['ISSN Online', 'EISSN']))];
      const rawFor = getRowValue(row, ['FoR', 'FOR', 'Field of Research', 'FOR Code']);
      const forCode = parseInt(String(rawFor || '').replace(/\D/g, ''), 10);
      const rankVal = String(getRowValue(row, ['2025 Rating', '2022 Rating', 'Rating', 'Rank']) || '').trim();

      const journalId = await findOrCreateJournal(title, publisher, issns, {
        year_inception: yearInception
      });
      await saveIssns(journalId, issns);

      if (!isNaN(forCode) && FOR_MAPPING[forCode]) {
        const areaName = FOR_MAPPING[forCode];
        await saveJournalAreaMapping(journalId, 4, areaName, String(forCode));
      } else if (rawFor) {
        await saveJournalAreaMapping(journalId, 4, String(rawFor).trim());
      }

      if (rankVal) {
        await saveJournalRanking(journalId, 4, rankVal);
      }
    }
    progressBar.update(i + 1);
  }
  progressBar.stop();
  console.timeEnd('Time - ABDC');
}

// ==========================================
// MAIN EXECUTIN
// ==========================================
async function main() {
  console.log("Seeding database...");
  console.time("Total Execution Time");
  // 1. รันฟังก์ชันเดิมทั้งหมด

  const steps = [
    { name: "seedJournalMain", fn: seedJournalMain },
    { name: "seedAbdc", fn: seedAbdc },
    { name: "seedAjg", fn: seedAjg },
    { name: "seedScimago", fn: seedScimago },
    { name: "seedScopus", fn: seedScopus },
    { name: "seedNote", fn: seedNote },
    { name: "seedJournalArea", fn: seedJournalArea },
    { name: "seedArea", fn: seedArea },
    { name: "seedJournalAreaDetail", fn: seedJournalAreaDetail },
    { name: "seedAreaGroup", fn: seedAreaGroup },
    { name: "seedJournalAreaGroupDetail", fn: seedJournalAreaGroupDetail },
    { name: "seedMajorGroup", fn: seedMajorGroup },
    { name: "seedJournalMajorGroupDetail", fn: seedJournalMajorGroupDetail },
    { name: "seedScopusArea", fn: seedScopusArea },
    { name: "seedScopusAreaGroup", fn: seedScopusAreaGroup },
    { name: "seedScopusMajorGroup", fn: seedScopusMajorGroup },
    { name: "seedJournalScopusAreaDetail", fn: seedJournalScopusAreaDetail },
    { name: "seedJournalScopusAreaGroupDetail", fn: seedJournalScopusAreaGroupDetail },
    { name: "seedJournalScopusMajorGroupDetail", fn: seedJournalScopusMajorGroupDetail },
  ];
  for (const step of steps) {
    if (typeof step.fn === 'function') {
      console.time(`Time - ${step.name}`);
      await step.fn();
      console.timeEnd(`Time - ${step.name}`);
    }
  }

  // 2. เพิ่มการสร้าง Source ตั้งต้น
  console.time('Time - seedNewSources');
  await seedNewSources();
  console.timeEnd('Time - seedNewSources');
  // 3. รันส่วนสคริปต์ใหม่ต่อท้ายพร้อม Progress Bar
  console.log("\nStarting Excel Process...");
  await processScopus(FILE_PATHS.SCOPUS);
  await processScimago(FILE_PATHS.SCIMAGO);
  await processAjg(FILE_PATHS.AJG);
  await processAbdc(FILE_PATHS.ABDC);
  console.log("\nSeeding complete!");
  console.timeEnd("Total Execution Time");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 