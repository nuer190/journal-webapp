"use client";

import { useState } from "react";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { AreaRule } from "../hooks/useAreaFilters";

interface AreaFilterProps {
  filters: any;
  isLoading: boolean;
  majorGroup: string | null;
  areaGroup: string | null;
  areaRules: AreaRule[];
  source: string | null;
  rank: string | null;
  onMajorGroupChange: (val: string | null) => void;
  onAreaGroupChange: (val: string | null) => void;
  onAreaRulesChange: (rules: AreaRule[]) => void;
  onSourceChange: (val: string | null) => void;
  onRankChange: (val: string | null) => void;
  onResetFilters: () => void;
}

export function AreaFilter({
  filters,
  isLoading,
  majorGroup,
  areaGroup,
  areaRules,
  source,
  rank,
  onMajorGroupChange,
  onAreaGroupChange,
  onAreaRulesChange,
  onSourceChange,
  onRankChange,
  onResetFilters,
}: AreaFilterProps) {
  const [selectedOperator, setSelectedOperator] = useState<"AND" | "OR" | "NOT">("OR");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState<boolean>(false);

  const availableAreas: string[] = filters?.areas ?? [];

  const handleAddRule = () => {
    if (!selectedArea) return;
    
    const existingIndex = areaRules.findIndex((r) => r.area === selectedArea);
    if (existingIndex >= 0) {
      const updated = [...areaRules];
      updated[existingIndex] = { area: selectedArea, operator: selectedOperator };
      onAreaRulesChange(updated);
    } else {
      onAreaRulesChange([...areaRules, { area: selectedArea, operator: selectedOperator }]);
    }

    setSelectedArea("");
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Major Group Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Major Group</label>
          <Select value={majorGroup ?? "ALL"} onValueChange={(v) => onMajorGroupChange(v === "ALL" ? null : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Major Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Major Groups</SelectItem>
              {filters?.majorGroups?.map((mg: string) => (
                <SelectItem key={mg} value={mg}>
                  {mg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Group Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Area Group</label>
          <Select value={areaGroup ?? "ALL"} onValueChange={(v) => onAreaGroupChange(v === "ALL" ? null : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Area Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Area Groups</SelectItem>
              {filters?.areaGroups?.map((ag: string) => (
                <SelectItem key={ag} value={ag}>
                  {ag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Source</label>
          <Select value={source ?? "ALL"} onValueChange={(v) => onSourceChange(v === "ALL" ? null : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sources</SelectItem>
              {filters?.sources?.map((s: string) => (
                <SelectItem key={s} value={s}>
                  {s.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rank Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Rank</label>
          <Select value={rank ?? "ALL"} onValueChange={(v) => onRankChange(v === "ALL" ? null : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Ranks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ranks</SelectItem>
              {filters?.ranks?.map((r: string) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Area Rules Section with Searchable Combobox */}
      <div className="pt-2 border-t space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Add Area Condition Rules (Searchable)
        </label>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          {/* Operator Select */}
          <Select
            value={selectedOperator}
            onValueChange={(val) => {
              if (val) setSelectedOperator(val);
            }}
          >
            <SelectTrigger className="w-full sm:w-[110px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OR">OR</SelectItem>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="NOT">NOT</SelectItem>
            </SelectContent>
          </Select>

          {/* Searchable Area Combobox */}
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-[350px] shrink-0 justify-between font-normal"
              )}
              role="combobox"
              aria-expanded={openCombobox}
            >
              <span className="truncate">
                {selectedArea
                  ? availableAreas.find((area) => area === selectedArea)
                  : "Search & select area..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Type to search area..." />
                <CommandList>
                  <CommandEmpty>No area found.</CommandEmpty>
                  <CommandGroup>
                    {availableAreas.map((area) => (
                      <CommandItem
                        key={area}
                        value={area}
                        onSelect={(currentValue) => {
                          setSelectedArea(currentValue === selectedArea ? "" : area);
                          setOpenCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedArea === area ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {area}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Add Rule Button */}
          <Button
            type="button"
            onClick={handleAddRule}
            disabled={!selectedArea}
            className="gap-1 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>

          {/* Clear / Reset Filters */}
          <Button
            type="button"
            variant="ghost"
            onClick={onResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            Reset All
          </Button>
        </div>
      </div>
    </div>
  );
}