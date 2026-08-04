"use client";

import React from "react";

interface Source {
  id: number;
  source_name: string;
}

interface Area {
  id: number;
  area_name: string;
}

interface FilterPanelProps {
  sources: Source[];
  areas: Area[];
  ranks: string[];
  selectedSource: string;
  selectedAreas: string[];
  selectedRanks: string[];
  onSourceChange: (sourceId: string) => void;
  onAreaChange: (areas: string[]) => void;
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
  // Toggle Area selection
  const handleAreaToggle = (areaIdStr: string) => {
    if (selectedAreas.includes(areaIdStr)) {
      onAreaChange(selectedAreas.filter((id) => id !== areaIdStr));
    } else {
      onAreaChange([...selectedAreas, areaIdStr]);
    }
  };

  // Toggle Rank selection
  const handleRankToggle = (rankStr: string) => {
    if (selectedRanks.includes(rankStr)) {
      onRankChange(selectedRanks.filter((r) => r !== rankStr));
    } else {
      onRankChange([...selectedRanks, rankStr]);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow border border-gray-100 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Source Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Select Source
          </label>
          <select
            value={selectedSource}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose Source --</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {s.source_name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Rank Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Ranks
          </label>
          <div className="flex flex-wrap gap-1.5 min-h-[38px] items-center p-1 border border-gray-200 rounded-lg bg-gray-50/50">
            {ranks.length === 0 ? (
              <span className="text-xs text-gray-400 px-2">Select source first</span>
            ) : (
              ranks.map((r) => {
                const isSelected = selectedRanks.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRankToggle(r)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {r}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Subject Areas Multi-select with Selected Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Subject Areas ({selectedAreas.length} selected)
          </label>
          
          {/* Custom Select Dropdown */}
          <select
            disabled={!selectedSource}
            onChange={(e) => {
              if (e.target.value) {
                handleAreaToggle(e.target.value);
                e.target.value = ""; // Reset dropdown after click
              }
            }}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">+ Add Subject Area filter...</option>
            {areas.map((a) => {
              const isSelected = selectedAreas.includes(a.id.toString());
              return (
                <option key={a.id} value={a.id.toString()}>
                  {isSelected ? `✓ ${a.area_name}` : a.area_name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 🟢 ส่วนแสดงผล Chips/Tags ที่กดเลือกไว้แล้วสำหรับ Subject Area */}
      {selectedAreas.length > 0 && (
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Active Areas:</span>
          {selectedAreas.map((areaIdStr) => {
            const areaObj = areas.find((a) => a.id.toString() === areaIdStr);
            return (
              <span
                key={areaIdStr}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200"
              >
                {areaObj ? areaObj.area_name : `Area #${areaIdStr}`}
                <button
                  type="button"
                  onClick={() => handleAreaToggle(areaIdStr)}
                  className="text-blue-500 hover:text-blue-900 focus:outline-none font-bold ml-0.5"
                >
                  ✕
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => onAreaChange([])}
            className="text-xs text-red-500 hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}