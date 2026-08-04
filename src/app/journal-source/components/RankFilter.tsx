import React from "react";

interface Props {
  ranks: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const RankFilter: React.FC<Props> = ({ ranks, selected, onChange }) => {
  const toggleRank = (rank: string) => {
    if (selected.includes(rank)) {
      onChange(selected.filter((r) => r !== rank));
    } else {
      onChange([...selected, rank]);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">Rankings</label>
      <div className="flex flex-wrap gap-2">
        {ranks.map((r) => (
          <label key={r} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(r)}
              onChange={() => toggleRank(r)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>{r}</span>
          </label>
        ))}
      </div>
    </div>
  );
};