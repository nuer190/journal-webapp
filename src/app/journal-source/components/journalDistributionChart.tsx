"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartItem {
  subject_area_id: number;
  area_name: string;
  count: number;
}

interface SourceOption {
  id: number;
  source_name: string;
}

interface Props {
  data: ChartItem[];
  isTop10: boolean;
  selectedSourceId?: number;
  sources: SourceOption[];
}

export const JournalDistributionChart: React.FC<Props> = ({
  data,
  isTop10,
  selectedSourceId,
  sources,
}) => {
  // 1. หาค่า Base RGB ตาม Source ที่เลือก (Match แบบคลุมเครือ เพื่อรองรับชื่อเต็มใน DB)
  const baseRgb = useMemo(() => {
    const selectedSource = sources.find((s) => s.id === selectedSourceId);
    const sourceName = selectedSource ? selectedSource.source_name.toUpperCase() : "";

    if (sourceName.includes("ABDC")) {
      return { r: 14, g: 165, b: 233 }; // #0ea5e9
    }
    if (sourceName.includes("SCOPUS")) {
      return { r: 16, g: 185, b: 129 }; // #10b981
    }
    if (sourceName.includes("SCIMAGO") || sourceName.includes("SJR")) {
      return { r: 249, g: 115, b: 22 }; // #f97316
    }
    if (sourceName.includes("AJG") || sourceName.includes("CABS")) {
      return { r: 168, g: 85, b: 247 }; // #a855f7
    }

    return { r: 59, g: 130, b: 246 }; // #3b82f6
  }, [selectedSourceId, sources]);

  const { maxCount, minCount } = useMemo(() => {
    if (!data || data.length === 0) return { maxCount: 1, minCount: 0 };
    const counts = data.map((d) => d.count);
    return {
      maxCount: Math.max(...counts),
      minCount: Math.min(...counts),
    };
  }, [data]);

  const getItemColor = (count: number) => {
    if (maxCount === minCount) {
      return `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, 1)`;
    }
    // คำนวณความโปร่งแสงให้อยู่ช่วง 0.35 (อ่อนสุด) ถึง 1.0 (เข้มสุด)
    const opacity = 0.35 + ((count - minCount) / (maxCount - minCount)) * 0.65;
    return `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${opacity.toFixed(2)})`;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Journal Distribution by Area
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isTop10 ? (
              <span className="inline-flex items-center gap-1 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                🔥 แสดง 10 อันดับแรกที่มีจำนวนวารสารสูงสุด (Top 10 Areas)
              </span>
            ) : (
              "แสดงข้อมูลแยกตาม Subject Area ทั้งหมดตามเงื่อนไข Filter"
            )}
          </p>
        </div>
      </div>

      {/* Recharts Component */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 45 }}
          >
            <XAxis
              dataKey="area_name"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              interval={0}
              angle={-30}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} Journals`, "จำนวน"]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {/* บังคับ Re-render ด้วย key={`cell-${selectedSourceId}-${index}`} เพื่อให้เปลี่ยนสีทันทีที่เลือก Source */}
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${selectedSourceId || "default"}-${index}`}
                  fill={getItemColor(entry.count)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};