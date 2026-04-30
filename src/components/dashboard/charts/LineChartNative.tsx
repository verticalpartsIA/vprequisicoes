'use client';

import React from 'react';

interface LineData {
  label: string;
  value: number;
}

interface LineChartNativeProps {
  data: LineData[];
  color?: string;
  height?: number;
}

export const LineChartNative = ({ data, color = '#3b82f6', height = 150 }: LineChartNativeProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold uppercase tracking-widest opacity-40">
        Sem dados no período
      </div>
    );
  }

  const chartWidth = 600;
  const padding = 20;
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getX = (i: number) =>
    data.length === 1
      ? chartWidth / 2
      : (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;

  const points = data.map((d, i) => {
    const x = getX(i);
    const y = height - ((d.value / maxValue) * (height - padding * 2) + padding);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height} ${points} ${chartWidth - padding},${height}`;

  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 ${chartWidth} ${height}`} 
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Eixos */}
        <line x1={padding} y1={height} x2={chartWidth - padding} y2={height} stroke="#334155" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height} stroke="#334155" strokeWidth="1" />

        {/* Área preenchida */}
        <polygon 
          points={areaPoints} 
          fill="url(#lineGradient)" 
          className="animate-in fade-in duration-1000"
        />

        {/* Linha principal */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="animate-in fade-in duration-700"
          style={{ 
            strokeDasharray: 2000, 
            strokeDashoffset: 2000, 
            animation: 'dash 2s ease-out forwards' 
          }}
        />

        {/* Pontos de dados */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = height - ((d.value / maxValue) * (height - padding * 2) + padding);
          return (
            <circle 
              key={i} 
              cx={x} 
              cy={y} 
              r="4" 
              fill="#0f172a" 
              stroke={color} 
              strokeWidth="2" 
              className="hover:r-6 cursor-pointer transition-all duration-300"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
        })}
      </svg>
      <style jsx>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};
