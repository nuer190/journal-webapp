"use client";

import React, { useState, useCallback } from "react";
import { useJournalSource, Journal } from "./hooks/useJournalSource";
import { FilterPanel } from "./components/FilterPanel";
import { SummaryCards } from "./components/SummaryCards";
import { ChartCard } from "./components/ChartCard";
import { JournalTable } from "./components/JournalTable";
import { JournalDetailModal } from "./components/journalDetailModel";

export default function JournalSourcePage() {
  const {
    sources,
    areas,
    ranks,
    journals,
    chartData,
    summary,
    isTop10,
    selectedSource,
    selectedSourceId,
    selectedAreas,
    selectedRanks,
    selectedStatus, // 👈 เพิ่ม
    page,
    pagination,
    loading,
    error,
    setSelectedSource,
    setSelectedAreas,
    setSelectedRanks,
    setSelectedStatus, // 👈 เพิ่ม
    setPage,
  } = useJournalSource();

  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  const handleSelectJournal = useCallback((journal: Journal) => {
    setSelectedJournal(journal);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedJournal(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Journal Source Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Explore and filter journal rankings and distributions across various index sources.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold">
          Error: {error}
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        sources={sources}
        areas={areas}
        ranks={ranks}
        selectedSource={selectedSource}
        selectedAreas={selectedAreas}
        selectedRanks={selectedRanks}
        selectedStatus={selectedStatus} // 👈 เพิ่ม
        onSourceChange={setSelectedSource}
        onAreaChange={setSelectedAreas}
        onRankChange={setSelectedRanks}
        onStatusChange={setSelectedStatus} // 👈 เพิ่ม
      />

      {/* Summary Stat Cards */}
      <SummaryCards summary={summary} loading={loading} />

      {/* Chart Section */}
      <ChartCard
        data={chartData}
        isTop10={isTop10}
        selectedSourceId={selectedSource ? Number(selectedSource) : undefined}
        sources={sources}
      />

      {/* Main Journal Table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-900">Journal List</h3>
          <span className="text-xs text-gray-400">
            Showing Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        <JournalTable
          journals={journals}
          sources={sources}
          selectedSourceId={selectedSourceId}
          loading={loading}
          onSelectJournal={handleSelectJournal}
        />

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 pt-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-gray-600 px-2">
              {page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <JournalDetailModal
        journal={selectedJournal}
        sources={sources}
        selectedSourceId={selectedSourceId}
        onClose={handleCloseModal}
      />
      
      {/* Timestamp Data Source */}
      <div className="flex justify-end text-xs text-muted-foreground pt-1 pr-1 font-mono">
        Data Source updated at 1 July 2026
      </div>
    </div>
  );
}