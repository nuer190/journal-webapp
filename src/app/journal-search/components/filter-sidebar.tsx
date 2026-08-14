"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterSection } from "./filter-section";
import { FilterCheckboxGroup } from "./filter-checkbox-group";
import { FilterSearchable, FilterSearchableId } from "./filter-searchable";
import { FilterYearRange } from "./filter-year-range";
import type { SearchFilters } from "../hooks/use-search-state";
import type { FilterOptions } from "../hooks/use-filter-options";

interface FilterSidebarProps {
  filters: SearchFilters;
  options: FilterOptions;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  activeFilterCount: number;
}

function FilterCategory({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {/* ปรับให้หัวข้อใหญ่ขึ้น (text-sm), หนาขึ้น (font-bold), สีเข้มชัดเจน (text-foreground) และเพิ่มระยะเว้นบรรทัด */}
      <div className="px-0 pt-4 pb-1.5 border-b border-border/40 mb-2">
        <span className="text-sm font-bold uppercase tracking-wider text-foreground">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export function FilterSidebar({
  filters,
  options,
  onFilterChange,
  onReset,
  activeFilterCount,
}: FilterSidebarProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b pb-3">
        <CardTitle className="text-xl font-bold tracking-tight">Filters</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="space-y-4 px-4 py-2">
          <FilterCategory label="Metadata">
            <FilterSection
              title="Database Source"
              count={filters.sources.length}
              open={filters.sources.length > 0}
            >
              <FilterCheckboxGroup
                label=""
                options={options.sources}
                selected={filters.sources}
                onChange={(sources) => onFilterChange({ sources })}
              />
            </FilterSection>

            <FilterSection
              title="Publisher"
              count={filters.publisher ? 1 : 0}
              open={!!filters.publisher}
            >
              <FilterSearchable
                label=""
                options={options.publishers}
                value={filters.publisher}
                onChange={(publisher) => onFilterChange({ publisher })}
                placeholder="Select publisher..."
              />
            </FilterSection>

            <FilterSection
              title="Active Status"
              count={filters.activeStatuses.length}
              open={filters.activeStatuses.length > 0}
            >
              <FilterCheckboxGroup
                label=""
                options={options.activeStatuses}
                selected={filters.activeStatuses}
                onChange={(activeStatuses) =>
                  onFilterChange({ activeStatuses })
                }
              />
            </FilterSection>

            <FilterSection
              title="Source Type"
              count={filters.sourceTypes.length}
              open={filters.sourceTypes.length > 0}
            >
              <FilterCheckboxGroup
                label=""
                options={options.sourceTypes}
                selected={filters.sourceTypes}
                onChange={(sourceTypes) => onFilterChange({ sourceTypes })}
              />
            </FilterSection>

            <FilterSection
              title="Year Inception"
              count={filters.yearFrom || filters.yearTo ? 1 : 0}
              open={!!(filters.yearFrom || filters.yearTo)}
            >
              <FilterYearRange
                min={options.yearRange.min ?? 1800}
                max={options.yearRange.max ?? 2025}
                yearFrom={filters.yearFrom}
                yearTo={filters.yearTo}
                onChange={(yearFrom, yearTo) => onFilterChange({ yearFrom, yearTo })}
              />
            </FilterSection>
          </FilterCategory>

          <FilterCategory label="Ratings">
            <FilterSection
              title="ABDC Rating"
              count={filters.abdcRatings.length}
              open={filters.abdcRatings.length > 0}
            >
              <FilterCheckboxGroup
                label=""
                options={options.abdcRatings}
                selected={filters.abdcRatings}
                onChange={(abdcRatings) => onFilterChange({ abdcRatings })}
              />
            </FilterSection>

            <FilterSection
              title="AJG Rating"
              count={filters.ajgRatings.length}
              open={filters.ajgRatings.length > 0}
            >
              <FilterCheckboxGroup
                label=""
                options={options.ajgRatings}
                selected={filters.ajgRatings}
                onChange={(ajgRatings) => onFilterChange({ ajgRatings })}
              />
            </FilterSection>

            <FilterSection
              title="SJR Quartile"
              count={filters.sjrQuartiles.length}
              open={filters.sjrQuartiles.length > 0}
            >
              <FilterCheckboxGroup
                label=""
                options={options.sjrQuartiles}
                selected={filters.sjrQuartiles}
                onChange={(sjrQuartiles) => onFilterChange({ sjrQuartiles })}
              />
            </FilterSection>
          </FilterCategory>

          <FilterCategory label="Subject Areas">
            <FilterSection
              title="ABDC Area"
              count={filters.area ? 1 : 0}
              open={!!filters.area}
            >
              <FilterSearchable
                label=""
                options={options.areas}
                value={filters.area}
                onChange={(area) => onFilterChange({ area })}
                placeholder="Select area..."
              />
            </FilterSection>

            <FilterSection
              title="AJG Subject Area"
              count={filters.ajgSubjectArea ? 1 : 0}
              open={!!filters.ajgSubjectArea}
            >
              <FilterSearchable
                label=""
                options={options.ajgSubjectAreas}
                value={filters.ajgSubjectArea}
                onChange={(ajgSubjectArea) => onFilterChange({ ajgSubjectArea })}
                placeholder="Select subject area..."
              />
            </FilterSection>

            <FilterSection
              title="Major Group"
              count={filters.majorGroupId ? 1 : 0}
              open={!!filters.majorGroupId}
            >
              <FilterSearchableId
                label=""
                options={options.majorGroups}
                value={filters.majorGroupId}
                onChange={(majorGroupId) => onFilterChange({ majorGroupId })}
                placeholder="Select major group..."
              />
            </FilterSection>

            <FilterSection
              title="Area Group"
              count={filters.areaGroupId ? 1 : 0}
              open={!!filters.areaGroupId}
            >
              <FilterSearchableId
                label=""
                options={options.areaGroups}
                value={filters.areaGroupId}
                onChange={(areaGroupId) => onFilterChange({ areaGroupId })}
                placeholder="Select area group..."
              />
            </FilterSection>

            <FilterSection
              title="Scopus Area"
              count={filters.scopusAreaId ? 1 : 0}
              open={!!filters.scopusAreaId}
            >
              <FilterSearchableId
                label=""
                options={options.scopusAreas}
                value={filters.scopusAreaId}
                onChange={(scopusAreaId) => onFilterChange({ scopusAreaId })}
                placeholder="Select Scopus area..."
              />
            </FilterSection>
          </FilterCategory>
        </div>
      </CardContent>
      {activeFilterCount > 0 && (
        <CardFooter className="shrink-0 border-t p-3">
          <Button variant="outline" onClick={onReset} className="w-full">
            Reset Filters
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}