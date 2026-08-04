import React from "react";
import { Source } from "../hooks/useJournalSource";

interface Props {
  sources: Source[];
  value: string;
  onChange: (val: string) => void;
}

export const SourceSelect: React.FC<Props> = ({ sources, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">Select Source</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
    >
      <option value="">-- Choose Source --</option>
      {sources.map((s) => (
        <option key={s.id} value={s.id}>
          {s.source_name} {s.year_version ? `(${s.year_version})` : ""}
        </option>
      ))}
    </select>
  </div>
);