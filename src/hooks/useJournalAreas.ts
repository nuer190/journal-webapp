import { useQuery } from "@tanstack/react-query";

export interface JournalAreasParams {
  majorGroup?: string;
  areaGroup?: string;
  area?: string;
  source?: string;
  rank?: string;
  page?: number;
  limit?: number;
  // --- เพิ่มส่วนนี้ (Optional) เพื่อรองรับ Area Condition Rules โดยไม่กระทบหน้าอื่น ---
  andAreas?: string[] | string;
  orAreas?: string[] | string;
  notAreas?: string[] | string;
  areaRules?: string; // หรือรับ raw string เช่น "Area1:AND,Area2:OR"
}

export function useJournalAreas(params: JournalAreasParams = {}) {
  const searchParams = new URLSearchParams();

  // Parameter เดิมสำหรับหน้าอื่นๆ
  if (params.majorGroup) searchParams.set("majorGroup", params.majorGroup);
  if (params.areaGroup) searchParams.set("areaGroup", params.areaGroup);
  if (params.area) searchParams.set("area", params.area);
  if (params.source) searchParams.set("source", params.source);
  if (params.rank) searchParams.set("rank", params.rank);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  // --- Parameter เพิ่มเติมเฉพาะหน้า area-explorer ---
  if (params.andAreas) {
    const val = Array.isArray(params.andAreas) ? params.andAreas.join(",") : params.andAreas;
    if (val) searchParams.set("andAreas", val);
  }
  if (params.orAreas) {
    const val = Array.isArray(params.orAreas) ? params.orAreas.join(",") : params.orAreas;
    if (val) searchParams.set("orAreas", val);
  }
  if (params.notAreas) {
    const val = Array.isArray(params.notAreas) ? params.notAreas.join(",") : params.notAreas;
    if (val) searchParams.set("notAreas", val);
  }
  if (params.areaRules) {
    searchParams.set("areaRules", params.areaRules);
  }

  return useQuery({
    queryKey: ["journalAreas", params],
    queryFn: () =>
      fetch(`/api/journal-areas?${searchParams.toString()}`).then((r) => r.json()),
  });
}