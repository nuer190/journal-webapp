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
    sourceTypes, // 🟢 ดึงรายการ Source Types
    journals,
    chartData,
    summary,
    isTop10,
    selectedSource,
    selectedSourceId,
    selectedAreas,
    selectedRanks,
    selectedStatus,
    selectedSourceType, // 🟢 ดึงค่า Source Type ที่ถูกเลือก
    page,
    limit = 10,
    pagination,
    loading,
    error,
    setSelectedSource,
    setSelectedAreas,
    setSelectedRanks,
    setSelectedStatus,
    setSelectedSourceType, // 🟢 ดึง Setter Function สำหรับเปลี่ยน Source Type
    setPage,
    setLimit,
  } = useJournalSource();

  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  const handleSelectJournal = useCallback((journal: Journal) => {
    setSelectedJournal(journal);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedJournal(null);
  }, []);

  // Handler เมื่อมีการเปลี่ยน Rows per page
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    if (setLimit) {
      setLimit(newLimit);
      setPage(1); // Reset กลับไปหน้า 1 เมื่อเปลี่ยนขนาดหน้า
    }
  };

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
        sourceTypes={sourceTypes} // 🟢 ส่งรายการ Source Types ไปยัง FilterPanel
        selectedSource={selectedSource}
        selectedAreas={selectedAreas}
        selectedRanks={selectedRanks}
        selectedStatus={selectedStatus}
        selectedSourceType={selectedSourceType} // 🟢 ส่งค่าที่ถูกเลือก
        onSourceChange={setSelectedSource}
        onAreaChange={setSelectedAreas}
        onRankChange={setSelectedRanks}
        onStatusChange={setSelectedStatus}
        onSourceTypeChange={setSelectedSourceType} // 🟢 ส่ง Handler สำหรับอัปเดต State
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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">Journal List</h3>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="rows-per-page" className="font-medium text-gray-600">
                Rows per page:
              </label>
              <select
                id="rows-per-page"
                value={limit}
                onChange={handleLimitChange}
                disabled={loading}
                className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer disabled:opacity-50"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
              </select>
            </div>

            <span>
              Showing Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
        </div>

        <JournalTable
          journals={journals}
          sources={sources}
          selectedSourceId={selectedSourceId}
          loading={loading}
          onSelectJournal={handleSelectJournal}
        />

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
          {/* ข้อมูลจำนวนทั้งหมด */}
          <div className="text-xs text-gray-400">
            {pagination.totalCount !== undefined && (
              <span>Total {pagination.totalCount.toLocaleString()} items</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-gray-600 px-2">
              {page} / {pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
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
        Data Source updated at May 2026
      </div>
    </div>
  );
}