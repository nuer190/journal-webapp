"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { ChartDataItem, Source } from "../hooks/useJournalSource";

interface ChartCardProps {
  data: ChartDataItem[];
  isTop10?: boolean;
  selectedSourceId?: number;
  sources?: Source[];
}

// ชุดสีหลัก (Base Color Hex) สำหรับแต่ละ Source
const SOURCE_COLOR_MAP: Record<string, { dark: string; light: string }> = {
  ABDC: { dark: "#1d4ed8", light: "#93c5fd" }, // สีน้ำเงิน
  SCOPUS: { dark: "#15803d", light: "#86efac" }, // สีเขียว
  SCIMAGO: { dark: "#c2410c", light: "#fdba74" }, // สีส้ม
  SJR: { dark: "#c2410c", light: "#fdba74" }, // สีส้ม (รองรับชื่อ SJR)
  AJG: { dark: "#7e22ce", light: "#d8b4fe" }, // สีม่วง
  DEFAULT: { dark: "#2563eb", light: "#bfdbfe" }, // สีน้ำเงินมาตรฐานกรณีไม่ระบุ
};

export function ChartCard({ data, isTop10, selectedSourceId, sources }: ChartCardProps) {
  const currentSource = sources?.find((s) => s.id === selectedSourceId);
  const sourceName = currentSource?.source_name || "All Sources";

  // หาชุดสีตามชื่อ Source (แปลงเป็นตัวพิมพ์ใหญ่เพื่อเทียบความถูกต้อง)
  const getSourceColors = (name: string) => {
    const upperName = name.toUpperCase();
    for (const key in SOURCE_COLOR_MAP) {
      if (upperName.includes(key)) {
        return SOURCE_COLOR_MAP[key];
      }
    }
    return SOURCE_COLOR_MAP.DEFAULT;
  };

  const activeColors = getSourceColors(sourceName);

  // ฟังก์ชันคำนวณการไล่สีจาก เข้ม -> อ่อน ตามอันดับแท่งกราฟ (Index 0 เข้มสุด)
  const getBarColor = (index: number, total: number) => {
    if (total <= 1) return activeColors.dark;

    // คำนวณค่า Factor ความโปร่งแสง/จางลงจาก 0.95 ถึง 0.35
    const minOpacity = 0.35;
    const maxOpacity = 0.95;
    const opacity = maxOpacity - (index / (total - 1)) * (maxOpacity - minOpacity);

    // แปลง Hex สีหลักให้เป็น rgba เพื่อควบคุมความโปร่งแสงในการไล่เฉดสี
    const hex = activeColors.dark.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // ย่อข้อความแกน X ไม่ให้ยาวเกินไป
  const formatXAxisLabel = (value: string) => {
    if (!value) return "";
    return value.length > 25 ? `${value.substring(0, 22)}...` : value;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Journal Distribution by Subject Area
          </h3>
          <p className="text-xs text-gray-400">
            Showing count of journals grouped by area (Source: <span className="font-semibold text-gray-700">{sourceName}</span>)
          </p>
        </div>
        {data.length > 0 && (
          <span className="self-start sm:self-auto text-[11px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
            Showing {data.length} Areas {isTop10 ? "(Top 10)" : data.length >= 30 ? "(Top 30 Max)" : ""}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          No chart data available for current selection.
        </div>
      ) : (
        <div className="w-full h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 110 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="area_name"
                interval={0}
                tickFormatter={formatXAxisLabel}
                angle={-45}
                textAnchor="end"
                dx={-5}
                dy={10}
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(243, 244, 246, 0.6)" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`${value} Journals`, "Count"]}
                labelFormatter={(label) => `Area: ${label}`}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(index, data.length)} // ใช้สีหลักของ Source + ไล่ความเข้มไปอ่อนตามอันดับ
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}