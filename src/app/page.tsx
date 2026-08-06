"use client";

import { useCounters } from "@/hooks/useCounters";
import { useJournals } from "@/hooks/useJournals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Building2, Database, Layers } from "lucide-react";

export default function Overview() {
  const { data: counters, isLoading: countersLoading } = useCounters();
  const { data: journalsData, isLoading: journalsLoading } = useJournals({ limit: 10 });

  const statCards = [
    { label: "Journals", value: counters?.journals, icon: BookOpen },
    { label: "Publishers", value: counters?.publishers, icon: Building2 },
    { label: "Areas", value: counters?.areas, icon: Layers },
    { label: "Databases", value: counters?.databases, icon: Database },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Overview
        </h1>
        <p className="mt-1 text-muted-foreground">
          Summary statistics and top journals
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {countersLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{stat.value?.toLocaleString()}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Journals list (Preview)</CardTitle>
        </CardHeader>
        <CardContent>
          {journalsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Journal Title</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>ABDC Rating</TableHead>
                  <TableHead>ISSN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalsData?.journals?.map((journal: {
                  id: number;
                  journal_title: string;
                  publisher: string | null;
                  rating_2025: string | null;
                  issn_print: string | null;
                  ajg: { ajg_2024_rating: string | null } | null;
                  scimago: { sjr_best_quartile: string | null } | null;
                }) => (
                  <TableRow key={journal.id}>
                    <TableCell className="font-medium">{journal.journal_title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {journal.publisher ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        {journal.rating_2025 && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                            ABDC: {journal.rating_2025}
                          </span>
                        )}
                        {journal.ajg?.ajg_2024_rating && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                            AJG: {journal.ajg.ajg_2024_rating}
                          </span>
                        )}
                        {journal.scimago?.sjr_best_quartile && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                            SJR: {journal.scimago.sjr_best_quartile}
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {journal.issn_print ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
