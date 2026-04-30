'use client';

import React from 'react';

interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartNativeProps {
  data: DonutData[];
  size?: number;
}

export const DonutChartNative = ({ data, size = 160 }: DonutChartNativeProps) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest opacity-40" style={{ height: size }}>
        Sem dados
      </div>
    );
  }
  const radius = 60;
  const stroke = 18;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let currentOffset = 0;

  return (
    <div className="flex items-center gap-10 animate-in zoom-in-95 duration-700">
      <div className="relative" style={{ width: size, height: size }}>
        <svg height={size} width={size} viewBox="0 0 120 120" className="transform -rotate-90">
          {data.map((item, i) => {
            const percentage = (item.value / total) * 100;
            const dashArray = (percentage / 100) * circumference;
            const offset = currentOffset;
            currentOffset += dashArray;

            return (
              <circle
                key={i}
                stroke={item.color}
                strokeDasharray={`${dashArray} ${circumference}`}
                style={{ strokeDashoffset: -offset, transition: 'all 1s ease' }}
                strokeWidth={stroke}
                fill="transparent"
                r={normalizedRadius}
                cx="60"
                cy="60"
                className="hover:opacity-80 cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Total</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{item.label}</span>
              <span className="text-[10px] text-slate-500 font-bold">{((item.value / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
