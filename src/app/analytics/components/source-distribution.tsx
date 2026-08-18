// components/source-distribution.tsx

"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { sourceConfig } from "../lib/chart-config";
import { PieLegend } from "./pie-legend";
import {
  PIE_CHART_LABEL_MARGIN,
  PIE_LABEL_LINE_COLOR,
  renderPieSliceLabel,
} from "./pie-slice-label";

interface Props {
  data: { name: string; count: number }[];
}

const SOURCE_COLORS: Record<string, string> = {
  abdc: "#38bdf8",    // ฟ้า
  ajg: "#a855f7",     // ม่วง
  scimago: "#f97316", // ส้ม
  scopus: "#22c55e",  // เขียว
};

// 🟢 ฐาน ABDC
const ABDC_BASE_COUNT = 2649;

export function SourceDistribution({ data }: Props) {
  const config = sourceConfig(data.map((d) => d.name));

  const dataWithColors = data.map((item) => {
    const key = item.name.toLowerCase();
    const fill = SOURCE_COLORS[key] || "#94a3b8";
    return { ...item, fill };
  });

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-16">
      <ChartContainer
        config={config}
        className="aspect-auto h-[420px] w-full max-w-[440px]"
      >
        <PieChart margin={PIE_CHART_LABEL_MARGIN}>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={dataWithColors}
            dataKey="count"
            nameKey="name"
            innerRadius={100}
            outerRadius={175}
            strokeWidth={2}
            stroke="#FFFFFF"
            label={renderPieSliceLabel}
            labelLine={{ stroke: PIE_LABEL_LINE_COLOR, strokeWidth: 1 }}
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      
      {/* 🟢 ส่ง totalBase={ABDC_BASE_COUNT} ไปที่ PieLegend */}
      <PieLegend 
        items={dataWithColors} 
        totalBase={ABDC_BASE_COUNT} 
        className="w-full max-w-[340px]" 
      />
    </div>
  );
}