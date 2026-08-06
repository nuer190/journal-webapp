"use client";

import { useAnalytics } from "./hooks/use-analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Globe, Layers, Trophy } from "lucide-react";
import { MajorGroupChart } from "./components/major-group-chart";
import { AreaGroupChart } from "./components/area-group-chart";
import { TopAreaChart } from "./components/top-area-chart";
import { SourceDistribution } from "./components/source-distribution";
import { RankDistribution } from "./components/rank-distribution";
import { DbCoverageChart } from "./components/db-coverage-chart";
import { ScopusStatusChart } from "./components/scopus-status-chart";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        {[420, 480, 380, 350, 500, 820, 480].map((height, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-2 h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full" style={{ height }} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    { label: "Total Journals", value: data?.kpi?.totalJournals, icon: BookOpen },
    { label: "Total Areas", value: data?.kpi?.totalAreas, icon: Layers },
    { label: "Active (Scopus)", value: data?.kpi?.activeScopus, icon: Globe },
    { label: "Top Major Group", value: data?.kpi?.topMajorGroup, icon: Trophy, isText: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Distribution and coverage analysis across all journal databases
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
                <p className={`font-bold ${stat.isText ? "text-lg truncate" : "text-3xl"}`}>
                  {stat.isText
                    ? stat.value
                    : typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : "—"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 1. Source Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Source Distribution</CardTitle>
          <CardDescription>
            Number of journals indexed in each database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SourceDistribution data={data?.sources ?? []} />
        </CardContent>
      </Card>

      {/* 2. 🟢 ย้าย Database Coverage by Major Group ขึ้นมาตรงนี้ */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Database Coverage by Major Group
          </CardTitle>
          <CardDescription>
            How many journals in each major group appear in each database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DbCoverageChart data={data?.dbCoverage ?? []} />
        </CardContent>
      </Card>

      {/* 3. Rank Distribution by Source */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Rank Distribution by Source
          </CardTitle>
          <CardDescription>
            Distribution of journal ratings across each ranking system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RankDistribution data={data?.rankDistribution ?? { ABDC: [], AJG: [], Scimago: [] }} />
        </CardContent>
      </Card>

      {/* 4. Journals by Major Group */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Journals by Major Group
          </CardTitle>
          <CardDescription>
            Total journals assigned to each of the six major groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MajorGroupChart data={data?.majorGroups ?? []} />
        </CardContent>
      </Card>

      {/* 5. Top 10 Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Top 10 Areas</CardTitle>
          <CardDescription>
            The ten subject areas covering the most journals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopAreaChart data={data?.topAreas ?? []} />
        </CardContent>
      </Card>

      {/* 6. Area Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Area Groups</CardTitle>
          <CardDescription>
            Journal counts across every area group, ranked high to low
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaGroupChart data={data?.areaGroups ?? []} />
        </CardContent>
      </Card>

      {/* 7. 🟢 ย้าย Scopus Coverage Status มาไว้ล่างสุดตรงนี้ */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Scopus Coverage Status
          </CardTitle>
          <CardDescription>
            Active vs inactive journals and source types in Scopus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScopusStatusChart
            byStatus={data?.scopusStatus?.byStatus ?? []}
            bySourceType={data?.scopusStatus?.bySourceType ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}