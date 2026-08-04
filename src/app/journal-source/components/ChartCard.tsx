"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

interface ChartCardProps {
  data?: ChartItem[];
  isTop10?: boolean;
  selectedSourceId?: number;
  sources?: SourceOption[];
}

export function ChartCard({
  data = [],
  isTop10 = false,
  selectedSourceId,
  sources = [],
}: ChartCardProps) {
  // 🟢 1. เลือกสี Base RGB ตาม Source ที่เลือกจาก Dropdown
  const baseRgb = useMemo(() => {
    const selectedSource = sources.find(
      (s) => Number(s.id) === Number(selectedSourceId)
    );
    const sourceName = selectedSource ? selectedSource.source_name.toUpperCase() : "";

    // ABDC -> โทนฟ้า (Sky Blue)
    if (sourceName.includes("ABDC")) {
      return { r: 14, g: 165, b: 233 }; // #0ea5e9
    }
    // SCOPUS -> โทนเขียว (Emerald)
    if (sourceName.includes("SCOPUS")) {
      return { r: 16, g: 185, b: 129 }; // #10b981
    }
    // SCIMAGO / SJR -> โทนส้ม (Orange)
    if (sourceName.includes("SCIMAGO") || sourceName.includes("SJR")) {
      return { r: 249, g: 115, b: 22 }; // #f97316
    }
    // AJG / CABS -> โทนม่วง (Purple)
    if (
      sourceName.includes("AJG") ||
      sourceName.includes("CABS") ||
      sourceName.includes("ASSOCIATION OF BUSINESS SCHOOLS")
    ) {
      return { r: 168, g: 85, b: 247 }; // #a855f7
    }

    // Default (ตอนยังไม่เลือก Source หรือไม่ตรงเงื่อนไข) -> โทนน้ำเงิน
    return { r: 59, g: 130, b: 246 }; // #3b82f6
  }, [selectedSourceId, sources]);

  // 🟢 2. คำนวณหาค่า Min และ Max Count เพื่อทำ Gradient เข้ม-อ่อน ตามจำนวน Journal
  const { maxCount, minCount } = useMemo(() => {
    if (!data || data.length === 0) return { maxCount: 1, minCount: 0 };
    const counts = data.map((d) => d.count);
    return {
      maxCount: Math.max(...counts),
      minCount: Math.min(...counts),
    };
  }, [data]);

  // ฟังก์ชันคำนวณเฉดสี RGBA ของแต่ละแท่ง
  const getItemColor = (count: number) => {
    if (maxCount === minCount) {
      return `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, 1)`;
    }
    // ปรับความเข้ม (Opacity) ตั้งแต่ 0.35 ถึง 1.0 ตามสัดส่วน Count
    const opacity = 0.35 + ((count - minCount) / (maxCount - minCount)) * 0.65;
    return `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${opacity.toFixed(2)})`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center text-gray-400">
        No distribution data available for chart.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-4">
      {/* 🟢 Header ปรับตัวหนังสือคำอธิบายตามแบบในภาพ */}
      <div className="flex flex-col justify-between gap-1">
        <h3 className="text-base font-bold text-gray-900">
          Journal Distribution by Area
        </h3>
        <p className="text-xs text-gray-500">
          {isTop10
            ? "แสดง 10 อันดับแรกที่มีจำนวนวารสารสูงสุด"
            : "แสดงข้อมูลแยกตาม Subject Area ตามเงื่อนไข Filter"}
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />

            {/* แกน X: แสดง Area Name เอียง 35 องศาเพื่อไม่ให้บังกัน */}
            <XAxis
              dataKey="area_name"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              dy={5}
            />

            {/* แกน Y: จำนวน Journal */}
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#FFF",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                border: "1px solid #E5E7EB",
              }}
              formatter={(value: any) => [`${Number(value).toLocaleString()} Journals`, "Count"]}
              labelFormatter={(label: any) => `Area: ${label}`}
            />

            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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
}