"use client";

import { useState } from "react";

interface EarningsChartProps {
  data?: { day: string; total: number }[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EarningsChart({ data: earningsData }: EarningsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const todayIndex = (() => {
    const jsDay = new Date().getDay(); // 0 (Sun) - 6 (Sat)
    return jsDay === 0 ? 6 : jsDay - 1; // convert to Mon-first index
  })();

  const source = earningsData && earningsData.length === 7
    ? earningsData
    : DAY_LABELS.map((day) => ({ day, total: 0 }));

  const maxTotal = Math.max(1, ...source.map((d) => d.total));

  const data = source.map((d, i) => ({
    total: d.total,
    height: d.total > 0 ? `${Math.max(6, (d.total / maxTotal) * 100)}%` : "2px",
    hasEarnings: d.total > 0,
    isToday: i === todayIndex,
  }));

  return (
    <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-white font-bold mb-8">Earnings Overview</h3>

      <div className="flex-1 flex items-end justify-between gap-2 mt-auto mb-4 border-b border-[#2a2b36] pb-2">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end h-40 relative"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex === i && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#22232f] border border-[#3a3b4a] text-white text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap z-10 shadow-lg">
                Rs {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
            <div
              className={`w-full rounded-t-sm transition-all duration-500 cursor-default ${
                item.hasEarnings ? "bg-gradient-to-t from-[#6d28d9] to-[#cbbefa]" : "bg-[#2a2b36]"
              } ${item.isToday ? "ring-2 ring-[#cbbefa] ring-offset-2 ring-offset-[#16171f]" : ""} ${
                hoveredIndex === i ? "opacity-80" : ""
              }`}
              style={{ height: item.height }}
            ></div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Mon</span>
        <span>Sun</span>
      </div>
    </div>
  );
}
