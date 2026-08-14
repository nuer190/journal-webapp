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
  majorGroup?: string | null;
  areaGroup: string | null;
  areaRules: AreaRule[];
  source?: string | null;
  rank: string | null;
  onMajorGroupChange?: (val: string | null) => void;
  onAreaGroupChange: (val: string | null) => void;
  onAreaRulesChange: (rules: AreaRule[]) => void;
  onSourceChange?: (val: string | null) => void;
  onRankChange: (val: string | null) => void;
  onResetFilters: () => void;
}

export function AreaFilter({
  filters,
  isLoading,
  areaGroup,
  areaRules,
  rank,
  onAreaGroupChange,
  onAreaRulesChange,
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
      {/* Top Filter Grid: แบ่ง 2 คอลัมน์เท่าๆ กัน (Area Group & Rank) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Area Group Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Area Group</label>
          <Select 
            value={areaGroup ?? "ALL"} 
            onValueChange={(v) => onAreaGroupChange(v === "ALL" ? null : v)}
            disabled={isLoading}
          >
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

        {/* Rank Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Rank</label>
          <Select 
            value={rank ?? "ALL"} 
            onValueChange={(v) => onRankChange(v === "ALL" ? null : v)}
            disabled={isLoading}
          >
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

      {/* Area Rules Section */}
      <div className="pt-3 border-t space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Add Area Condition Rules (Searchable)
        </label>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          {/* Operator Select */}
          <Select
            value={selectedOperator}
            onValueChange={(val) => {
              if (val) setSelectedOperator(val as "AND" | "OR" | "NOT");
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

          {/* Searchable Area Combobox (ขยายเต็มพื้นที่ตรงกลาง) */}
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger
              role="combobox"
              aria-expanded={openCombobox}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:flex-1 justify-between font-normal"
              )}
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
                        onSelect={() => {
                          setSelectedArea(area === selectedArea ? "" : area);
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

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            <Button
              type="button"
              onClick={handleAddRule}
              disabled={!selectedArea}
              className="gap-1 whitespace-nowrap flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>

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
    </div>
  );
}