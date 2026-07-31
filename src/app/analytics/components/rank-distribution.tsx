"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { sourceConfig } from "../lib/chart-config";
import { formatCount } from "../lib/chart-sizing";

interface Props {
  data: {
    ABDC: { rating: string; count: number }[];
    AJG: { rating: string; count: number }[];
    Scimago: { rating: string; count: number }[];
  };
}

// ลำดับการเรียงแกน X (สูง -> ต่ำ)
const ORDER_MAP: Record<string, string[]> = {
  ABDC: ["A*", "A", "B", "C"],
  AJG: ["4*", "4", "3", "2", "1"],
  Scimago: ["Q1", "Q2", "Q3", "Q4"],
};

// สีและเฉดสีไล่ระดับตาม Rank
const RANK_COLOR_MAP: Record<string, Record<string, string>> = {
  ABDC: {
    "A*": "#0284c7", // ฟ้าเข้ม
    A: "#38bdf8",    // ฟ้า
    B: "#7dd3fc",    // ฟ้าอ่อน
    C: "#bae6fd",    // ฟ้าจาง
  },
  AJG: {
    "4*": "#6b21a8", // ม่วงเข้ม
    "4": "#8b5cf6",  // ม่วง
    "3": "#a78bfa",  // ม่วงปานกลาง
    "2": "#c4b5fd",  // ม่วงอ่อน
    "1": "#ddd6fe",  // ม่วงจาง
  },
  Scimago: {
    Q1: "#c2410c",   // ส้มเข้ม
    Q2: "#f97316",   // ส้ม
    Q3: "#fb923c",   // ส้มอ่อน
    Q4: "#ffedd5",   // ส้มจาง
  },
};

export function RankDistribution({ data }: Props) {
  // ฟังก์ชันจัดเรียงและใส่สีข้อมูล
  const processRows = (sourceKey: "ABDC" | "AJG" | "Scimago", rows: { rating: string; count: number }[]) => {
    const order = ORDER_MAP[sourceKey] || [];
    const colors = RANK_COLOR_MAP[sourceKey] || {};

    return [...(rows || [])]
      .sort((a, b) => {
        const indexA = order.indexOf(a.rating.trim());
        const indexB = order.indexOf(b.rating.trim());
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
      .map((row) => ({
        ...row,
        fill: colors[row.rating.trim()] || "#94a3b8",
      }));
  };

  const panels = [
    { key: "ABDC", label: "ABDC Rating", rows: processRows("ABDC", data.ABDC) },
    { key: "AJG", label: "AJG Rating", rows: processRows("AJG", data.AJG) },
    { key: "Scimago", label: "Scimago Quartile", rows: processRows("Scimago", data.Scimago) },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {panels.map((panel) => (
        <div key={panel.key}>
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            {panel.label}
          </p>
          <ChartContainer
            config={sourceConfig([panel.key])}
            className="aspect-auto h-[380px] w-full"
          >
            <BarChart data={panel.rows} margin={{ top: 24, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="rating" tick={{ fontSize: 13 }} interval={0} />
              <YAxis tick={{ fontSize: 13 }} tickFormatter={formatCount} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                maxBarSize={64}
              >
                {panel.rows.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  className="fill-foreground"
                  fontSize={12}
                  formatter={formatCount}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      ))}
    </div>
  );
}