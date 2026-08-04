"use client";

import { useState, useEffect, useCallback } from "react";

export function useJournalSource() {
  const [sources, setSources] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [ranks, setRanks] = useState<string[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 🟢 เพิ่ม State สำหรับเก็บ Summary Stats
  const [summary, setSummary] = useState<{
    totalJournals: number;
    totalPublishers: number;
    totalAreas: number;
  }>({
    totalJournals: 0,
    totalPublishers: 0,
    totalAreas: 0,
  });

  const [selectedSource, setSelectedSourceState] = useState<string>("");
  const [selectedAreas, setSelectedAreasState] = useState<string[]>([]);
  const [selectedRanks, setSelectedRanksState] = useState<string[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<any | null>(null);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const setSelectedSource = (sourceId: string) => {
    setSelectedSourceState(sourceId);
    setSelectedAreasState([]);
    setSelectedRanksState([]);
    setPage(1);
  };

  const setSelectedAreas = (areas: string[] | ((prev: string[]) => string[])) => {
    setSelectedAreasState(areas);
    setPage(1);
  };

  const setSelectedRanks = (ranks: string[] | ((prev: string[]) => string[])) => {
    setSelectedRanksState(ranks);
    setPage(1);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSource) params.append("sourceId", selectedSource);
      selectedAreas.forEach((area) => params.append("areaId", area));
      selectedRanks.forEach((rank) => params.append("rank", rank));
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`/api/journal-source?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        if (data.sources) setSources(data.sources);
        if (data.areas) setAreas(data.areas);
        if (data.ranks) setRanks(data.ranks);
        setJournals(data.journals || []);
        setChartData(data.chartData || []);

        if (data.pagination) setPagination(data.pagination);

        // 🟢 ดึงค่า summary จาก API หรือคำนวณสำรองถ้า API ส่งมาให้บางส่วน
        const totalJournals = data.pagination?.totalCount ?? data.journals?.length ?? 0;
        const totalAreas = data.chartData?.length ?? data.areas?.length ?? 0;
        
        // นับ Publisher แบบที่ไม่ซ้ำกันจากรายการที่ดึงมา
        const uniquePublishers = new Set(
          (data.journals || []).map((j: any) => j.publisher).filter(Boolean)
        ).size;

        setSummary({
          totalJournals: data.summary?.totalJournals ?? totalJournals,
          totalPublishers: data.summary?.totalPublishers ?? uniquePublishers,
          totalAreas: data.summary?.totalAreas ?? totalAreas,
        });
      }
    } catch (err) {
      console.error("Failed to fetch journal data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSource, selectedAreas, selectedRanks, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    sources,
    areas,
    ranks,
    journals,
    chartData,
    summary, // 🟢 Return ค่า summary ออกไปใช้งาน
    selectedSource,
    selectedAreas,
    selectedRanks,
    loading,
    selectedJournal,
    page,
    limit,
    pagination,
    setPage,
    setLimit,
    setSelectedSource,
    setSelectedAreas,
    setSelectedRanks,
    setSelectedJournal,
    refetch: fetchData,
  };
}