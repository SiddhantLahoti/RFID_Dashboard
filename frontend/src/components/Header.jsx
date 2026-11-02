import React from 'react';
import { Search, RotateCw, CheckCircle2 } from 'lucide-react';

export default function Header({ search, onSearchChange, syncStatus, onRefresh }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                RFID Dashboard
            </h1>
            </div>
      </div>

      <div className="flex items-center gap-3 w-1/3 max-w-md">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Design, Bag #, SO #, Customer, RFID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* <button
          onClick={onRefresh}
          title="Force refresh data from Excel"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RotateCw size={15} />
        </button> */}
      </div>
    </header>
  );
}