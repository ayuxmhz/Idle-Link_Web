export default function EarningsChart() {
  const data = [
    { day: "Mon", height: "30%", active: false },
    { day: "", height: "45%", active: false },
    { day: "", height: "40%", active: false },
    { day: "", height: "80%", active: true },
    { day: "", height: "55%", active: false },
    { day: "", height: "90%", active: false },
    { day: "Sun", height: "70%", active: false },
  ];

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
