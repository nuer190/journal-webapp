"use client";

import React from "react";
import { Summary } from "../hooks/useJournalSource";

interface SummaryCardsProps {
  summary: Summary;
  loading?: boolean;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards = [
    { title: "Total Journals", value: summary.totalJournals, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Publishers", value: summary.totalPublishers, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Subject Areas", value: summary.totalAreas, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
            <h4 className={`text-2xl font-black mt-1 ${card.color}`}>
              {loading ? "..." : card.value.toLocaleString()}
            </h4>
          </div>
          <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center font-bold ${card.color}`}>
            #
          </div>
        </div>
      ))}
    </div>
  );
}