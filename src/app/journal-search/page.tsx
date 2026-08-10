"use client";

import { Suspense } from "react";
import { useSearchState } from "./hooks/use-search-state";
import { useJournalSearch } from "./hooks/use-journal-search";
import { useFilterOptions } from "./hooks/use-filter-options";
import { SearchBar } from "./components/search-bar";
import { FilterDrawer } from "./components/filter-drawer";
import { ActiveFilters } from "./components/active-filters";
import { SortControls } from "./components/sort-controls";
import { ViewToggle } from "./components/view-toggle";
import { ResultsTable } from "./components/results-table";
import { ResultsCards } from "./components/results-cards";
import { PaginationControls } from "./components/pagination-controls";
import { EmptyState } from "./components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

function JournalSearchContent() {
  const {
    state,
    setQuery,
    setFilters,
    setSort,
    setPage,
    setLimit,
    setView,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useSearchState();

  const { data: searchResults, isLoading, isError } = useJournalSearch(state);
  const { data: filterOptions } = useFilterOptions();

  const hasSearched = state.query.length > 0 || hasActiveFilters;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Journal Search
        </h1>
        <p className="mt-1 text-muted-foreground">
          Find journals by title, ISSN, publisher, or subject area
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <SearchBar value={state.query} onChange={setQuery} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {filterOptions && (
                <FilterDrawer
                  filters={state.filters}
                  options={filterOptions}
                  onFilterChange={setFilters}
                  onReset={resetFilters}
                  activeFilterCount={activeFilterCount}
                />
              )}
              <SortControls
                sort={state.sort}
                order={state.order}
                onSortChange={setSort}
              />
            </div>
            <ViewToggle view={state.view} onViewChange={setView} />
          </div>

          {hasActiveFilters && (
            <ActiveFilters
              filters={state.filters}
              options={filterOptions}
              onFilterChange={setFilters}
              onClearAll={resetFilters}
            />
          )}
        </div>

        {isLoading && hasSearched ? (
          <div className="space-y-3">
            {state.view === "table" ? (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </>
            ) : (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </>
            )}
          </div>
        ) : isError ? (
          <EmptyState type="error" onRetry={() => window.location.reload()} />
        ) : !hasSearched ? (
          <EmptyState type="initial" />
        ) : searchResults?.journals.length === 0 ? (
          <EmptyState type="no-results" onClearFilters={resetFilters} />
        ) : searchResults ? (
          <>
            {state.view === "table" ? (
              <ResultsTable journals={searchResults.journals} />
            ) : (
              <ResultsCards journals={searchResults.journals} />
            )}

            <PaginationControls
              currentPage={state.page}
              totalPages={searchResults.totalPages}
              limit={state.limit}
              total={searchResults.total}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </>
        ) : null}
      </div>
      {/* Timestamp Data Source */}
        <div className="flex justify-end text-xs text-muted-foreground pt-1 pr-1 font-mono">
          Data Source updated at 1 July 2026
        </div>
    </div>
  );
}

export default function JournalSearch() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <JournalSearchContent />
    </Suspense>
  );
}
