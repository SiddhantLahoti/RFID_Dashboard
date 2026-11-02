import React from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGrid({
  products,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange
}) {
  return (
<main className="flex-1 overflow-y-auto h-[calc(100vh-93px)] pr-1">      {/* Top Bar: Count & Per-Page Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600 font-medium">
          Showing <span className="font-bold text-slate-900">{totalItems.toLocaleString()}</span> items
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
        </div>
      </div>

      {/* Main Grid or Loading Skeletons */}
      {isLoading ? (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg h-72 animate-pulse p-3 flex flex-col justify-between">
              <div className="bg-slate-100 h-36 rounded-md w-full mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          <p className="text-base font-semibold mb-1">No matching RFID items found</p>
          <p className="text-xs text-slate-400">Try loosening your filter parameters or search terms.</p>
        </div>
      ) : (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">          {products.map((item) => (
            <ProductCard key={item["RFID CODE"]} item={item} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-8 mb-4 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600">
          <span>
            Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Direct Page Jump Buttons */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (currentPage <= 3) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = currentPage - 2 + idx;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 rounded font-medium text-xs transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white font-bold'
                      : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}