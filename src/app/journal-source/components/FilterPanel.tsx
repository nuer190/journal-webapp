"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Source, SubjectArea } from "../hooks/useJournalSource";

interface FilterPanelProps {
  sources: Source[];
  areas: SubjectArea[];
  ranks: string[];
  selectedSource: string;
  selectedAreas: (string | number)[];
  selectedRanks: string[];
  onSourceChange: (sourceId: string) => void;
  onAreaChange: (areas: (string | number)[]) => void;
  onRankChange: (ranks: string[]) => void;
}

export function FilterPanel({
  sources = [],
  areas = [],
  ranks = [],
  selectedSource,
  selectedAreas = [],
  selectedRanks = [],
  onSourceChange,
  onAreaChange,
  onRankChange,
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิด Popover เมื่อคลิกด้านนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 กรอง Subject Areas เฉพาะที่ตรงกับ selectedSource และ searchTerm
  const filteredAreas = useMemo(() => {
    if (!selectedSource) return [];

    return areas.filter((a) => {
      // 1. เช็คว่า source_id ของ Area ตรงกับ Source ที่เลือกหรือไม่
      const isSourceMatch = a.source_id
        ? String(a.source_id) === String(selectedSource)
        : true; // เผื่อกรณี parent component กรองมาให้อยู่แล้ว

      // 2. เช็คค้นหาจาก Search Term
      const isSearchMatch = a.area_name.toLowerCase().includes(searchTerm.toLowerCase());

      return isSourceMatch && isSearchMatch;
    });
  }, [areas, selectedSource, searchTerm]);

  const handleAreaToggle = (areaId: string | number) => {
    const areaIdStr = String(areaId);
    const isSelected = selectedAreas.some((id) => String(id) === areaIdStr);
    if (isSelected) {
      onAreaChange(selectedAreas.filter((id) => String(id) !== areaIdStr));
    } else {
      onAreaChange([...selectedAreas, areaId]);
    }
  };

  const handleRankToggle = (rankStr: string) => {
    if (selectedRanks.includes(rankStr)) {
      onRankChange(selectedRanks.filter((r) => r !== rankStr));
    } else {
      onRankChange([...selectedRanks, rankStr]);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* 1. SELECT SOURCE */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Select Source
          </label>
          <select
            value={selectedSource}
            onChange={(e) => {
              const newSourceId = e.target.value;
              onSourceChange(newSourceId);
              // ล้างค่าเมื่อมีการเปลี่ยน Source
              onAreaChange([]);
              onRankChange([]);
              setSearchTerm("");
            }}
            className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="">-- Choose Source --</option>
            {sources.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.source_name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. RANKS */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Ranks
          </label>
          <div className="flex flex-wrap gap-1 min-h-[40px] items-center p-1 border border-gray-200 rounded-xl bg-gray-50/50">
            {!selectedSource ? (
              <span className="text-xs text-gray-400 px-3">Select source first</span>
            ) : ranks.length === 0 ? (
              <span className="text-xs text-gray-400 px-3">No ranks available</span>
            ) : (
              ranks.map((r) => {
                const isSelected = selectedRanks.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRankToggle(r)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
                    }`}
                  >
                    {r}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 3. SUBJECT AREAS (Popover Dropdown) */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Subject Areas
            </label>
            {selectedAreas.length > 0 && (
              <span className="text-xs font-bold text-blue-600">
                ({selectedAreas.length} selected)
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={selectedSource ? "🔍 Search subject area..." : "Select source first"}
              disabled={!selectedSource}
              value={searchTerm}
              onFocus={() => {
                if (selectedSource) setIsOpen(true);
              }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedSource) setIsOpen(true);
              }}
              className="w-full h-10 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Floating Menu Popover */}
          {isOpen && selectedSource && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-1.5 max-h-56 overflow-y-auto space-y-1">
              {filteredAreas.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-400">
                  {searchTerm
                    ? "No matching subject areas found"
                    : "No subject areas for this source"}
                </div>
              ) : (
                filteredAreas.map((a) => {
                  const isSelected = selectedAreas.some(
                    (id) => String(id) === String(a.id)
                  );
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleAreaToggle(a.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex justify-between items-center ${
                        isSelected
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{a.area_name}</span>
                      {isSelected && <span className="ml-1 text-xs font-bold">✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE CHIPS */}
      {selectedAreas.length > 0 && (
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold">Active Areas:</span>
          {selectedAreas.map((areaId) => {
            const areaIdStr = String(areaId);
            const areaObj = areas.find((a) => String(a.id) === areaIdStr);
            return (
              <span
                key={areaIdStr}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100 shadow-sm"
              >
                {areaObj ? areaObj.area_name : `Area #${areaIdStr}`}
                <button
                  type="button"
                  onClick={() => handleAreaToggle(areaIdStr)}
                  className="text-blue-400 hover:text-blue-700 font-bold ml-1 transition-colors"
                >
                  ✕
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => onAreaChange([])}
            className="text-xs text-red-500 font-medium hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}