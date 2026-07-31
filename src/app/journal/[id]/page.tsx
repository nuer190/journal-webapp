"use client";

import { useParams, useRouter } from "next/navigation";
import { useJournalDetail } from "@/hooks/useJournalDetail";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Info, Copy, Check, Database, BookOpen, Calendar, FileText } from "lucide-react";
import { useState } from "react";

type SourceKey = "abdc" | "ajg" | "scimago" | "scopus";

const TIER_COLORS: Record<number, string> = {
  1: "bg-primary/10 text-primary border-primary/20",
  2: "bg-indigo-50 text-indigo-700 border-indigo-200",
  3: "bg-slate-50 text-slate-600 border-slate-200",
  4: "bg-stone-50 text-stone-500 border-stone-200",
  5: "bg-zinc-50 text-zinc-400 border-zinc-200",
};

const TIER_MAP: Record<string, number> = {
  "4*": 1,
  "A*": 2, "4": 2, "Q1": 2,
  "A": 3, "3": 3, "Q2": 3,
  "B": 4, "2": 4, "Q3": 4,
  "C": 5, "1": 5, "Q4": 5,
};

const TIER_DESCRIPTIONS: Record<number, string> = {
  1: "Highest prestige",
  2: "Excellent",
  3: "Very Good",
  4: "Good",
  5: "Standard",
};

const SOURCE_LABELS: Record<SourceKey, string> = {
  abdc: "ABDC",
  ajg: "AJG",
  scimago: "Scimago",
  scopus: "Scopus",
};

const SOURCE_ACCENTS: Record<SourceKey, string> = {
  abdc: "border-l-sky-500 bg-sky-50/40",
  ajg: "border-l-purple-500 bg-purple-50/40",
  scimago: "border-l-amber-500 bg-amber-50/40",
  scopus: "border-l-emerald-500 bg-emerald-50/40",
};

const SOURCE_ROW_BG: Record<SourceKey, string> = {
  abdc: "bg-sky-50/70 hover:bg-sky-100/70 text-sky-950",
  ajg: "bg-purple-50/70 hover:bg-purple-100/70 text-purple-950",
  scimago: "bg-amber-50/70 hover:bg-amber-100/70 text-amber-950",
  scopus: "bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950",
};

const SOURCE_BADGE_COLORS: Record<SourceKey, string> = {
  abdc: "bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200",
  ajg: "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200",
  scimago: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200",
  scopus: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200",
};

function hasValue(value: string | string[] | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0 && value.some((v) => v && v.trim() !== "");
  return value.trim() !== "";
}

function RankBadge({ value, source }: { value: string | null; source?: SourceKey }) {
  if (!value || !value.trim()) {
    return <span className="text-muted-foreground">—</span>;
  }
  const trimmed = value.trim();
  const tier = TIER_MAP[trimmed] ?? 5;
  const description = TIER_DESCRIPTIONS[tier] ?? "Standard";

  const colorClass = source
    ? SOURCE_BADGE_COLORS[source]
    : (TIER_COLORS[tier] ?? TIER_COLORS[5]);

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Badge 
          variant="outline" 
          className={`text-xs font-medium cursor-help ${colorClass}`}
        >
          {trimmed}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto px-3 py-2" sideOffset={5}>
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="text-xs">
            <span className="font-medium">Tier {tier}:</span>{" "}
            <span className="text-muted-foreground">{description}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function StatusBadge({ value }: { value: string | null }) {
  if (!value || !value.trim()) {
    return <span className="text-muted-foreground">—</span>;
  }
  const trimmed = value.trim().toLowerCase();
  
  let color = "bg-gray-50 text-gray-600 border-gray-200";
  if (trimmed === "active") {
    color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (trimmed === "inactive" || trimmed === "discontinued") {
    color = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <Badge variant="outline" className={`text-xs font-medium ${color}`}>
      {value.trim()}
    </Badge>
  );
}

function AreaList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="text-muted-foreground mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------- Interfaces ----------------

interface AreaDetail {
  area: string;
  area_group: string | null;
  major_group: string | null;
  rank: string | null;
}

interface ABDCData {
  id: number;
  issn_print: string | null;
  issn_online: string | null;
  year_inception?: number | null;
  for_code?: number | null;
  abdc_area: string | null;
  rating_2025: string | null;
  notes?: string | null;
  area_details: AreaDetail[];
}

interface AJGData {
  id: number;
  ajg_match_key?: string | null;
  ajg_issn?: string | null;
  ajg_title?: string | null;
  ajg_subject_area: string | null;
  ajg_2024_rating: string | null;
  area_details: AreaDetail[];
}

interface SCIMAGOData {
  id: number;
  scimago_issn?: string | null;
  scimago_eissn?: string | null;
  scimago_title?: string | null;
  sjr_best_quartile: string | null;
  scimago_categories?: string | null;
  scimago_match_key?: string | null;
  scimago_areas: string | null;
  area_details: AreaDetail[];
}

interface SCOPUSData {
  active_status: string | null;
  coverage_years: string | null;
  source_type: string | null;
  discontinued: string | null;
  area_details: AreaDetail[];
}

interface NoteData {
  id: number;
  note_primary: string | null;
  note_secondary_1: string | null;
  note_secondary_2: string | null;
  note_secondary_3: string | null;
  adjustment_reason: string | null;
}

interface JournalData {
  id: number;
  journal_title: string;
  publisher: string | null;
  abdc: ABDCData | null;
  ajg: AJGData | null;
  scimago: SCIMAGOData | null;
  scopus: SCOPUSData | null;
  note: NoteData | null;
  error?: string;
}

interface AreaRowDetail {
  source: SourceKey;
  majorGroup: string | null;
  areaGroup: string | null;
  area: string | null;
  rank: React.ReactNode;
}

// ตรวจสอบ Source ที่มีข้อมูล
function getVisibleSources(journal: JournalData): SourceKey[] {
  const visibleSet = new Set<SourceKey>();

  if (journal.abdc && journal.abdc.area_details && journal.abdc.area_details.length > 0) {
    visibleSet.add("abdc");
  }
  if (journal.ajg && journal.ajg.area_details && journal.ajg.area_details.length > 0) {
    visibleSet.add("ajg");
  }
  if (journal.scimago && journal.scimago.area_details && journal.scimago.area_details.length > 0) {
    visibleSet.add("scimago");
  }
  if (journal.scopus && journal.scopus.area_details && journal.scopus.area_details.length > 0) {
    visibleSet.add("scopus");
  }

  return Array.from(visibleSet);
}

// รวม Rows สำหรับ Area Details Breakdown
function buildDetailedAreaRows(journal: JournalData): AreaRowDetail[] {
  const rows: AreaRowDetail[] = [];
  const sources: SourceKey[] = ["abdc", "ajg", "scimago", "scopus"];

  sources.forEach((sourceKey) => {
    const sourceData = journal[sourceKey];
    if (sourceData && sourceData.area_details && sourceData.area_details.length > 0) {
      sourceData.area_details.forEach((item) => {
        const isScopus = sourceKey === "scopus";
        rows.push({
          source: sourceKey,
          majorGroup: item.major_group || "—",
          areaGroup: item.area_group || "—",
          area: item.area || "—",
          rank: isScopus ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <RankBadge value={item.rank} source={sourceKey} />
          ),
        });
      });
    }
  });

  return rows;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 w-6 p-0">
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function DataCompletenessIndicator({ journal }: { journal: JournalData }) {
  const sources = getVisibleSources(journal);
  const count = sources.length;
  const percentage = (count / 4) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Indexed in {count}/4 databases</p>
              <div className="flex gap-1.5 mt-1">
                {(["abdc", "ajg", "scimago", "scopus"] as SourceKey[]).map((source) => {
                  const isIndexed = sources.includes(source);
                  return (
                    <Badge
                      key={source}
                      variant="outline"
                      className={
                        isIndexed
                          ? SOURCE_BADGE_COLORS[source]
                          : "opacity-40 bg-gray-50 text-gray-400 border-gray-200"
                      }
                    >
                      {SOURCE_LABELS[source]}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JournalIdentifiers({ journal }: { journal: JournalData }) {
  const issnPrint = journal.abdc?.issn_print;
  const issnOnline = journal.abdc?.issn_online;
  const coverageYears = journal.scopus?.coverage_years;
  const sourceType = journal.scopus?.source_type;
  const discontinued = journal.scopus?.discontinued;

  const hasAnyData = issnPrint || issnOnline || coverageYears || sourceType || discontinued;

  if (!hasAnyData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Journal Identifiers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {issnPrint && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ISSN (Print)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{issnPrint}</span>
                <CopyButton text={issnPrint} />
              </div>
            </div>
          )}
          {issnOnline && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ISSN (Online)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{issnOnline}</span>
                <CopyButton text={issnOnline} />
              </div>
            </div>
          )}
          {sourceType && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Source Type</span>
              <Badge variant="outline">{sourceType}</Badge>
            </div>
          )}
          {coverageYears && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coverage Years</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{coverageYears}</span>
              </div>
            </div>
          )}
          {discontinued && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Discontinued</span>
              <StatusBadge value={discontinued} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NotesSection({ journal }: { journal: JournalData }) {
  const note = journal.note;
  if (!note) return null;

  const hasAnyNote =
    note.note_primary ||
    note.note_secondary_1 ||
    note.note_secondary_2 ||
    note.note_secondary_3 ||
    note.adjustment_reason;
  if (!hasAnyNote) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes & Adjustments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {note.note_primary && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Primary Note</p>
              <p className="text-sm">{note.note_primary}</p>
            </div>
          )}
          {note.adjustment_reason && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Adjustment Reason</p>
              <p className="text-sm">{note.adjustment_reason}</p>
            </div>
          )}
          {note.note_secondary_1 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Secondary Note 1</p>
              <p className="text-sm">{note.note_secondary_1}</p>
            </div>
          )}
          {note.note_secondary_2 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Secondary Note 2</p>
              <p className="text-sm">{note.note_secondary_2}</p>
            </div>
          )}
          {note.note_secondary_3 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Secondary Note 3</p>
              <p className="text-sm">{note.note_secondary_3}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions({ journal }: { journal: JournalData }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopyInfo = async () => {
    const info = `${journal.journal_title}${journal.publisher ? ` - ${journal.publisher}` : ""}`;
    await navigator.clipboard.writeText(info);
    setCopied("info");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyInfo}>
            {copied === "info" ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Journal Info
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareLink}>
            {copied === "link" ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Share Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RankTierReference() {
  return (
    <Card>
      <Accordion className="w-full" >
        <AccordionItem value="understanding-rank-tiers">
          <AccordionTrigger className="px-6">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <span className="font-heading text-lg">Understanding Rank Tiers</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>ABDC</TableHead>
                  <TableHead>AJG</TableHead>
                  <TableHead>Scimago</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline" className={TIER_COLORS[1]}>1</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell><RankBadge value="4*" source="ajg" /></TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell className="text-muted-foreground">Highest prestige</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline" className={TIER_COLORS[2]}>2</Badge>
                  </TableCell>
                  <TableCell><RankBadge value="A*" source="abdc" /></TableCell>
                  <TableCell><RankBadge value="4" source="ajg" /></TableCell>
                  <TableCell><RankBadge value="Q1" source="scimago" /></TableCell>
                  <TableCell className="text-muted-foreground">Excellent</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline" className={TIER_COLORS[3]}>3</Badge>
                  </TableCell>
                  <TableCell><RankBadge value="A" source="abdc" /></TableCell>
                  <TableCell><RankBadge value="3" source="ajg" /></TableCell>
                  <TableCell><RankBadge value="Q2" source="scimago" /></TableCell>
                  <TableCell className="text-muted-foreground">Very Good</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline" className={TIER_COLORS[4]}>4</Badge>
                  </TableCell>
                  <TableCell><RankBadge value="B" source="abdc" /></TableCell>
                  <TableCell><RankBadge value="2" source="ajg" /></TableCell>
                  <TableCell><RankBadge value="Q3" source="scimago" /></TableCell>
                  <TableCell className="text-muted-foreground">Good</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline" className={TIER_COLORS[5]}>5</Badge>
                  </TableCell>
                  <TableCell><RankBadge value="C" source="abdc" /></TableCell>
                  <TableCell><RankBadge value="1" source="ajg" /></TableCell>
                  <TableCell><RankBadge value="Q4" source="scimago" /></TableCell>
                  <TableCell className="text-muted-foreground">Standard</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export default function JournalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const journalId = parseInt(params.id, 10);
  const isValidId = !isNaN(journalId) && journalId > 0;

  const { data: journal, isLoading } = useJournalDetail(
    isValidId ? journalId : null
  );

  if (!isValidId || (journal && journal.error)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Journal not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The journal you are looking for does not exist or the ID is invalid.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !journal) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const detailedRows = buildDetailedAreaRows(journal);

  // ดึง Best Rank ประจำ Source
  const getBestRank = (source: SourceKey) => {
    if (source === "abdc") return journal.abdc?.rating_2025 ?? null;
    if (source === "ajg") return journal.ajg?.ajg_2024_rating ?? null;
    if (source === "scimago") return journal.scimago?.sjr_best_quartile ?? null;
    if (source === "scopus") return null; // Scopus ไม่มี Rank
    return null;
  };

  // ดึงรายการ Area ทั้งหมดจาก area_details
  const getSourceAreas = (source: SourceKey): string[] => {
    const sourceData = journal[source];
    if (sourceData && Array.isArray(sourceData.area_details)) {
      return (sourceData.area_details as Array<{ area: string }>)
        .map((item) => item.area)
        .filter(Boolean);
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {journal.journal_title}
        </h1>
        {journal.publisher && (
          <p className="mt-1 text-muted-foreground">{journal.publisher}</p>
        )}
      </div>

      <DataCompletenessIndicator journal={journal} />

      <JournalIdentifiers journal={journal} />

      {/* 1. Cross-Source Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Cross-Source Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const visibleSources = getVisibleSources(journal);
            if (visibleSources.length === 0) {
              return (
                <p className="text-center text-muted-foreground py-6">
                  No comparison data available for this journal.
                </p>
              );
            }

            const renderCell = (source: SourceKey, row: "area" | "best_rank" | "active") => {
              if (row === "area") {
                return <AreaList items={getSourceAreas(source)} />;
              }
              if (row === "best_rank") {
                if (source === "scopus") {
                  return <span className="text-muted-foreground">—</span>;
                }
                const bestRank = getBestRank(source);
                return <RankBadge value={bestRank} source={source} />;
              }
              if (row === "active") {
                if (source === "scopus") {
                  return <StatusBadge value={journal.scopus?.active_status ?? null} />;
                }
                return <span className="text-muted-foreground">—</span>;
              }
              return <span className="text-muted-foreground">—</span>;
            };

            return (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]"></TableHead>
                    {visibleSources.map((s) => (
                      <TableHead key={s} className={`border-l-4 ${SOURCE_ACCENTS[s]} font-semibold`}>
                        {SOURCE_LABELS[s]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Area</TableCell>
                    {visibleSources.map((s) => (
                      <TableCell key={s}>{renderCell(s, "area")}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Best Rank</TableCell>
                    {visibleSources.map((s) => (
                      <TableCell key={s}>{renderCell(s, "best_rank")}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Active Status</TableCell>
                    {visibleSources.map((s) => (
                      <TableCell key={s}>{renderCell(s, "active")}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            );
          })()}
        </CardContent>
      </Card>

      {/* 2. Area Details Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Area Details Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detailedRows.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No area details available.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    <TableHead className="w-[120px] font-semibold">Source</TableHead>
                    <TableHead className="font-semibold">Major Group</TableHead>
                    <TableHead className="font-semibold">Area Group</TableHead>
                    <TableHead className="font-semibold">Area</TableHead>
                    <TableHead className="w-[100px] font-semibold">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedRows.map((row, index) => (
                    <TableRow key={index} className={`${SOURCE_ROW_BG[row.source]} transition-colors`}>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {SOURCE_LABELS[row.source]}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.majorGroup ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.areaGroup ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {row.area ?? "—"}
                      </TableCell>
                      <TableCell>
                        {row.rank}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RankTierReference />

      <NotesSection journal={journal} />

      <QuickActions journal={journal} />
    </div>
  );
}