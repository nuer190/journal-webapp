import React from "react";
import { BookOpen, Building2, Layers } from "lucide-react";

interface SummaryCardsProps {
  totalJournals: number;
  totalPublishers: number;
  totalAreas: number;
  loading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalJournals,
  totalPublishers,
  totalAreas,
  loading = false,
}) => {
  const cards = [
    {
      title: "TOTAL JOURNALS",
      value: totalJournals,
      unit: "Journals",
      icon: BookOpen,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "ACTIVE PUBLISHERS",
      value: totalPublishers,
      unit: "Publishers",
      icon: Building2,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "SUBJECT AREAS",
      value: totalAreas,
      unit: "Categories",
      icon: Layers,
      iconBg: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                {card.title}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : card.value.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {card.unit}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-xl ${card.iconBg}`}>
              <IconComponent className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};