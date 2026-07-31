"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { sourceConfig } from "../lib/chart-config";
import { formatCount, horizontalBarHeight, truncateLabel } from "../lib/chart-sizing";
import { useCategoryAxis } from "../hooks/use-category-axis";

interface Props {
  data: { name: string; count: number }[];
}

export function MajorGroupChart({ data }: Props) {
  const config = sourceConfig(data.map((d) => d.name));
  const axis = useCategoryAxis({ width: 200, chars: 38, fontSize: 13 });

  // เรียงข้อมูลจากมากไปน้อย
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // คำนวณความสว่าง (Lightness) ตามลำดับ Index
  const getColor = (index: number, total: number) => {
    const minL = 28; // เข้มสุด (28%)
    const maxL = 68; // อ่อนสุด (68%)
    const lightness = total > 1 ? minL + (index / (total - 1)) * (maxL - minL) : minL;
    return `hsl(217, 91%, ${lightness}%)`;
  };

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: horizontalBarHeight(sortedData.length, 48) }}
    >
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 8, right: 64, bottom: 8, left: 8 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: axis.fontSize }} tickFormatter={formatCount} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: axis.fontSize }}
          tickFormatter={(value: string) => truncateLabel(value, axis.chars)}
          interval={0}
          width={axis.width}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="count"
          radius={[0, 4, 4, 0]}
          maxBarSize={36}
        >
          {sortedData.map((_, index) => (
            <Cell key={index} fill={getColor(index, sortedData.length)} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            className="fill-foreground"
            fontSize={12}
            formatter={formatCount}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}