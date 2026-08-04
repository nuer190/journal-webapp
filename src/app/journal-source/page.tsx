"use client";

import React from "react";
import { useJournalSource } from "./hooks/useJournalSource";
import { FilterPanel } from "./components/FilterPanel";
import { SummaryCards } from "./components/SummaryCards";
import { ChartCard } from "./components/ChartCard";
import { JournalTable } from "./components/JournalTable";
import { EmptyState } from "./components/EmptyState";

export default function JournalSourcePage() {
  const {
    sources = [],
    areas = [],
    ranks = [],
    journals = [],
    chartData = [],
    summary = { totalJournals: 0, totalPublishers: 0, totalAreas: 0 },
    selectedSource,
    selectedAreas = [],
    selectedRanks = [],
    loading,
    selectedJournal,
    page,
    limit,
    pagination,
    setPage,
    setLimit,
    setSelectedSource,
    setSelectedAreas,
    setSelectedRanks,
    setSelectedJournal,
  } = useJournalSource();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Journal Source Explorer
        </h1>
        <p className="text-sm text-gray-500">
          Filter and analyze academic journals by source and subject areas
        </p>
      </div>

      {/* 1. Filter Panel */}
      <FilterPanel
        sources={sources}
        areas={areas}
        ranks={ranks}
        selectedSource={selectedSource}
        selectedAreas={selectedAreas.map(String)}
        selectedRanks={selectedRanks}
        onSourceChange={setSelectedSource}
        onAreaChange={(values: any) => setSelectedAreas(values)}
        onRankChange={(values: any) => setSelectedRanks(values)}
      />

      {/* 2. Summary Cards Component */}
      <SummaryCards
        totalJournals={summary.totalJournals}
        totalPublishers={summary.totalPublishers}
        totalAreas={summary.totalAreas}
        loading={loading}
      />

      {/* 3. Main Content: Loading / Empty State / Chart & Table */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading journal data...</span>
        </div>
      ) : !selectedSource && journals.length === 0 ? (
        <EmptyState message="Please select a Source to begin analysis." />
      ) : (
        <>
          <ChartCard data={chartData} />

          {journals.length === 0 ? (
            <EmptyState message="No journals match your filter criteria." />
          ) : (
            <JournalTable
              journals={journals}
              onSelectJournal={setSelectedJournal}
              pagination={{
                page,
                limit,
                totalCount: pagination?.totalCount || 0,
                totalPages: pagination?.totalPages || 1,
                onPageChange: (newPage) => setPage(newPage),
                onLimitChange: (newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                },
              }}
            />
          )}
        </>
      )}

      {/* 4. Modal Detail View */}
      {selectedJournal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedJournal(null)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {selectedJournal.journal_title || selectedJournal.title || "Untitled Journal"}
              </h2>
              <button
                onClick={() => setSelectedJournal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong className="text-gray-900">Publisher:</strong>{" "}
                {selectedJournal.publisher || "—"}
              </p>

              <p>
                <strong className="text-gray-900">Status:</strong>{" "}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {selectedJournal.active_status || "Active"}
                </span>
              </p>

              <div>
                <strong className="text-gray-900">ISSNs:</strong>
                {selectedJournal.NEW_JOURNAL_ISSN && selectedJournal.NEW_JOURNAL_ISSN.length > 0 ? (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 pl-1">
                    {selectedJournal.NEW_JOURNAL_ISSN.map((i: any, idx: number) => (
                      <li key={idx}>
                        <span className="font-mono">{i.issn}</span>{" "}
                        {i.issn_type ? `(${i.issn_type})` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic mt-0.5">
                    {selectedJournal.issn ? `${selectedJournal.issn} (Print)` : "No ISSN available"}
                  </p>
                )}
              </div>

              <div>
                <strong className="text-gray-900">Subject Areas:</strong>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedJournal.NEW_JOURNAL_AREA_MAPPING && selectedJournal.NEW_JOURNAL_AREA_MAPPING.length > 0 ? (
                    selectedJournal.NEW_JOURNAL_AREA_MAPPING.map((m: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200"
                      >
                        {m.subject_area?.area_name || "N/A"}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No subject areas listed</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedJournal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}