"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface JournalAreaItem {
  source: string;       // e.g., "Scopus", "ABDC", "AJG", "Scimago"
  areaGroup: string;    // e.g., "Business, Management and Accounting"
  area: string;         // e.g., "Marketing"
  rank: string;         // e.g., "Q1", "A*", "3"
}

interface JournalAreaTableProps {
  areas?: JournalAreaItem[];
}

// ฟังก์ชั่นสำหรับกำหนดสี Background Badge ตาม Source
function getSourceBadgeStyle(source: string) {
  const normalized = source.trim().toLowerCase();

  switch (normalized) {
    case "abdc":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    case "ajg":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
    case "scimago":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
    case "scopus":
      return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
  }
}

export function JournalAreaTable({ areas = [] }: JournalAreaTableProps) {
  if (!areas || areas.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground border rounded-md">
        No area details available for this journal.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Subject Areas & Ranks</h3>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[120px]">Source</TableHead>
              <TableHead>Area Group</TableHead>
              <TableHead>Area</TableHead>
              <TableHead className="w-[100px] text-center">Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((item, index) => (
              <TableRow key={`${item.source}-${item.area}-${index}`}>
                <TableCell className="font-medium">
                  <Badge variant="outline" className={getSourceBadgeStyle(item.source)}>
                    {item.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.areaGroup || "-"}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {item.area || "-"}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {item.rank || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}