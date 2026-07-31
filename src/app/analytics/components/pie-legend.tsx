"use client";

import { cn } from "@/lib/utils";
import { formatCount } from "../lib/chart-sizing";

interface PieLegendItem {
  name: string;
  count: number;
  fill?: string; // รองรับการส่งสีตรงมาจาก Component แม่
}

interface Props {
  items: PieLegendItem[];
  className?: string;
}

// สีสำรองเผื่อไอเทมไม่ได้ส่ง fill มา
const FALLBACK_COLORS = ["#38bdf8", "#a855f7", "#f97316", "#22c55e", "#64748b"];

export function PieLegend({ items, className }: Props) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={cn("flex flex-col gap-2.5 text-sm", className)}>
      {items.map((item, index) => {
        // ใช้สี fill ที่ส่งมาจากไอเทม หรือใช้สีสำรองถ้าไม่มี
        const badgeColor = item.fill || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";

        return (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4 rounded-md p-1.5 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* จุดสี Legend ที่จะเปลี่ยนตาม fill */}
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: badgeColor }}
              />
              <span className="truncate font-medium text-foreground">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs">
              <span className="font-semibold text-foreground">
                {formatCount(item.count)}
              </span>
              <span className="w-12 text-right text-muted-foreground">
                ({percentage}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}