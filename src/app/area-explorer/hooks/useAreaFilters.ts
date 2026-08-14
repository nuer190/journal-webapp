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
  [key: string]: unknown;
}

export interface JournalAreasResponse {
  journals: unknown[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * Helper สำหรับสร้าง URLSearchParams จาก Object ให้สอดคล้องกัน
 */
function buildSearchParams(params?: Record<string, unknown>): URLSearchParams {
  const query = new URLSearchParams();
  if (!params) return query;

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

  return query;
}

/**
 * Hook สำหรับดึงข้อมูลรายการ Journals ตาม Query Parameters
 */
export function useJournalAreas(params?: JournalQueryParams) {
  const [data, setData] = useState<JournalAreasResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const serializedParams = useMemo(() => {
    return params ? JSON.stringify(params) : "";
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);

    const fetchJournals = async () => {
      try {
        const query = buildSearchParams(params);
        const res = await fetch(`/api/journals/journal-areas?${query.toString()}`, {
          signal: controller.signal,
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error(`API returned status ${res.status}`);
        }

        const rawResult = await res.json();
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
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.error("Journal Fetch Error:", err);
          setError(err instanceof Error ? err : new Error("An error occurred"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    };

    fetchJournals();

    return () => {
      controller.abort();
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
  const rawAreaRules = searchParams.get("areaRules") || "";

  const areaRules = useMemo<AreaRule[]>(() => {
    if (!rawAreaRules) return [];

    return rawAreaRules
      .split(",")
      .map((item) => {
        const [area, operator] = item.split(":");
        return {
          area: decodeURIComponent(area || "").trim(),
          operator: (operator as FilterOperator) || "OR",
        };
      })
      .filter((r) => r.area !== "");
  }, [rawAreaRules]);

  const [data, setData] = useState<AreaFilterOptions | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const activeMajorGroup = params?.majorGroup ?? majorGroup ?? "";
  const activeAreaGroup = params?.areaGroup ?? areaGroup ?? "";

  const activeAreasSerialized = useMemo(() => {
    const areas = params?.areas ?? areaRules.map((r) => r.area);
    return JSON.stringify(areas);
  }, [params?.areas, areaRules]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const fetchFilterOptions = async () => {
      try {
        const query = new URLSearchParams();
        if (activeMajorGroup) query.set("majorGroup", activeMajorGroup);
        if (activeAreaGroup) query.set("areaGroup", activeAreaGroup);
        if (source) query.set("source", source);
        if (rank) query.set("rank", rank);

        if (rawAreaRules) {
          query.set("areaRules", rawAreaRules);
        } else {
          const parsedAreas: string[] = JSON.parse(activeAreasSerialized);
          parsedAreas.forEach((a) => {
            if (a) query.append("areas", a);
          });
        }

        const res = await fetch(`/api/filters/area-explorer?${query.toString()}`, {
          signal: controller.signal,
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error(`API returned status ${res.status}`);
        }

        const rawResult = await res.json();
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
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.error("Filter Fetch Error:", err);
          setError(err instanceof Error ? err : new Error("An error occurred"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFilterOptions();

    return () => {
      controller.abort();
    };
  }, [activeMajorGroup, activeAreaGroup, rawAreaRules, activeAreasSerialized, source, rank]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      // Auto Reset หน้าเป็น page=1 เมื่อมีการเปลี่ยน Filter
      if (newParams.has("page") && !("page" in updates)) {
        newParams.set("page", "1");
      }

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