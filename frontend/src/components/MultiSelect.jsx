import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export default function MultiSelect({
  label,
  options = [],
  selected = [],
  onChange,
  placeholder = "Select options..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    String(opt).toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (opt) => {
    const strOpt = String(opt);
    if (selected.includes(strOpt)) {
      onChange(selected.filter(item => item !== strOpt));
    } else {
      onChange([...selected, strOpt]);
    }
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative text-xs" ref={dropdownRef}>
      <label className="block font-semibold text-slate-700 mb-1">{label}</label>

      {/* Input / Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[34px] px-2.5 py-1.5 bg-white border border-slate-300 rounded-md cursor-pointer flex items-center justify-between hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-1 max-w-[85%] overflow-hidden">
          {selected.length === 0 ? (
            <span className="text-slate-400 truncate">{placeholder}</span>
          ) : (
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium text-[11px]">
              {selected.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="hover:text-slate-600 p-0.5"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg py-1 max-h-60 flex flex-col">
          {/* Quick Filter Box */}
          <div className="p-1.5 border-b border-slate-100">
            <div className="flex items-center px-2 py-1 bg-slate-50 rounded border border-slate-200">
              <Search size={12} className="text-slate-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-44 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-center text-[11px]">No matching options</div>
            ) : (
              filteredOptions.map((opt) => {
                const strOpt = String(opt);
                const isSelected = selected.includes(strOpt);
                return (
                  <div
  key={strOpt}
  onClick={() => toggleOption(strOpt)}
  className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none text-[11px]"
>
  {/* Checkbox box placed first */}
  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
    {isSelected && <Check size={10} strokeWidth={3} />}
  </div>
  
  {/* Option label placed second */}
  <span className={`truncate ${isSelected ? 'font-semibold text-blue-600' : 'text-slate-600'}`}>
    {strOpt}
  </span>
</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}