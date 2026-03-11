import React from 'react';

export function DonutChart({ data, total }: { data: { value: number, color: string }[], total: number }) {
  let currentOffset = 0;
  const radius = 15.91549430918954;
  const circumference = 100;

  if (total === 0) {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 42 42" className="w-full h-full absolute inset-0">
          <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#2C2C2E" strokeWidth="4" />
        </svg>
        <div className="text-center z-10">
          <div className="text-2xl font-bold text-white">€0,00</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg viewBox="0 0 42 42" className="w-full h-full absolute inset-0 transform -rotate-90">
        <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#2C2C2E" strokeWidth="4" />
        {data.map((slice, i) => {
          const strokeLength = (slice.value / total) * 100;
          const offset = 100 - currentOffset;
          currentOffset += strokeLength;
          
          return (
            <circle
              key={i}
              cx="21"
              cy="21"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth="4"
              strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="text-center z-10 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-white">{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(total)}</div>
      </div>
    </div>
  );
}
