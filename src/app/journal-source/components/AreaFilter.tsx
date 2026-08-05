import React from "react";
import { SubjectArea } from "../hooks/useJournalSource";

interface AreaFilterProps {
  areas: SubjectArea[];
  selected: (number | string)[];
  onChange: (selected: (number | string)[]) => void;
}

export const AreaFilter: React.FC<AreaFilterProps> = ({ areas, selected, onChange }) => {
  const toggleArea = (id: number | string) => {
    const isSelected = selected.some((item) => String(item) === String(id));

    if (isSelected) {
      onChange(selected.filter((item) => String(item) !== String(id)));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Subject Areas (Multi-select)
      </label>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50/50">
        {areas.length === 0 ? (
          <span className="text-xs text-gray-400 p-2">No subject areas available</span>
        ) : (
          areas.map((a) => {
            const isChecked = selected.some((item) => String(item) === String(a.id));
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleArea(a.id)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  isChecked
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {a.area_name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};