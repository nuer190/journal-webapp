"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export type FilterOperator = "AND" | "OR" | "NOT";

export interface AreaRule {
  area: string;
  operator: FilterOperator;
}

export interface AreaFilterOptions {
  majorGroups: string[];
  areaGroups: string[];
  areas: string[];
  sources: string[];
  ranks: string[];
}

export interface JournalQueryParams {
  majorGroup?: string;
  areaGroup?: string;
  source?: string;
  rank?: string;
  page?: number;
  limit?: number;
  areaRules?: string;
  andAreas?: string;
  orAreas?: string;
  notAreas?: string;
  areas?: string[];
  [key: string]: any;
}

export interface JournalAreasResponse {
  journals: any[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * Hook สำหรับดึงข้อมูลรายการ Journals ตาม Query Parameters
 */
export function useJournalAreas(params?: JournalQueryParams) {
  const [data, setData] = useState<JournalAreasResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // แปลง Params เป็น String เพื่อใช้ตรวจจับการเปลี่ยนแปลงอย่างแม่นยำใน useEffect
  const serializedParams = useMemo(() => {
    if (!params) return "";
    return JSON.stringify(params);
  }, [params]);

  useEffect(() => {
    let isMounted = true;
    setIsFetching(true);

    const fetchJournals = async () => {
      try {
        const query = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              if (Array.isArray(value)) {
                value.forEach((v) => {
                  if (v) query.append(key, String(v));
                });
              } else {
                query.set(key, String(value));
              }
            }
          });
        }

        const res = await fetch(`/api/journals/journal-areas?${query.toString()}`);
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error(`API returned ${res.status}`);
        }

        const rawResult = await res.json();

        if (isMounted) {
          const payload = rawResult?.data || rawResult?.payload || rawResult || {};

          const formattedData: JournalAreasResponse = {
            journals: Array.isArray(payload.journals)
              ? payload.journals
              : Array.isArray(payload)
              ? payload
              : [],
            total: Number(payload.total ?? payload.count ?? 0),
            totalPages: Number(payload.totalPages ?? payload.total_pages ?? 1),
            page: Number(payload.page ?? params?.page ?? 1),
            limit: Number(payload.limit ?? params?.limit ?? 10),
          };

          setData(formattedData);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Journal Fetch Error:", err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    };

    fetchJournals();

    return () => {
      isMounted = false;
    };
  }, [serializedParams]);

  return {
    data,
    isLoading,
    isFetching,
    error,
  };
}

/**
 * Hook สำหรับจัดการ Filter State ผ่าน URL Search Params
 */
export function useAreaFilters(params?: { majorGroup?: string; areaGroup?: string; areas?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const majorGroup = searchParams.get("majorGroup");
  const areaGroup = searchParams.get("areaGroup");
  const source = searchParams.get("source");
  const rank = searchParams.get("rank");

  const areaRules = useMemo<AreaRule[]>(() => {
    const raw = searchParams.get("areaRules");
    if (!raw) return [];

    return raw
      .split(",")
      .map((item) => {
        const [area, operator] = item.split(":");
        return {
          area: decodeURIComponent(area || "").trim(),
          operator: (operator as FilterOperator) || "OR",
        };
      })
      .filter((r) => r.area !== "");
  }, [searchParams]);

  const [data, setData] = useState<AreaFilterOptions | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const activeMajorGroup = params?.majorGroup ?? majorGroup ?? "";
  const activeAreaGroup = params?.areaGroup ?? areaGroup ?? "";
  const activeAreas = useMemo(() => params?.areas ?? areaRules.map((r) => r.area), [params?.areas, areaRules]);

  const rawAreaRules = searchParams.get("areaRules") || "";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchFilterOptions = async () => {
      try {
        const query = new URLSearchParams();
        if (activeMajorGroup) query.set("majorGroup", activeMajorGroup);
        if (activeAreaGroup) query.set("areaGroup", activeAreaGroup);

        if (rawAreaRules) {
          query.set("areaRules", rawAreaRules);
        } else {
          activeAreas.forEach((a) => {
            if (a) query.append("areas", a);
          });
        }

        const res = await fetch(`/api/filters/area-explorer?${query.toString()}`);
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error(`API returned ${res.status}`);
        }

        const rawResult = await res.json();

        if (isMounted) {
          const payload = rawResult?.data || rawResult?.payload || rawResult || {};

          const formattedData: AreaFilterOptions = {
            majorGroups: Array.isArray(payload.majorGroups)
              ? payload.majorGroups
              : Array.isArray(payload.major_groups)
              ? payload.major_groups
              : [],
            areaGroups: Array.isArray(payload.areaGroups)
              ? payload.areaGroups
              : Array.isArray(payload.area_groups)
              ? payload.area_groups
              : [],
            areas: Array.isArray(payload.areas) ? payload.areas : [],
            sources: Array.isArray(payload.sources) ? payload.sources : [],
            ranks: Array.isArray(payload.ranks) ? payload.ranks : [],
          };

          setData(formattedData);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Filter Fetch Error:", err);
          setError(err);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFilterOptions();
    return () => {
      isMounted = false;
    };
  }, [activeMajorGroup, activeAreaGroup, rawAreaRules, JSON.stringify(activeAreas)]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setMajorGroup = useCallback(
    (val: string | null) => updateQueryParams({ majorGroup: val, areaGroup: null, areaRules: null }),
    [updateQueryParams]
  );

  const setAreaGroup = useCallback(
    (val: string | null) => updateQueryParams({ areaGroup: val, areaRules: null }),
    [updateQueryParams]
  );

  const setSource = useCallback((val: string | null) => updateQueryParams({ source: val }), [updateQueryParams]);

  const setRank = useCallback((val: string | null) => updateQueryParams({ rank: val }), [updateQueryParams]);

  const setAreaRules = useCallback(
    (rules: AreaRule[]) => {
      if (rules.length === 0) {
        updateQueryParams({ areaRules: null });
        return;
      }
      const serialized = rules.map((r) => `${encodeURIComponent(r.area)}:${r.operator}`).join(",");
      updateQueryParams({ areaRules: serialized });
    },
    [updateQueryParams]
  );

  const addAreaRule = useCallback(
    (area: string, operator: FilterOperator = "OR") => {
      if (areaRules.some((r) => r.area === area)) return;
      setAreaRules([...areaRules, { area, operator }]);
    },
    [areaRules, setAreaRules]
  );

  const toggleAreaRuleOperator = useCallback(
    (targetArea: string) => {
      const nextOp: Record<FilterOperator, FilterOperator> = { OR: "AND", AND: "NOT", NOT: "OR" };
      const updated = areaRules.map((r) => (r.area === targetArea ? { ...r, operator: nextOp[r.operator] } : r));
      setAreaRules(updated);
    },
    [areaRules, setAreaRules]
  );

  const removeAreaRule = useCallback(
    (targetArea: string) => {
      setAreaRules(areaRules.filter((r) => r.area !== targetArea));
    },
    [areaRules, setAreaRules]
  );

  const resetFilters = useCallback(() => router.push(pathname, { scroll: false }), [router, pathname]);

  return {
    data,
    isLoading,
    error,
    majorGroup,
    areaGroup,
    areaRules,
    source,
    rank,
    setMajorGroup,
    setAreaGroup,
    setAreaRules,
    addAreaRule,
    toggleAreaRuleOperator,
    removeAreaRule,
    setSource,
    setRank,
    resetFilters,
  };
}