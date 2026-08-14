"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RatingBadge } from "./rating-badge";
import type { JournalSearchResult } from "../hooks/use-journal-search";

interface ResultsTableProps {
  journals: JournalSearchResult[];
}

export function ResultsTable({ journals }: ResultsTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-secondary">
          <TableRow className="border-b border-border hover:bg-secondary [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-foreground">
            <TableHead className="w-[300px]">Journal Title</TableHead>
            <TableHead>Publisher</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>ABDC</TableHead>
            <TableHead>AJG</TableHead>
            <TableHead>SJR</TableHead>
            <TableHead>ISSN</TableHead>
            <TableHead>eISSN</TableHead>
            <TableHead>Scopus Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {journals.map((journal) => (
            <TableRow
              key={journal.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/journal/${journal.id}`)}
            >
              <TableCell className="font-medium">{journal.journal_title}</TableCell>
              <TableCell>{journal.publisher ?? "—"}</TableCell>
              <TableCell>{journal.abdc_area ?? "—"}</TableCell>
              <TableCell>
                {journal.rating_2025 ? (
                  <RatingBadge system="abdc" value={journal.rating_2025} />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {journal.ajg?.ajg_2024_rating ? (
                  <RatingBadge system="ajg" value={journal.ajg.ajg_2024_rating} />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {journal.scimago?.sjr_best_quartile ? (
                  <RatingBadge system="sjr" value={journal.scimago.sjr_best_quartile} />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-sm">{journal.issn_print ?? "—"}</TableCell>
              <TableCell className="text-sm">{journal.issn_online ?? "—"}</TableCell>
              <TableCell>
                {journal.scopus?.active_status ? (
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        journal.scopus.active_status === "Active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm">{journal.scopus.active_status}</span>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
