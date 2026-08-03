/*
  Warnings:

  - You are about to drop the `NEW_JOURNAL` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NEW_JOURNAL_AREA_MAPPING` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NEW_JOURNAL_ISSN` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NEW_JOURNAL_RANKING` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NEW_SOURCE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NEW_SUBJECT_AREA` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NEW_JOURNAL_AREA_MAPPING" DROP CONSTRAINT "NEW_JOURNAL_AREA_MAPPING_journal_id_fkey";

-- DropForeignKey
ALTER TABLE "NEW_JOURNAL_AREA_MAPPING" DROP CONSTRAINT "NEW_JOURNAL_AREA_MAPPING_subject_area_id_fkey";

-- DropForeignKey
ALTER TABLE "NEW_JOURNAL_ISSN" DROP CONSTRAINT "NEW_JOURNAL_ISSN_journal_id_fkey";

-- DropForeignKey
ALTER TABLE "NEW_JOURNAL_RANKING" DROP CONSTRAINT "NEW_JOURNAL_RANKING_journal_id_fkey";

-- DropForeignKey
ALTER TABLE "NEW_JOURNAL_RANKING" DROP CONSTRAINT "NEW_JOURNAL_RANKING_source_id_fkey";

-- DropForeignKey
ALTER TABLE "NEW_SUBJECT_AREA" DROP CONSTRAINT "NEW_SUBJECT_AREA_source_id_fkey";

-- DropTable
DROP TABLE "NEW_JOURNAL";

-- DropTable
DROP TABLE "NEW_JOURNAL_AREA_MAPPING";

-- DropTable
DROP TABLE "NEW_JOURNAL_ISSN";

-- DropTable
DROP TABLE "NEW_JOURNAL_RANKING";

-- DropTable
DROP TABLE "NEW_SOURCE";

-- DropTable
DROP TABLE "NEW_SUBJECT_AREA";
