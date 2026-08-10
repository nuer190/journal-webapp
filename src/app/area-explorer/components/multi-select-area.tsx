"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

interface MultiSelectAreaProps {
  options?: string[];
  selected?: string[];
  selectedValues?: string[]; // รองรับชื่อ prop ทั้ง selected และ selectedValues
  label?: string;
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectArea({
  options = [],
  selected,
  selectedValues,
  label,
  onChange,
  placeholder = "Select Areas...",
}: MultiSelectAreaProps) {
  const [open, setOpen] = React.useState(false);

  // สกัดค่า Array ที่ปลอดภัย ป้องกัน Error อ่านค่า .length / .includes / .map บน undefined
  const safeOptions = options ?? [];
  const safeSelected = selected ?? selectedValues ?? [];

  const handleSelect = (option: string) => {
    if (safeSelected.includes(option)) {
      onChange(safeSelected.filter((item) => item !== option));
    } else {
      onChange([...safeSelected, option]);
    }
  };

  const handleRemove = (option: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // ป้องกัน event ลามไปเปิด/ปิด Popover
    onChange(safeSelected.filter((item) => item !== option));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-[240px] justify-between font-normal"
          )}
        >
          <span className="truncate">
            {safeSelected.length === 0
              ? placeholder
              : `Selected (${safeSelected.length})`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search area..." />
            <CommandList>
              <CommandEmpty>No area found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {safeOptions.map((option) => {
                  const isSelected = safeSelected.includes(option);
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="truncate">{option}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            {/* ปุ่ม Clear All เมื่อมีการเลือกอย่างน้อย 1 รายการ */}
            {safeSelected.length > 0 && (
              <div className="border-t p-1.5 bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 justify-center text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleClearAll}
                >
                  Clear selected ({safeSelected.length})
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Items Badges */}
      {safeSelected.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[300px]">
          {safeSelected.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs gap-1 pr-1">
              <span className="truncate max-w-[120px]">{item}</span>
              <button
                type="button"
                className="rounded-full outline-none hover:bg-muted p-0.5"
                onClick={(e) => handleRemove(item, e)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}