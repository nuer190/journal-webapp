"use client";

import { useState, useEffect, useCallback } from "react";

export interface Source {
  id: number;
  source_name: string;
  year_version?: string | null;
}

export interface SubjectArea {
  id: number;
  source_id: number;
  area_code?: string | null;
  area_name: string;
  area_group?: string | null;
  major_group?: string | null;
}

export interface JournalISSN {
  id: number;
  journal_id: number;
  issn: string;
  issn_type?: string | null;
}

export interface JournalRanking {
  id: number;
  journal_id: number;
  source_id: number;
  overall_rank: string;
  source?: Source;
}

export interface JournalAreaMapping {
  id: number;
  journal_id: number;
  subject_area_id: number;
  source_id: number;
  area_rank?: string | null;
  subject_area?: SubjectArea;
  source?: Source;
}

export interface NewJournalLog {
  id?: number;
  status?: string | null;
}

export interface Journal {
  id: number;
  journal_title: string;
  title?: string;
  publisher?: string | null;
  active_status?: string | null;
  is_active?: boolean;
  source_type?: string | null;
  coverage?: string | null;
  year_inception?: string | null;
  issns?: JournalISSN[];
  rankings?: JournalRanking[];
  area_mappings?: JournalAreaMapping[];
  issn?: string;
  issnOnline?: string;
  topRank?: string;
  new_journal?: NewJournalLog | NewJournalLog[] | null;
  rankQuality?: { sourceName: string; rankValue: string }[];
}

export interface ChartDataItem {
  subject_area_id: number;
  area_name: string;
  count: number;
}

export interface Summary {
  totalJournals: number;
  totalPublishers: number;
  totalAreas: number;
}

export interface Pagination {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useJournalSource() {
  const [sources, setSources] = useState<Source[]>([]);
  const [areas, setAreas] = useState<SubjectArea[]>([]);
  const [ranks, setRanks] = useState<string[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalJournals: 0, totalPublishers: 0, totalAreas: 0 });
  const [isTop10, setIsTop10] = useState<boolean>(true);

  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<(string | number)[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
  
  // 🟢 1. เพิ่ม State เก็บสถานะ Active / Inactive / All
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [pagination, setPagination] = useState<Pagination>({ totalCount: 0, page: 1, limit: 10, totalPages: 1 });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const selectedSourceId = selectedSource ? Number(selectedSource) : undefined;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSource) params.append("sourceId", selectedSource);
      selectedAreas.forEach((a) => params.append("areaId", String(a)));
      selectedRanks.forEach((r) => params.append("rank", r));
      
      // 🟢 2. เพิ่ม Parameter status ไปยัง Backend API (กรณีที่ไม่ใช่ "all")
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      params.append("page", String(page));
      params.append("limit", String(limit));

      const res = await fetch(`/api/journal-source?${params.toString()}`);
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

      const data = await res.json();
      if (data.success) {
        setSources(data.sources || []);
        setAreas(data.areas || []);
        setRanks(data.ranks || []);
        setJournals(data.journals || []);
        setChartData(data.chartData || []);
        setSummary(data.summary || { totalJournals: 0, totalPublishers: 0, totalAreas: 0 });
        setIsTop10(data.isTop10 ?? true);
        setPagination(data.pagination || { totalCount: 0, page: 1, limit: 10, totalPages: 1 });
      } else {
        throw new Error(data.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  // 🟢 3. เพิ่ม selectedStatus ใน Dependency Array
  }, [selectedSource, selectedAreas, selectedRanks, selectedStatus, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    sources,
    areas,
    ranks,
    journals,
    chartData,
    summary,
    isTop10,
    selectedSource,
    selectedSourceId,
    selectedAreas,
    selectedRanks,
    selectedStatus, // 🟢 4.1 ส่งออก State
    page,
    pagination,
    loading,
    error,
    setSelectedSource,
    setSelectedAreas,
    setSelectedRanks,
    setSelectedStatus, // 🟢 4.2 ส่งออก Setter Function
    setPage,
    refetch: fetchData,
  };
}