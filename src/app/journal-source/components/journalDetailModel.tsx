"use client";

import React from "react";
import { Journal, Source } from "../hooks/useJournalSource";

interface JournalDetailModalProps {
  journal: Journal | null;
  sources?: Source[];
  selectedSourceId?: number; // ตัวกำกับ Source ID จาก Filter หน้าหลัก
  onClose: () => void;
}

export function JournalDetailModal({
  journal,
  sources = [],
  selectedSourceId,
  onClose,
}: JournalDetailModalProps) {
  if (!journal) return null;

  // 1. ระบุ Source ปัจจุบันที่เลือกอยู่
  const currentSource = sources.find(
    (s) => Number(s.id) === Number(selectedSourceId)
  );
  const selectedSourceName = currentSource?.source_name || "All Sources";
  const sourceNameUpper = selectedSourceName.toUpperCase();

  // 2. กำกับ Rank: ดึงเฉพาะ Rank ที่ผูกกับ selectedSourceId ตรงๆ เท่านั้น
  const matchedRankings = (journal.rankings || []).filter((r) => {
    if (!selectedSourceId) return true;
    return Number(r.source_id) === Number(selectedSourceId);
  });

  // แสดง Rank ของ Source นั้นๆ (ถ้าเป็น Scimago/SJR เติม Q ให้ถ้ายังไม่มี)
  let sourceRankDisplay = matchedRankings[0]?.overall_rank || "—";
  if (
    sourceRankDisplay !== "—" &&
    (sourceNameUpper.includes("SCIMAGO") || sourceNameUpper.includes("SJR"))
  ) {
    if (!sourceRankDisplay.toUpperCase().startsWith("Q")) {
      sourceRankDisplay = `Q${sourceRankDisplay}`;
    }
  }

  // 3. กำกับ Subject Area: ดึงเฉพาะ Area ที่ผูกกับ selectedSourceId เท่านั้น
  const filteredAreaMappings = (journal.area_mappings || []).filter((m) => {
    if (!selectedSourceId) return true; // ถ้าไม่ได้เลือก Filter ให้แสดงหมด

    // เช็ค source_id ทั้งฝั่ง mapping และฝั่ง subject_area
    const mappingSourceId = Number(m.source_id);
    const areaSourceId = Number(m.subject_area?.source_id);
    const targetSourceId = Number(selectedSourceId);

    return mappingSourceId === targetSourceId || areaSourceId === targetSourceId;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100">
                {journal.source_type || "Journal"}
              </span>
              {selectedSourceId && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md border border-purple-100">
                  {selectedSourceName}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              {journal.journal_title || journal.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {journal.publisher || "Unknown Publisher"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-gray-700">
          
          {/* Metadata Grid & Rank ประจำ Source */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 block font-medium">
                Best Rank ({selectedSourceName})
              </span>
              <span className="font-bold text-blue-600 text-sm">
                {sourceRankDisplay}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Status</span>
              <span className="font-semibold text-gray-800">
                {journal.active_status || "Active"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Coverage</span>
              <span className="font-semibold text-gray-800">
                {journal.coverage || "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Inception Year</span>
              <span className="font-semibold text-gray-800">
                {journal.year_inception || "—"}
              </span>
            </div>
          </div>

          {/* ISSN Identifiers */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider">
              ISSN Identifiers
            </h4>
            <div className="flex flex-wrap gap-2">
              {journal.issns && journal.issns.length > 0 ? (
                journal.issns.map((i) => (
                  <span
                    key={i.id}
                    className="bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 font-mono text-gray-800"
                  >
                    {i.issn_type || "ISSN"}: {i.issn}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No ISSN data available</span>
              )}
            </div>
          </div>

          {/* Subject Areas ประจำ Source ที่เลือก */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider">
              Subject Areas ({selectedSourceName})
            </h4>
            <div className="space-y-1.5">
              {filteredAreaMappings.length > 0 ? (
                filteredAreaMappings.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                  >
                    <span className="font-medium text-gray-800">
                      {m.subject_area?.area_name || `Area ID: ${m.subject_area_id}`}
                    </span>
                    {/* แนบ Rank ประจำ Area ย่อยถ้ามี */}
                    {m.area_rank && (
                      <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                        Rank: {m.area_rank}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-gray-400">
                  No Subject Area mappings found for {selectedSourceName}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-all shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}