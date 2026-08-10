"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useJournalAreas } from "@/hooks/useJournalAreas";
import { useAreaFilters, type AreaRule } from "@/app/area-explorer/hooks/useAreaFilters";
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
import { X, BookOpen, Building2, Layers, Award } from "lucide-react";
import { AreaFilter } from "./components/area-filter";

const SOURCE_COLORS: Record<string, string> = {
  abdc: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  scopus: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  scimago: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  ajg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
};

const TIER_COLORS: Record<number, string> = {
  1: "bg-primary/10 text-primary border-primary/20",
  2: "bg-indigo-50 text-indigo-700 border-indigo-200",
  3: "bg-slate-50 text-slate-600 border-slate-200",
  4: "bg-stone-50 text-stone-500 border-stone-200",
  5: "bg-zinc-50 text-zinc-400 border-zinc-200",
};

const TIER_MAP: Record<string, number> = {
  "4*": 1, "4": 2, "3": 3, "2": 4, "1": 5,
  "A*": 2, "A": 3, "B": 4, "C": 5,
  "Q1": 2, "Q2": 3, "Q3": 4, "Q4": 5,
};

type RankItem = {
  value: string;
  source: "abdc" | "scopus" | "scimago" | "ajg";
  tier: number;
};

function getTopRanks(journal: {
  rating_2025?: string | null;
  ajg?: { ajg_2024_rating?: string | null } | null;
  scimago?: { sjr_best_quartile?: string | null } | null;
  scopus?: { quartile?: string | null } | null;
}): RankItem[] {
  const ranks: RankItem[] = [];

  if (journal.rating_2025?.trim()) {
    const val = journal.rating_2025.trim();
    if (TIER_MAP[val]) ranks.push({ value: val, source: "abdc", tier: TIER_MAP[val] });
  }

  if (journal.ajg?.ajg_2024_rating?.trim()) {
    const val = journal.ajg.ajg_2024_rating.trim();
    if (TIER_MAP[val]) ranks.push({ value: val, source: "ajg", tier: TIER_MAP[val] });
  }

  if (journal.scimago?.sjr_best_quartile?.trim()) {
    const val = journal.scimago.sjr_best_quartile.trim();
    if (TIER_MAP[val]) ranks.push({ value: val, source: "scimago", tier: TIER_MAP[val] });
  }

  if (journal.scopus?.quartile?.trim()) {
    const val = journal.scopus.quartile.trim();
    if (TIER_MAP[val]) ranks.push({ value: val, source: "scopus", tier: TIER_MAP[val] });
  }

  if (ranks.length === 0) return [];

  const bestTier = Math.min(...ranks.map((r) => r.tier));
  return ranks.filter((r) => r.tier === bestTier);
}

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

export default function AreaExplorer() {
  const router = useRouter();

  const {
    data: filters,
    isLoading: filtersLoading,
    majorGroup,
    areaGroup,
    areaRules,
    source,
    rank,
    setMajorGroup,
    setAreaGroup,
    setAreaRules,
    setSource,
    setRank,
    removeAreaRule,
    resetFilters,
  } = useAreaFilters();

  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const hasActiveFilters = Boolean(
    majorGroup || areaGroup || areaRules.length > 0 || source || rank
  );

  const journalQueryParams = useMemo(() => {
    const andAreas = areaRules.filter((r) => r.operator === "AND").map((r) => r.area);
    const orAreas = areaRules.filter((r) => r.operator === "OR").map((r) => r.area);
    const notAreas = areaRules.filter((r) => r.operator === "NOT").map((r) => r.area);
    const serializedAreaRules = areaRules.map((r) => `${encodeURIComponent(r.area)}:${r.operator}`).join(",");

    return {
      majorGroup: majorGroup || undefined,
      areaGroup: areaGroup || undefined,
      source: source || undefined,
      rank: rank || undefined,
      page: currentPage,
      limit: pageSize,
      areaRules: serializedAreaRules || undefined,
      andAreas: andAreas.length > 0 ? andAreas.join(",") : undefined,
      orAreas: orAreas.length > 0 ? orAreas.join(",") : undefined,
      notAreas: notAreas.length > 0 ? notAreas.join(",") : undefined,
    };
  }, [majorGroup, areaGroup, areaRules, source, rank, currentPage, pageSize]);

  const {
    data: journalAreasData,
    isLoading: journalAreasLoading,
    isFetching: journalAreasFetching,
  } = useJournalAreas(journalQueryParams);

  const { data: counters, isLoading: countersLoading } = useCounters();

  const journals = journalAreasData?.journals ?? [];
  const totalPages = journalAreasData?.totalPages ?? 1;
  const totalJournals = journalAreasData?.total ?? journals.length;

  // คำนวณสรุปข้อมูลสถิติของรายการทั้งหมดที่กรองได้ (Filtered Data)
  const summaryStats = useMemo(() => {
    // กรณีที่ Backend ส่งสรุปผลรวม (Aggregations) รายการทั้งหมดมาใน Response
    if (journalAreasData?.summary) {
      return {
        totalPublishers: journalAreasData.summary.totalPublishers ?? 0,
        abdcCount: journalAreasData.summary.abdcCount ?? 0,
        ajgCount: journalAreasData.summary.ajgCount ?? 0,
        scimagoCount: journalAreasData.summary.scimagoCount ?? 0,
        scopusCount: journalAreasData.summary.scopusCount ?? 0,
      };
    }

    // กรณีคำนวณจากชุดวารสารที่ดึงมา
    const publishersSet = new Set<string>();
    let abdcCount = 0;
    let ajgCount = 0;
    let scimagoCount = 0;
    let scopusCount = 0;

    journals.forEach((j: any) => {
      if (j.publisher && j.publisher.trim() !== "" && j.publisher !== "—") {
        publishersSet.add(j.publisher.trim());
      }
      if (j.rating_2025) abdcCount++;
      if (j.ajg?.ajg_2024_rating) ajgCount++;
      if (j.scimago?.sjr_best_quartile) scimagoCount++;
      if (j.scopus?.quartile) scopusCount++;
    });

    return {
      totalPublishers: publishersSet.size,
      abdcCount,
      ajgCount,
      scimagoCount,
      scopusCount,
    };
  }, [journalAreasData, journals]);

  const handlePageSizeChange = useCallback((value: string | null) => {
    if (value) {
      setPageSize(Number(value));
      setCurrentPage(1);
    }
  }, []);

  const visiblePages = useMemo(() => {
    if (totalPages <= 1) return [];
    const delta = 1;
    const range: number[] = [];
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Area Explorer
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse journals by major group, area group, area logic (AND, OR, NOT), source, and rank.
        </p>
      </div>

      <AreaFilter
        filters={filters}
        isLoading={filtersLoading}
        majorGroup={majorGroup}
        areaGroup={areaGroup}
        areaRules={areaRules}
        source={source}
        rank={rank}
        onMajorGroupChange={(val) => { setMajorGroup(val); setCurrentPage(1); }}
        onAreaGroupChange={(val) => { setAreaGroup(val); setCurrentPage(1); }}
        onAreaRulesChange={(rules) => { setAreaRules(rules); setCurrentPage(1); }}
        onSourceChange={(val) => { setSource(val); setCurrentPage(1); }}
        onRankChange={(val) => { setRank(val); setCurrentPage(1); }}
        onResetFilters={() => { resetFilters(); setCurrentPage(1); }}
      />

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-lg border bg-card">
          <span className="text-xs text-muted-foreground mr-1">Active Filters:</span>
          {majorGroup && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Major: {majorGroup}
              <button
                type="button"
                onClick={() => setMajorGroup(null)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {areaGroup && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Area Group: {areaGroup}
              <button
                type="button"
                onClick={() => setAreaGroup(null)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {areaRules.map((rule, idx) => {
            const operatorStyles = {
              AND: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300",
              OR: "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300",
              NOT: "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300",
            };

            return (
              <Badge
                key={`${rule.operator}-${rule.area}-${idx}`}
                variant="outline"
                className={`text-xs gap-1 pr-1 border font-medium ${operatorStyles[rule.operator]}`}
              >
                <span className="font-bold text-[10px] uppercase opacity-80">
                  [{rule.operator}]
                </span>
                {rule.area}
                <button
                  type="button"
                  onClick={() => removeAreaRule(rule.area)}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {source && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Source: {source}
              <button
                type="button"
                onClick={() => setSource(null)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {rank && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Rank: {rank}
              <button
                type="button"
                onClick={() => setRank(null)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <Card className="relative">
        {journalAreasFetching && !journalAreasLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden rounded-t-lg z-10">
            <div className="h-full bg-primary animate-pulse w-full" />
          </div>
        )}

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-heading text-xl flex items-center gap-2">
            Journals
            {!journalAreasLoading && (
              <span className="text-xs font-normal text-muted-foreground">
                ({totalJournals.toLocaleString()} items found)
              </span>
            )}
          </CardTitle>
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
              <Table className={journalAreasFetching ? "opacity-60 transition-opacity duration-200" : "transition-opacity duration-200"}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Journal Title</TableHead>
                    <TableHead className="w-[25%]">Publisher</TableHead>
                    <TableHead className="w-[20%]">Rank Quality</TableHead>
                    <TableHead>ISSN</TableHead>
                    <TableHead>ISSN Online</TableHead>
                    <TableHead>Top Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journals.map((journal: any) => (
                    <TableRow
                      key={journal.id}
                      onClick={() => router.push(`/journal/${journal.id}`)}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="line-clamp-2" title={journal.journal_title}>
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
                          {journal.rating_2025 && (
                            <RatingBadge label="ABDC" value={journal.rating_2025.trim()} source="abdc" />
                          )}
                          {journal.ajg?.ajg_2024_rating && (
                            <RatingBadge label="AJG" value={journal.ajg.ajg_2024_rating.trim()} source="ajg" />
                          )}
                          {journal.scimago?.sjr_best_quartile && (
                            <RatingBadge label="Scimago" value={journal.scimago.sjr_best_quartile.trim()} source="scimago" />
                          )}
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
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No journals found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="pt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          isActive={currentPage === 1}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {visiblePages.map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Summary Cards Section */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Filtered Journals</span>
              <BookOpen className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">
              {journalAreasLoading ? "..." : totalJournals.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? "Matches active criteria" : "Total available journals"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Publishers</span>
              <Building2 className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">
              {journalAreasLoading ? "..." : summaryStats.totalPublishers.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              System Total: {countersLoading ? "..." : (counters?.publishers?.toLocaleString() ?? "0")}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Areas Filtered</span>
              <Layers className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">
              {areaRules.length}
            </p>
            <p className="text-xs text-muted-foreground">
              System Areas: {countersLoading ? "..." : (counters?.areas?.toLocaleString() ?? "0")}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Ranked Journals</span>
              <Award className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">
              {journalAreasLoading ? "..." : (summaryStats.abdcCount + summaryStats.ajgCount + summaryStats.scimagoCount + summaryStats.scopusCount).toLocaleString()}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              ABDC:{summaryStats.abdcCount} | AJG:{summaryStats.ajgCount} | SJR:{summaryStats.scimagoCount}
            </p>
          </div>
        </div>

        {/* Timestamp Data Source */}
        <div className="flex justify-end text-xs text-muted-foreground pt-1 pr-1 font-mono">
          Data Source updated at 1 July 2026
        </div>
      </div>
    </div>
  );
}