"use client";

import React from "react";

interface PaginationProps {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

interface JournalTableProps {
  journals: any[];
  onSelectJournal: (journal: any) => void;
  pagination?: PaginationProps;
}

export function JournalTable({ journals = [], onSelectJournal, pagination }: JournalTableProps) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      {/* Header Info Bar */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">
          Total Found: <span className="text-blue-600">{pagination?.totalCount ?? journals.length}</span> items
        </span>
        <span className="text-xs text-gray-400">Click any row to view full details</span>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Journal Title</th>
              <th className="p-4">Publisher</th>
              <th className="p-4">ISSN (Print / Online)</th>
              <th className="p-4">Source Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {journals.map((j, index) => (
              <tr
                key={j.id || index}
                onClick={() => onSelectJournal(j)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                <td className="p-4 font-medium text-gray-900 group-hover:text-blue-600">
                  {j.journal_title || j.title || "—"}
                </td>
                <td className="p-4 text-gray-500">{j.publisher || "—"}</td>
                <td className="p-4 font-mono text-xs text-gray-600">
                  {j.issn || "—"} / {j.issnOnline || "—"}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {j.rankQuality && j.rankQuality.length > 0 ? (
                      j.rankQuality.map((r: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md"
                        >
                          {r.rankValue}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">
                        Unranked
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🟢 Pagination & Page Limit Controls */}
      {pagination && (
        <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          {/* Rows Limit Dropdown */}
          <div className="flex items-center space-x-2">
            <span>Show rows:</span>
            <select
              value={pagination.limit}
              onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page Selector */}
          <div className="flex items-center space-x-4">
            <span>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </span>
            <div className="inline-flex space-x-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}