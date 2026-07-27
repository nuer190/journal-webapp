/*
  Warnings:

  - You are about to drop the column `asjc_1000_general` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1100_agricultural_and_biological_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1200_arts_and_humanities` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1300_biochemistry_genetics_molecular_biology` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1400_business_management_accounting` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1500_chemical_engineering` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1600_chemistry` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1700_computer_science` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1800_decision_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_1900_earth_and_planetary_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2000_economics_econometrics_finance` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2100_energy` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2200_engineering` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2300_environmental_science` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2400_immunology_and_microbiology` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2500_materials_science` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2600_mathematics` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2700_medicine` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2800_neuroscience` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_2900_nursing` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_3000_pharmacology_toxicology_pharmaceutics` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_3100_physics_and_astronomy` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_3200_psychology` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_3300_social_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_3400_veterinary` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_3500_dentistry` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `asjc_3600_health_professions` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `top_level_health_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `top_level_life_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `top_level_physical_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.
  - You are about to drop the column `top_level_social_sciences` on the `SCOPUS_DB` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SCOPUS_DB" DROP COLUMN "asjc_1000_general",
DROP COLUMN "asjc_1100_agricultural_and_biological_sciences",
DROP COLUMN "asjc_1200_arts_and_humanities",
DROP COLUMN "asjc_1300_biochemistry_genetics_molecular_biology",
DROP COLUMN "asjc_1400_business_management_accounting",
DROP COLUMN "asjc_1500_chemical_engineering",
DROP COLUMN "asjc_1600_chemistry",
DROP COLUMN "asjc_1700_computer_science",
DROP COLUMN "asjc_1800_decision_sciences",
DROP COLUMN "asjc_1900_earth_and_planetary_sciences",
DROP COLUMN "asjc_2000_economics_econometrics_finance",
DROP COLUMN "asjc_2100_energy",
DROP COLUMN "asjc_2200_engineering",
DROP COLUMN "asjc_2300_environmental_science",
DROP COLUMN "asjc_2400_immunology_and_microbiology",
DROP COLUMN "asjc_2500_materials_science",
DROP COLUMN "asjc_2600_mathematics",
DROP COLUMN "asjc_2700_medicine",
DROP COLUMN "asjc_2800_neuroscience",
DROP COLUMN "asjc_2900_nursing",
DROP COLUMN "asjc_3000_pharmacology_toxicology_pharmaceutics",
DROP COLUMN "asjc_3100_physics_and_astronomy",
DROP COLUMN "asjc_3200_psychology",
DROP COLUMN "asjc_3300_social_sciences",
DROP COLUMN "asjc_3400_veterinary",
DROP COLUMN "asjc_3500_dentistry",
DROP COLUMN "asjc_3600_health_professions",
DROP COLUMN "top_level_health_sciences",
DROP COLUMN "top_level_life_sciences",
DROP COLUMN "top_level_physical_sciences",
DROP COLUMN "top_level_social_sciences";

-- CreateTable
CREATE TABLE "SCOPUS_AREA" (
    "scopus_area_id" SERIAL NOT NULL,
    "scopus_area_name" TEXT NOT NULL,

    CONSTRAINT "SCOPUS_AREA_pkey" PRIMARY KEY ("scopus_area_id")
);

-- CreateTable
CREATE TABLE "JOURNAL_SCOPUS_AREA_DETAIL" (
    "journal_id" INTEGER NOT NULL,
    "scopus_area_id" INTEGER NOT NULL,

    CONSTRAINT "JOURNAL_SCOPUS_AREA_DETAIL_pkey" PRIMARY KEY ("journal_id","scopus_area_id")
);

-- CreateTable
CREATE TABLE "SCOPUS_AREA_GROUP" (
    "scopus_area_group_id" SERIAL NOT NULL,
    "scopus_area_group_name" TEXT NOT NULL,

    CONSTRAINT "SCOPUS_AREA_GROUP_pkey" PRIMARY KEY ("scopus_area_group_id")
);

-- CreateTable
CREATE TABLE "JOURNAL_SCOPUS_AREA_GROUP_DETAIL" (
    "journal_id" INTEGER NOT NULL,
    "scopus_area_group_id" INTEGER NOT NULL,

    CONSTRAINT "JOURNAL_SCOPUS_AREA_GROUP_DETAIL_pkey" PRIMARY KEY ("journal_id","scopus_area_group_id")
);

-- CreateTable
CREATE TABLE "SCOPUS_MAJOR_GROUP" (
    "scopus_major_group_id" SERIAL NOT NULL,
    "scopus_major_group_name" TEXT NOT NULL,

    CONSTRAINT "SCOPUS_MAJOR_GROUP_pkey" PRIMARY KEY ("scopus_major_group_id")
);

-- CreateTable
CREATE TABLE "JOURNAL_SCOPUS_MAJOR_GROUP_DETAIL" (
    "journal_id" INTEGER NOT NULL,
    "scopus_major_group_id" INTEGER NOT NULL,

    CONSTRAINT "JOURNAL_SCOPUS_MAJOR_GROUP_DETAIL_pkey" PRIMARY KEY ("journal_id","scopus_major_group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SCOPUS_AREA_scopus_area_name_key" ON "SCOPUS_AREA"("scopus_area_name");

-- CreateIndex
CREATE UNIQUE INDEX "SCOPUS_AREA_GROUP_scopus_area_group_name_key" ON "SCOPUS_AREA_GROUP"("scopus_area_group_name");

-- CreateIndex
CREATE UNIQUE INDEX "SCOPUS_MAJOR_GROUP_scopus_major_group_name_key" ON "SCOPUS_MAJOR_GROUP"("scopus_major_group_name");

-- AddForeignKey
ALTER TABLE "JOURNAL_SCOPUS_AREA_DETAIL" ADD CONSTRAINT "JOURNAL_SCOPUS_AREA_DETAIL_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "JOURNAL_MAIN"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JOURNAL_SCOPUS_AREA_DETAIL" ADD CONSTRAINT "JOURNAL_SCOPUS_AREA_DETAIL_scopus_area_id_fkey" FOREIGN KEY ("scopus_area_id") REFERENCES "SCOPUS_AREA"("scopus_area_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JOURNAL_SCOPUS_AREA_GROUP_DETAIL" ADD CONSTRAINT "JOURNAL_SCOPUS_AREA_GROUP_DETAIL_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "JOURNAL_MAIN"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JOURNAL_SCOPUS_AREA_GROUP_DETAIL" ADD CONSTRAINT "JOURNAL_SCOPUS_AREA_GROUP_DETAIL_scopus_area_group_id_fkey" FOREIGN KEY ("scopus_area_group_id") REFERENCES "SCOPUS_AREA_GROUP"("scopus_area_group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JOURNAL_SCOPUS_MAJOR_GROUP_DETAIL" ADD CONSTRAINT "JOURNAL_SCOPUS_MAJOR_GROUP_DETAIL_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "JOURNAL_MAIN"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JOURNAL_SCOPUS_MAJOR_GROUP_DETAIL" ADD CONSTRAINT "JOURNAL_SCOPUS_MAJOR_GROUP_DETAIL_scopus_major_group_id_fkey" FOREIGN KEY ("scopus_major_group_id") REFERENCES "SCOPUS_MAJOR_GROUP"("scopus_major_group_id") ON DELETE RESTRICT ON UPDATE CASCADE;
