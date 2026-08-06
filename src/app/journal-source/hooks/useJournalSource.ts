"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce";

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
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [pagination, setPagination] = useState<Pagination>({ totalCount: 0, page: 1, limit: 10, totalPages: 1 });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ⚡ Debounce ค่าที่กดจาก FilterPanel เพื่อลดจำนวนครั้งการยิง API (ชะลอไว้ 350ms)
  const [debouncedAreas] = useDebounce(selectedAreas, 350);
  const [debouncedRanks] = useDebounce(selectedRanks, 350);

  // คำนวณ selectedSourceId เป็น number ให้พร้อมใช้งานทันที
  const selectedSourceId = selectedSource ? Number(selectedSource) : undefined;

  // ป้องกัน Race Condition กรณีที่ User กดยื่น Request รัวๆ
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // ยกเลิก Request ก่อนหน้าหากยังทำงานไม่เสร็จ
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedSource) params.append("sourceId", selectedSource);
      
      // ใช้ค่าที่ผ่าน Debounce แล้วยิง API
      debouncedAreas.forEach((a) => params.append("areaId", String(a)));
      debouncedRanks.forEach((r) => params.append("rank", r));
      
      params.append("page", String(page));
      params.append("limit", String(limit));

      const res = await fetch(`/api/journal-source?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

      const data = await res.json();
      if (data.success) {
        // อัปเดต Filter Options เฉพาะตอนที่มีค่าส่งกลับมา (ป้องกัน Options หายตอนกดเปลี่ยนหน้า)
        if (data.sources && data.sources.length > 0) setSources(data.sources);
        if (data.areas && data.areas.length > 0) setAreas(data.areas);
        if (data.ranks && data.ranks.length > 0) setRanks(data.ranks);

        setJournals(data.journals || []);
        setChartData(data.chartData || []);
        setSummary(data.summary || { totalJournals: 0, totalPublishers: 0, totalAreas: 0 });
        setIsTop10(data.isTop10 ?? true);
        setPagination(data.pagination || { totalCount: 0, page: 1, limit: 10, totalPages: 1 });
      } else {
        throw new Error(data.error || "Failed to fetch data");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSource, debouncedAreas, debouncedRanks, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset หน้าปัจจุบันเป็น 1 เมื่อมีการเปลี่ยน Source
  const handleSourceChange = (sourceId: string) => {
    setSelectedSource(sourceId);
    setPage(1);
  };

  return {
    sources,
    areas,
    ranks,
    journals,
    chartData,
    summary,
    isTop10,
    selectedSource,
    selectedSourceId, // ส่งคืน selectedSourceId (ที่เป็น number หรือ undefined)
    selectedAreas,
    selectedRanks,
    page,
    pagination,
    loading,
    error,
    setSelectedSource: handleSourceChange,
    setSelectedAreas,
    setSelectedRanks,
    setPage,
    refetch: fetchData,
  };
}