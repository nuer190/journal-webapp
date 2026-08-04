"use client";

import React from "react";
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

interface ChartCardProps {
  data: ChartItem[];
}

const BAR_COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#2563EB", "#1D4ED8"];

export function ChartCard({ data = [] }: ChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center text-gray-400">
        No distribution data available for chart.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-4">
      <h3 className="text-base font-bold text-gray-900">
        Journal Distribution by Area
      </h3>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            
            {/* 🟢 แกน X: แสดง Area Name เอียง 35 องศาเพื่อไม่ให้บังกัน */}
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
              formatter={(value: any) => [`${value} Journals`, "Count"]}
              labelFormatter={(label: any) => `Area: ${label}`}
            />

            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}