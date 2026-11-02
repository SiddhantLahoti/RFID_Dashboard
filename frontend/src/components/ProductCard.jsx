import React, { useState } from 'react';
import { Gem, ImageOff } from 'lucide-react';

export default function ProductCard({ item }) {
  const [imgError, setImgError] = useState(false);

  const designNo = item["DesignNo"] || "-";
  const rfid = item["RFID CODE"] || "-";
  const bagNo = item["Bag No."] || "-";
  const soNo = item["So No."] || "-";
  const customer = item["Customer"] || "-";
  const description = item["Description"] || "-";
  const diaQlty = item["DIAQLTY"] || "-";
  const metalKt = item["MetalKt"] || "-";
  const location = item["LOCATION"] || "-";
  const sublocation = item["sublocation."] || "-";
  const grossWt = item["GROSSWT"] || 0;
  const netWt = item["NETWT"] || 0;
  const diaWt = item["DIA WT."] || 0;
  const centerWt = item["CENTERWT"] || 0;
  const imageSource = item["image_source"] || "none";

  const imageUrl = `/api/image/${encodeURIComponent(designNo)}`;

  return (
  <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
    <div>
      {/* 1. Image Canvas Area */}
      <div className="relative h-52 bg-white rounded-lg flex items-center justify-center p-3 border border-slate-100 overflow-hidden mb-3">
        {/* Source Badge (Sketch / 500x500) */}
        <div className="absolute top-2 left-2 z-10">
          {imageSource === 'secondary' && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              Sketch
            </span>
          )}
          {imageSource === 'primary' && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              500x500
            </span>
          )}
          {imageSource === 'none' && (
            <span className="bg-slate-400 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
              No Img
            </span>
          )}
        </div>

        {/* RFID Code Badge */}
        <div className="absolute top-2 right-2 z-10 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
          RFID: {rfid}
        </div>

        {/* Image / Fallback */}
        {imageSource !== 'none' && !imgError ? (
          <img
            src={imageUrl}
            alt={designNo}
            onError={() => setImgError(true)}
            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-200 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
            <Gem size={32} className="text-blue-400 opacity-75" />
            <span className="text-[11px] font-medium text-slate-400 font-mono">{designNo}</span>
          </div>
        )}
      </div>

      {/* 2. Style Title & Bag Header */}
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate" title={designNo}>
          {designNo}
        </h2>
        <span className="text-[11px] font-mono text-slate-500">
          Bag: {bagNo}
        </span>
      </div>

      {/* 3. Attribute Badges (Pills) */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {description !== "-" && (
          <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded">
            {description}
          </span>
        )}
        {metalKt !== "-" && (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
            {metalKt}
          </span>
        )}
        {diaQlty !== "-" && (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded">
            {diaQlty}
          </span>
        )}
        {sublocation !== "-" && (
          <span className="bg-purple-50 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded truncate max-w-[130px]">
            {sublocation}
          </span>
        )}
      </div>

      {/* 4. Customer & Location Info Bar */}
      <div className="flex items-center gap-1.5 text-[10px] font-medium mb-3">
        <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded">
          Cust: {customer}
        </span>
        <span className="bg-slate-50 text-slate-600 border border-slate-200/60 px-2 py-0.5 rounded truncate">
          Loc: {location}
        </span>
      </div>

      {/* 5. Specifications Grid */}
      <div className="bg-slate-50/70 rounded-lg p-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] border border-slate-100">
        <div className="flex justify-between">
          <span className="text-slate-400">Gross Wt:</span>
          <span className="font-semibold text-slate-700">{Number(grossWt).toFixed(3)}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Net Wt:</span>
          <span className="font-semibold text-slate-700">{Number(netWt).toFixed(3)}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Dia Wt:</span>
          <span className="font-semibold text-slate-700">{Number(diaWt).toFixed(3)}ct</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Center:</span>
          <span className="font-semibold text-slate-700">{Number(centerWt).toFixed(3)}ct</span>
        </div>
      </div>
    </div>
  </div>
);
}