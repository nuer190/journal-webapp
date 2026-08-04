import React from "react";
import { SubjectArea } from "../hooks/useJournalSource";

interface Props {
  areas: SubjectArea[];
  selected: number[];
  onChange: (selected: number[]) => void;
}

export const AreaFilter: React.FC<Props> = ({ areas, selected, onChange }) => {
  const toggleArea = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        Subject Areas (Multi-select)
      </label>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border rounded-md bg-gray-50">
        {areas.map((a) => {
          const isChecked = selected.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleArea(a.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                isChecked
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border hover:bg-gray-100"
              }`}
            >
              {a.area_name}
            </button>
          );
        })}
      </div>
    </div>
  );
};