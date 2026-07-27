"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJournalAreas } from "@/hooks/useJournalAreas";
import { useFilters } from "@/hooks/useFilters";
import { useCounters } from "@/hooks/useCounters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

// --- 1. กำหนดแมปสีตาม Source ต่างๆ ---
const SOURCE_COLORS: Record<string, string> = {
  abdc: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  scopus: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  scimago: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  ajg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
};

// Tier fallback เผื่อกรณีใช้จัดลำดับทั่วไป
const TIER_COLORS: Record<number, string> = {
  1: "bg-primary/10 text-primary border-primary/20",
  2: "bg-indigo-50 text-indigo-700 border-indigo-200",
  3: "bg-slate-50 text-slate-600 border-slate-200",
  4: "bg-stone-50 text-stone-500 border-stone-200",
  5: "bg-zinc-50 text-zinc-400 border-zinc-200",
};

// --- 2. แมปประเภท Rank ในแต่ละ Source เข้ากับ Tier ---
const TIER_MAP: Record<string, number> = {
  // AJG (ม่วง): 4*, 4, 3, 2, 1
  "4*": 1, "4": 2, "3": 3, "2": 4, "1": 5,
  // ABDC (ฟ้า): A*, A, B, C
  "A*": 2, "A": 3, "B": 4, "C": 5,
  // Scimago / Scopus (ส้ม/เขียว): Q1, Q2, Q3, Q4
  "Q1": 2, "Q2": 3, "Q3": 4, "Q4": 5,
};

type RankItem = {
  value: string;
  source: "abdc" | "scopus" | "scimago" | "ajg";
  tier: number;
};

function getTopRanks(journal: {
  rating_2025: string | null;
  ajg: { ajg_2024_rating: string | null } | null;
  scimago: { sjr_best_quartile: string | null } | null;
  scopus?: { quartile: string | null } | null;
}): RankItem[] {
  const ranks: RankItem[] = [];

  if (journal.rating_2025?.trim()) {
    const val = journal.rating_2025.trim();
    if (TIER_MAP[val]) {
      ranks.push({ value: val, source: "abdc", tier: TIER_MAP[val] });
    }
  }

  if (journal.ajg?.ajg_2024_rating?.trim()) {
    const val = journal.ajg.ajg_2024_rating.trim();
    if (TIER_MAP[val]) {
      ranks.push({ value: val, source: "ajg", tier: TIER_MAP[val] });
    }
  }

  if (journal.scimago?.sjr_best_quartile?.trim()) {
    const val = journal.scimago.sjr_best_quartile.trim();
    if (TIER_MAP[val]) {
      ranks.push({ value: val, source: "scimago", tier: TIER_MAP[val] });
    }
  }

  if (journal.scopus?.quartile?.trim()) {
    const val = journal.scopus.quartile.trim();
    if (TIER_MAP[val]) {
      ranks.push({ value: val, source: "scopus", tier: TIER_MAP[val] });
    }
  }

  if (ranks.length === 0) return [];

  // หาอันดับ Tier ที่ดีที่สุด (ค่าน้อยที่สุด)
  const bestTier = Math.min(...ranks.map((r) => r.tier));
  
  // คืนค่าเฉพาะตัวที่เป็น Top Rank (อาจมีมากกว่า 1 Source ที่ได้ Tier เท่ากัน)
  return ranks.filter((r) => r.tier === bestTier);
}

// --- 3. Badge แสดงผลโดยแยกสีตาม Source ---
function RatingBadge({
  label,
  value,
  source,
}: {
  label: string;
  value: string;
  source: "abdc" | "scopus" | "scimago" | "ajg";
}) {
  const color = SOURCE_COLORS[source] ?? TIER_COLORS[5];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${color}`}>
      {label}: {value}
    </Badge>
  );
}

function ComboboxFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: string[];
}) {
  const allOptions = [null, ...options];

  return (
    <Combobox
      items={allOptions}
      value={value}
      onValueChange={onChange}
      itemToStringValue={(item) => item ?? `All ${label}`}
    >
      <ComboboxInput placeholder={value ?? label} className="w-[180px]" />
      <ComboboxContent>
        <ComboboxEmpty>No {label.toLowerCase()} found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item ?? "all"} value={item}>
              {item ?? `All ${label}`}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function AreaExplorer() {
  const router = useRouter();
  const [majorGroup, setMajorGroup] = useState<string | null>(null);
  const [areaGroup, setAreaGroup] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [rank, setRank] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: filters, isLoading: filtersLoading } = useFilters();
  const { data: journalAreasData, isLoading: journalAreasLoading } = useJournalAreas({
    majorGroup: majorGroup ?? undefined,
    areaGroup: areaGroup ?? undefined,
    area: area ?? undefined,
    source: source ?? undefined,
    rank: rank ?? undefined,
    page: currentPage,
    limit: pageSize,
  });
  const { data: counters, isLoading: countersLoading } = useCounters();

  const journals = journalAreasData?.journals ?? [];
  const totalPages = journalAreasData?.totalPages ?? 1;

  const handleFilterChange = (setter: (value: string | null) => void) => (value: string | null) => {
    setter(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      setPageSize(Number(value));
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Area Explorer
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse journals by major group, area group, area, source, and rank.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          {filtersLoading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-[180px]" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <ComboboxFilter
                label="Major Group"
                value={majorGroup}
                onChange={handleFilterChange(setMajorGroup)}
                options={filters?.majorGroups ?? []}
              />
              <ComboboxFilter
                label="Area Group"
                value={areaGroup}
                onChange={handleFilterChange(setAreaGroup)}
                options={filters?.areaGroups ?? []}
              />
              <ComboboxFilter
                label="Area"
                value={area}
                onChange={handleFilterChange(setArea)}
                options={filters?.areas ?? []}
              />
              <ComboboxFilter
                label="Source"
                value={source}
                onChange={handleFilterChange(setSource)}
                options={filters?.sources ?? []}
              />
              <ComboboxFilter
                label="Rank"
                value={rank}
                onChange={handleFilterChange(setRank)}
                options={filters?.ranks ?? []}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-xl">Journals</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {journalAreasLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Journal Title</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Rank Quality</TableHead>
                    <TableHead>ISSN</TableHead>
                    <TableHead>ISSN Online</TableHead>
                    <TableHead>Top Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journals.map((journal: {
                    id: number;
                    journal_title: string;
                    publisher: string | null;
                    rating_2025: string | null;
                    issn_print: string | null;
                    issn_online: string | null;
                    ajg: { ajg_2024_rating: string | null } | null;
                    scimago: { sjr_best_quartile: string | null } | null;
                    scopus?: { quartile: string | null } | null;
                  }) => (
                    <TableRow
                      key={journal.id}
                      onClick={() => router.push(`/journal/${journal.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="line-clamp-3" title={journal.journal_title}>
                          {journal.journal_title}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="line-clamp-2" title={journal.publisher ?? ""}>
                          {journal.publisher ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {/* ABDC - สีฟ้า */}
                          {journal.rating_2025 && (
                            <RatingBadge label="ABDC" value={journal.rating_2025.trim()} source="abdc" />
                          )}
                          {/* AJG - สีม่วง */}
                          {journal.ajg?.ajg_2024_rating && (
                            <RatingBadge label="AJG" value={journal.ajg.ajg_2024_rating.trim()} source="ajg" />
                          )}
                          {/* Scimago - สีส้ม */}
                          {journal.scimago?.sjr_best_quartile && (
                            <RatingBadge label="Scimago" value={journal.scimago.sjr_best_quartile.trim()} source="scimago" />
                          )}
                          {/* Scopus - สีเขียว (รองรับหากมีข้อมูล) */}
                          {journal.scopus?.quartile && (
                            <RatingBadge label="Scopus" value={journal.scopus.quartile.trim()} source="scopus" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {journal.issn_print ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {journal.issn_online ?? "—"}
                      </TableCell>
                      <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getTopRanks(journal).map((rankItem, index) => {
                          const color = SOURCE_COLORS[rankItem.source] ?? TIER_COLORS[5];
                          return (
                            <Badge 
                              key={`${rankItem.source}-${rankItem.value}-${index}`} 
                              variant="outline" 
                              className={`text-xs font-medium ${color}`}
                            >
                              {rankItem.value}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    </TableRow>
                  ))}
                  {journals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No journals found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="pt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {countersLoading ? "..." : counters?.journals?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Journals</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {countersLoading ? "..." : counters?.publishers?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Publishers</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {countersLoading ? "..." : counters?.areas?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Areas</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold">{counters?.databases ?? 4}</p>
          <p className="text-sm text-muted-foreground">Databases</p>
        </div>
      </div>
    </div>
  );
}