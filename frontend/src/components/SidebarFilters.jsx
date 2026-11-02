import React from 'react';
import MultiSelect from './MultiSelect';
import RangeSlider from './RangeSlider';
import { RotateCcw } from 'lucide-react';

export default function SidebarFilters({
  filterOptions,
  activeFilters,
  onFilterChange,
  onReset
}) {
  const dropdowns = filterOptions?.dropdowns || {};

  return (
    <aside className="w-72 shrink-0 bg-white rounded-xl border border-slate-200/80 p-4 space-y-4 overflow-y-auto h-[calc(100vh-93px)] shadow-xs select-none">      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">FILTERS</span>
        <button
          onClick={onReset}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          <RotateCcw size={12} />
          Reset All
        </button>
      </div>

      {/* Image Source Mode Buttons (500x500 vs Sketch vs All) */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          IMAGE SOURCE
        </label>
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-md text-[11px] font-medium text-slate-600">
          {[
            { id: 'all', label: 'All' },
            { id: 'primary', label: '500x500' },
            { id: 'secondary', label: 'Sketch' },
            { id: 'none', label: 'Missing' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onFilterChange('image_source', mode.id)}
              className={`py-1 rounded text-center transition-all ${
                (activeFilters.image_source || 'all') === mode.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="space-y-3 pt-1">
        <MultiSelect
          label="Design Number (Col F)"
          options={dropdowns.design_no || []}
          selected={activeFilters.design_no || []}
          onChange={(val) => onFilterChange('design_no', val)}
          placeholder="Filter designs..."
        />

        <MultiSelect
          label="Category (Col G)"
          options={dropdowns.description || []}
          selected={activeFilters.description || []}
          onChange={(val) => onFilterChange('description', val)}
          placeholder="e.g. PND, RNG..."
        />

        <MultiSelect
          label="Customer (Col E)"
          options={dropdowns.customer || []}
          selected={activeFilters.customer || []}
          onChange={(val) => onFilterChange('customer', val)}
          placeholder="Select customer..."
        />

        <MultiSelect
          label="Bag Number (Col B)"
          options={dropdowns.bag_no || []}
          selected={activeFilters.bag_no || []}
          onChange={(val) => onFilterChange('bag_no', val)}
          placeholder="Select bag #..."
        />

        <MultiSelect
          label="Location (Col S)"
          options={dropdowns.location || []}
          selected={activeFilters.location || []}
          onChange={(val) => onFilterChange('location', val)}
          placeholder="Select tray/loc..."
        />

        <MultiSelect
          label="Sub-Location (Col Q)"
          options={dropdowns.sublocation || []}
          selected={activeFilters.sublocation || []}
          onChange={(val) => onFilterChange('sublocation', val)}
          placeholder="Select sub-location..."
        />

        <MultiSelect
          label="Set Code (Col O)"
          options={dropdowns.set_code || []}
          selected={activeFilters.set_code || []}
          onChange={(val) => onFilterChange('set_code', val)}
          placeholder="Select set code..."
        />

        <MultiSelect
          label="SO Number (Col C)"
          options={dropdowns.so_no || []}
          selected={activeFilters.so_no || []}
          onChange={(val) => onFilterChange('so_no', val)}
          placeholder="Select SO #..."
        />

        

        <MultiSelect
          label="Dia Quality (Col H)"
          options={dropdowns.dia_qlty || []}
          selected={activeFilters.dia_qlty || []}
          onChange={(val) => onFilterChange('dia_qlty', val)}
          placeholder="Select diamond quality..."
        />

        <MultiSelect
          label="Metal Karat (Col I)"
          options={dropdowns.metal_kt || []}
          selected={activeFilters.metal_kt || []}
          onChange={(val) => onFilterChange('metal_kt', val)}
          placeholder="e.g. S925, 14K..."
        />

        
      </div>

      {/* Min-Max Range Filters (Columns K to P) */}
      <div className="pt-3 border-t border-slate-200 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
          WEIGHT SPECIFICATIONS
        </span>

        <RangeSlider
          label="Gross Weight"
          unit="g"
          minVal={activeFilters.min_gross_wt}
          maxVal={activeFilters.max_gross_wt}
          onMinChange={(val) => onFilterChange('min_gross_wt', val)}
          onMaxChange={(val) => onFilterChange('max_gross_wt', val)}
        />

        <RangeSlider
          label="Net Weight"
          unit="g"
          minVal={activeFilters.min_net_wt}
          maxVal={activeFilters.max_net_wt}
          onMinChange={(val) => onFilterChange('min_net_wt', val)}
          onMaxChange={(val) => onFilterChange('max_net_wt', val)}
        />

        <RangeSlider
          label="Dia Weight"
          unit="ct"
          minVal={activeFilters.min_dia_wt}
          maxVal={activeFilters.max_dia_wt}
          onMinChange={(val) => onFilterChange('min_dia_wt', val)}
          onMaxChange={(val) => onFilterChange('max_dia_wt', val)}
        />

        <RangeSlider
          label="Center Weight"
          unit="ct"
          minVal={activeFilters.min_center_wt}
          maxVal={activeFilters.max_center_wt}
          onMinChange={(val) => onFilterChange('min_center_wt', val)}
          onMaxChange={(val) => onFilterChange('max_center_wt', val)}
        />
      </div>
    </aside>
  );
}