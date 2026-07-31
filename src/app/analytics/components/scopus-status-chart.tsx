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
  byStatus: { status: string; count: number }[];
  bySourceType: { type: string; count: number }[];
}

const SCOPUS_COLOR_MAP: Record<string, string> = {
  // Status
  active: "#22c55e",       // เขียว
  inactive: "#ef4444",     // แดง
  discontinued: "#ef4444", // แดง
  
  // Source Type
  journal: "#22c55e",      // เขียว
  "book series": "#854d0e",// น้ำตาล
  book: "#854d0e",         // น้ำตาล
  "trade journal": "#38bdf8", // ฟ้า
  "trade publication": "#38bdf8",
};

export function ScopusStatusChart({ byStatus, bySourceType }: Props) {
  const getItemColor = (name: string) => {
    const key = name.toLowerCase().trim();
    return SCOPUS_COLOR_MAP[key] || "#94a3b8";
  };

  const statusItems = byStatus.map((d) => ({
    name: d.status,
    count: d.count,
    fill: getItemColor(d.status),
  }));

  const sourceTypeItems = bySourceType.map((d) => ({
    name: d.type,
    count: d.count,
    fill: getItemColor(d.type),
  }));

  const panels = [
    {
      key: "status",
      label: "Active Status",
      items: statusItems,
    },
    {
      key: "sourceType",
      label: "Source Type",
      items: sourceTypeItems,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {panels.map((panel) => (
        <div key={panel.key}>
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            {panel.label}
          </p>
          <ChartContainer
            config={sourceConfig(panel.items.map((d) => d.name))}
            className="aspect-auto h-[380px] w-full"
          >
            <PieChart margin={PIE_CHART_LABEL_MARGIN}>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={panel.items}
                dataKey="count"
                nameKey="name"
                innerRadius={90}
                outerRadius={160}
                strokeWidth={2}
                stroke="#FFFFFF"
                label={renderPieSliceLabel}
                labelLine={{ stroke: PIE_LABEL_LINE_COLOR, strokeWidth: 1 }}
              >
                {panel.items.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend items={panel.items} className="mt-4" />
        </div>
      ))}
    </div>
  );
}