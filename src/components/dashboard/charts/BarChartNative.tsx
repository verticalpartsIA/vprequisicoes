'use client';

import React from 'react';

interface BarData {
  label: string;
  value: number;
}

interface BarChartNativeProps {
  data: BarData[];
  color?: string;
  height?: number;
}

export const BarChartNative = ({ data, color = '#3b82f6', height = 200 }: BarChartNativeProps) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartWidth = 400;
  const barHeight = 25;
  const gap = 15;
  const totalHeight = data.length * (barHeight + gap);

  return (
    <div className="w-full animate-in fade-in duration-1000">
      <svg 
        viewBox={`0 0 ${chartWidth} ${totalHeight}`} 
        className="w-full h-auto"
        aria-label="Gráfico de barras nativo"
      >
        {data.map((item, i) => {
          const width = (item.value / maxValue) * (chartWidth - 100);
          const y = i * (barHeight + gap);

          return (
            <g key={i} className="group">
              <text 
                x="0" 
                y={y + 16} 
                className="text-[10px] font-black fill-slate-500 uppercase tracking-tighter"
              >
                {item.label}
              </text>
              <rect
                x="80"
                y={y}
                width={width}
                height={barHeight}
                fill={color}
                rx="4"
                className="opacity-80 group-hover:opacity-100 transition-all duration-500 origin-left scale-x-0 animate-in slide-in-from-left duration-700 fill-brand"
                style={{ animationFillMode: 'forwards', animationDelay: `${i * 100}ms` }}
              >
                <title>{`${item.label}: ${item.value}`}</title>
              </rect>
              <text 
                x={80 + width + 8} 
                y={y + 16} 
                className="text-[10px] font-mono font-black fill-slate-300"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
