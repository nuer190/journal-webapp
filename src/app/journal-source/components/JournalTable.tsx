"use client";

import React from "react";
import { Journal, Source } from "../hooks/useJournalSource";

interface JournalTableProps {
  journals?: Journal[];
  sources?: Source[];
  selectedSourceId?: number;
  loading?: boolean;
  onSelectJournal?: (journal: Journal) => void;
}

const SOURCE_BADGE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  ABDC: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  SCOPUS: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  SCIMAGO: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  SJR: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  AJG: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  DEFAULT: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

// 1. เปลี่ยนการประกาศฟังก์ชันจาก export function JournalTable เป็น JournalTableComponent
function JournalTableComponent({
  journals = [],
  sources = [],
  selectedSourceId,
  loading,
  onSelectJournal,
}: JournalTableProps) {
  const currentSource = sources?.find((s) => Number(s.id) === Number(selectedSourceId));
  const selectedSourceNameUpper = (currentSource?.source_name || "").toUpperCase();

  const getBadgeStyle = (name: string) => {
    const upper = name.toUpperCase();
    for (const key in SOURCE_BADGE_STYLE) {
      if (upper.includes(key)) return SOURCE_BADGE_STYLE[key];
    }
    return SOURCE_BADGE_STYLE.DEFAULT;
  };

  const getScopusStatus = (journal: Journal) => {
    // 1. ดึง status จาก new_journal (รองรับทั้งกรณีที่เป็น Object หรือ Array)
    const logObj = Array.isArray(journal.new_journal)
      ? journal.new_journal[0]
      : journal.new_journal;

    const logStatus = logObj?.status?.toLowerCase();

    // 2. ถ้ามี status ใน NEW_JOURNAL Log ให้ใช้อันนี้ก่อน
    if (logStatus) {
      if (logStatus.includes("active")) return { label: "Active", isActive: true };
      if (logStatus.includes("inactive")) return { label: "Inactive", isActive: false };
    }

    // 3. ถ้าไม่มี Log ให้ Fallback ไปเช็ค active_status จาก Scopus โดยตรง
    const statusText = (journal.active_status || "").trim().toLowerCase();

    const isActive =
      statusText === "active" ||
      statusText === "1" ||
      statusText === "true" ||
      statusText === "";

    return {
      label: isActive ? "Active" : "Inactive",
      isActive,
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500 shadow-sm animate-pulse">
        Loading journals...
      </div>
    );
  }

  if (!journals || journals.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 shadow-sm">
        No journals found matching the criteria.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3.5 px-4">Journal Title</th>
              <th className="py-3.5 px-4">ISSN (Print / Online)</th>
              <th className="py-3.5 px-4">Publisher</th>
              <th className="py-3.5 px-4">Subject Areas</th>
              <th className="py-3.5 px-4 text-center">Rankings / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {journals.map((journal) => {
              const printIssn =
                journal.issn ||
                journal.issns?.find((i) => i.issn_type?.toUpperCase().includes("PRINT"))?.issn ||
                "—";
              const onlineIssn =
                journal.issnOnline ||
                journal.issns?.find((i) => i.issn_type?.toUpperCase().match(/(ONLINE|EISSN)/))?.issn ||
                "—";

              // 1. Subject Areas Fallback
              const allMappings = journal.area_mappings || [];
              let displayAreas = allMappings;

              if (selectedSourceId) {
                const matched = allMappings.filter(
                  (am) =>
                    Number(am.source_id) === Number(selectedSourceId) ||
                    Number(am.subject_area?.source_id) === Number(selectedSourceId)
                );
                if (matched.length > 0) {
                  displayAreas = matched;
                }
              }

              // 2. Ranking Target
              let targetRanking = null;
              if (selectedSourceId) {
                targetRanking = journal.rankings?.find(
                  (r) => Number(r.source_id) === Number(selectedSourceId)
                );
              } else {
                targetRanking = journal.rankings?.[0];
              }

              // 3. Render Rank / Status Badge
              let rankDisplay: React.ReactNode = null;

              if (selectedSourceNameUpper.includes("SCOPUS")) {
                //  ใช้งานสถานะจาก NEW_JOURNAL Log & active_status ของ Scopus
                const { label, isActive } = getScopusStatus(journal);

                rankDisplay = (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        isActive ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {label}
                  </span>
                );
              } else if (targetRanking && targetRanking.overall_rank) {
                let rawRank = String(targetRanking.overall_rank).trim();
                const actualSourceName = targetRanking.source?.source_name || currentSource?.source_name || "";
                const actualSourceNameUpper = actualSourceName.toUpperCase();

                if (
                  (actualSourceNameUpper.includes("SCIMAGO") || actualSourceNameUpper.includes("SJR")) &&
                  !rawRank.toUpperCase().startsWith("Q")
                ) {
                  rawRank = `Q${rawRank}`;
                }

                const style = getBadgeStyle(actualSourceName || selectedSourceNameUpper);

                rankDisplay = (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {rawRank}
                  </span>
                );
              } else {
                rankDisplay = <span className="text-gray-400">—</span>;
              }

              return (
                <tr
                  key={journal.id}
                  onClick={() => onSelectJournal && onSelectJournal(journal)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-xs truncate">
                    {journal.journal_title || journal.title}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                    <div>P: {printIssn}</div>
                    <div className="text-gray-400">E: {onlineIssn}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-gray-600">
                    {journal.publisher || "—"}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="flex flex-wrap gap-1">
                      {displayAreas.length > 0 ? (
                        displayAreas.slice(0, 2).map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[150px]"
                          >
                            {m.subject_area?.area_name || `Area #${m.subject_area_id}`}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                      {displayAreas.length > 2 && (
                        <span className="text-gray-400 text-[10px] font-semibold self-center">
                          +{displayAreas.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {rankDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. Export Component ด้วย React.memo
export const JournalTable = React.memo(JournalTableComponent);