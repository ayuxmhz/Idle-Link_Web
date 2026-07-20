interface EarningsChartProps {
  data?: { day: string; total: number }[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EarningsChart({ data: earningsData }: EarningsChartProps) {
  const todayIndex = (() => {
    const jsDay = new Date().getDay(); // 0 (Sun) - 6 (Sat)
    return jsDay === 0 ? 6 : jsDay - 1; // convert to Mon-first index
  })();

  const source = earningsData && earningsData.length === 7
    ? earningsData
    : DAY_LABELS.map((day) => ({ day, total: 0 }));

  const maxTotal = Math.max(1, ...source.map((d) => d.total));

  const data = source.map((d, i) => ({
    height: `${Math.max(6, (d.total / maxTotal) * 100)}%`,
    active: i === todayIndex,
  }));

  return (
    <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-white font-bold mb-8">Earnings Overview</h3>
      
      <div className="flex-1 flex items-end justify-between gap-2 mt-auto mb-4 border-b border-[#2a2b36] pb-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-40">
            <div 
              className={`w-full rounded-t-sm transition-all duration-500 ${item.active ? 'bg-[#cbbefa]' : 'bg-[#3b3c4a]'}`}
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
