"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRatingBadgeTier } from "../lib/search-utils";

const systemStyles: Record<string, string> = {
  abdc: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100",     // ABDC: สีฟ้า
  scopus: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100", // Scopus: สีเขียว
  sjr: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100", // SJR/Scimago: สีส้ม
  scimago: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100", // Scimago: สีส้ม
  ajg: "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-100", // AJG: สีม่วง
};

interface RatingBadgeProps {
  system: "abdc" | "ajg" | "sjr" | "scopus" | "scimago" | string;
  value: string;
  className?: string;
}

const systemLabels: Record<string, string> = {
  abdc: "ABDC:",
  ajg: "AJG:",
  sjr: "SJR:",
  scimago: "Scimago:",
  scopus: "Scopus:",
};

export function RatingBadge({ system, value, className }: RatingBadgeProps) {
  // ดึงสไตล์ตาม system ถ้าไม่เจอให้ใช้สีเทามาตรฐาน
  const currentSystem = system.toLowerCase();
  const colorStyle = systemStyles[currentSystem] || "bg-gray-100 text-gray-700 border-gray-300";
  const label = systemLabels[currentSystem] || `${system.toUpperCase()}:`;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        colorStyle, // ใช้สีตาม Source ที่เราตั้งไว้
        className
      )}
    >
      {label} {value}
    </Badge>
  );
}
