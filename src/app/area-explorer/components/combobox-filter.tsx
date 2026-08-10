"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface ComboboxFilterProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: string[];
}

export function ComboboxFilter({
  label,
  value,
  onChange,
  options,
}: ComboboxFilterProps) {
  const allOptions = [null, ...options];

  return (
    <Combobox
      items={allOptions}
      value={value}
      onValueChange={onChange}
      itemToStringValue={(item) => item ?? `All ${label}`}
    >
      <ComboboxInput placeholder={value ?? label} className="w-[180px]" />
      <ComboboxContent>
        <ComboboxEmpty>No {label.toLowerCase()} found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item ?? "all"} value={item}>
              {item ?? `All ${label}`}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}