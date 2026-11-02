import React from 'react';

export default function RangeSlider({
  label,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
  unit = "g"
}) {
  return (
    <div className="text-xs">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-[10px] text-slate-400">({unit})</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <input
            type="number"
            step="any"
            placeholder="Min"
            value={minVal ?? ""}
            onChange={(e) => onMinChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <input
            type="number"
            step="any"
            placeholder="Max"
            value={maxVal ?? ""}
            onChange={(e) => onMaxChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}