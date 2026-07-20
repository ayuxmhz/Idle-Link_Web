"use client";

import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Download } from "lucide-react";

// Chart data mapped to real Rs values
const chartData = [
  { day: "Mon", value: 10000 },
  { day: "Tue", value: 15000 },
  { day: "Wed", value: 13000 },
  { day: "Thu", value: 20000 },
  { day: "Fri", value: 16000 },
  { day: "Sat", value: 25000 },
  { day: "Sun", value: 21000 },
];

const MAX_VALUE = 25000;
const Y_LABELS = [0, 5000, 10000, 15000, 20000, 25000];

// SVG chart dimensions
const CHART_W = 520;
const CHART_H = 220;
const PAD_LEFT = 52;
const PAD_RIGHT = 16;
const PAD_TOP = 12;
const PAD_BOTTOM = 36;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;
const BAR_GAP = 12;

function RevenueChart() {
  const barWidth = (PLOT_W - BAR_GAP * (chartData.length - 1)) / chartData.length;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="barHover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="1" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines + labels */}
      {Y_LABELS.map((label) => {
        const y = PAD_TOP + PLOT_H - (label / MAX_VALUE) * PLOT_H;
        return (
          <g key={label}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={CHART_W - PAD_RIGHT}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {label === 0 ? "0" : `Rs ${(label / 1000).toFixed(0)}k`}
            </text>
          </g>
        );
      })}

      {/* Bars + X labels */}
      {chartData.map((d, i) => {
        const barH = (d.value / MAX_VALUE) * PLOT_H;
        const x = PAD_LEFT + i * (barWidth + BAR_GAP);
        const y = PAD_TOP + PLOT_H - barH;

        return (
          <g key={d.day} className="group">
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill="url(#barGrad)"
              rx="4"
              ry="4"
              className="hover:fill-[url(#barHover)] transition-all"
            />
            {/* X axis label */}
            <text
              x={x + barWidth / 2}
              y={CHART_H - 6}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
              fontWeight="500"
            >
              {d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminOverviewPage() {
  const metrics = [
    {
      title: "Total Revenue",
      value: "Rs 142,500.00",
      change: "+12.5%",
      isPositive: true,
      icon: (
        // Bank/revenue icon
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Active Users",
      value: "8,432",
      change: "+4.2%",
      isPositive: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      iconBg: "bg-orange-500/10",
    },
    {
      title: "Live Nodes",
      value: "1,204",
      change: "-1.1%",
      isPositive: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
      ),
      iconBg: "bg-red-500/10",
    },
    {
      title: "Commission Earned",
      value: "Rs 14,250.00",
      change: "+8.7%",
      isPositive: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
          <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
        </svg>
      ),
      iconBg: "bg-purple-500/10",
    },
  ];

  const topNodes = [
    { name: "A100-Cluster-EU", uptime: "99.9%", earnings: "Rs 3,420", uptimeColor: "bg-blue-400" },
    { name: "H100-US-East", uptime: "99.8%", earnings: "Rs 2,850", uptimeColor: "bg-blue-400" },
    { name: "RTX4090-Rig-01", uptime: "100%", earnings: "Rs 1,920", uptimeColor: "bg-green-400" },
    { name: "V100-Asia-Pac", uptime: "98.2%", earnings: "Rs 1,100", uptimeColor: "bg-orange-400" },
  ];

  const transactions = [
    { id: "TXN-8A2F", user: "dev_master99", avatar: "D", amount: "Rs 4,500.00", status: "COMPLETED", date: "Oct 24, 14:32" },
    { id: "TXN-9B3C", user: "ai_labs_inc", avatar: "AL", amount: "Rs 14,200.00", status: "PENDING", date: "Oct 24, 11:15" },
    { id: "TXN-1C4D", user: "sarah_compute", avatar: "S", amount: "Rs 8,850.50", status: "FAILED", date: "Oct 23, 09:45" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
          <p className="text-sm text-gray-400">Platform performance metrics and system health.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#16171f] border border-[#262736] rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"></div>
          <span className="text-xs font-medium text-gray-300">System Status: Optimal</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[#16171f] border border-[#262736] p-5 rounded-xl">
            {/* Top row: icon + change badge */}
            <div className="flex justify-between items-start mb-5">
              <div className={`p-2 rounded-lg ${m.iconBg}`}>
                {m.icon}
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.isPositive ? "text-green-400" : "text-red-400"}`}>
                {m.isPositive
                  ? <ArrowUpRight size={14} />
                  : <ArrowDownRight size={14} />}
                {m.change}
              </span>
            </div>
            {/* Label */}
            <p className="text-sm text-gray-400 mb-1">{m.title}</p>
            {/* Value */}
            <p className="text-[22px] font-bold text-white leading-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Top Nodes row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#16171f] border border-[#262736] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-white">Revenue (7 Days)</h2>
            <button className="text-gray-500 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          {/* SVG chart fills the card */}
          <div className="h-[220px] w-full">
            <RevenueChart />
          </div>
        </div>

        {/* Top Nodes */}
        <div className="bg-[#16171f] border border-[#262736] rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-white">Top Nodes</h2>
            <button className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {topNodes.map((node, i) => (
              <div key={i} className="bg-[#1a1b26] border border-[#2a2b3d] rounded-lg px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white mb-1">{node.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-1.5 h-1.5 rounded-full ${node.uptimeColor}`}></span>
                    Uptime: {node.uptime}
                  </div>
                </div>
                <span className="text-sm font-mono text-gray-300">{node.earnings}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#16171f] border border-[#262736] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#262736] flex justify-between items-center">
          <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
          <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
            <Download size={13} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#111218] text-[11px] uppercase tracking-widest text-gray-500 border-b border-[#262736]">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1f2e] text-sm">
              {transactions.map((txn, i) => (
                <tr key={i} className="hover:bg-[#1a1b25]/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-400 text-xs">{txn.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#2a2b40] border border-[#3a3b50] flex items-center justify-center text-[10px] font-bold text-[#a78bfa]">
                        {txn.avatar}
                      </div>
                      <span className="text-gray-300">{txn.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{txn.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      txn.status === "COMPLETED"
                        ? "bg-green-500/10 text-green-400 border border-green-500/25"
                        : txn.status === "PENDING"
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/25"
                        : "bg-red-500/10 text-red-400 border border-red-500/25"
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{txn.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-600 hover:text-white transition-colors">
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
