"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import RangeToggle, { Range } from "@/components/RangeToggle";

interface AdminOverview {
  totalRevenue: number;
  revenueChangePercent: number;
  activeUsers: number;
  activeUsersChangePercent: number;
  liveNodes: number;
  liveNodesChangePercent: number;
  commissionEarned: number;
  commissionChangePercent: number;
  revenueChart: { day: string; total: number }[];
  topNodes: { name: string; uptimePercent: number; earnings: number }[];
  recentTransactions: {
    _id: string;
    user: { username: string } | null;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }[];
}

const MAX_VALUE_FLOOR = 1000;

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

function RevenueChart({ chartData }: { chartData: { day: string; value: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(MAX_VALUE_FLOOR, ...chartData.map((d) => d.value));
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round((maxValue * f) / 100) * 100);
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
      {yLabels.map((label) => {
        const y = PAD_TOP + PLOT_H - (label / maxValue) * PLOT_H;
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
              {label === 0 ? "0" : `Rs ${(label / 1000).toFixed(label >= 1000 ? 0 : 1)}k`}
            </text>
          </g>
        );
      })}

      {/* Bars + X labels */}
      {chartData.map((d, i) => {
        const barH = (d.value / maxValue) * PLOT_H;
        const x = PAD_LEFT + i * (barWidth + BAR_GAP);
        const y = PAD_TOP + PLOT_H - barH;

        return (
          <g key={d.day + i} className="group">
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(1, barH)}
              fill={hoveredIndex === i ? "url(#barHover)" : "url(#barGrad)"}
              rx="4"
              ry="4"
              className="transition-all cursor-default"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
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
            {hoveredIndex === i && (
              <foreignObject
                x={Math.min(Math.max(x + barWidth / 2 - 45, PAD_LEFT), CHART_W - PAD_RIGHT - 90)}
                y={Math.max(y - 34, 0)}
                width={90}
                height={26}
                className="pointer-events-none"
              >
                <div className="bg-[#22232f] border border-[#3a3b4a] text-white text-[11px] font-semibold px-2 py-1 rounded-md text-center shadow-lg">
                  Rs {d.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const UPTIME_COLOR = (pct: number) => (pct >= 99.5 ? "bg-green-400" : pct >= 97 ? "bg-blue-400" : "bg-orange-400");

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revenueRange, setRevenueRange] = useState<Range>("week");

  const fetchOverview = useCallback(async (range: Range) => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("auth_token");
      const res = await axios.get("/api/v1/admin/stats/overview", {
        params: { range },
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverview(res.data.data);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Failed to fetch overview stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchOverview(revenueRange);
    })();
  }, [fetchOverview, revenueRange]);

  if (loading && !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111218]">
        <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 md:p-8">
        <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Revenue",
      value: `Rs ${overview.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      change: `${overview.revenueChangePercent >= 0 ? "+" : ""}${overview.revenueChangePercent}%`,
      isPositive: overview.revenueChangePercent >= 0,
      icon: <span className="text-blue-400 font-bold text-base leading-none">Rs</span>,
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Active Users",
      value: overview.activeUsers.toLocaleString(),
      change: `${overview.activeUsersChangePercent >= 0 ? "+" : ""}${overview.activeUsersChangePercent}%`,
      isPositive: overview.activeUsersChangePercent >= 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      iconBg: "bg-orange-500/10",
    },
    {
      title: "Live Nodes",
      value: overview.liveNodes.toLocaleString(),
      change: `${overview.liveNodesChangePercent >= 0 ? "+" : ""}${overview.liveNodesChangePercent}%`,
      isPositive: overview.liveNodesChangePercent >= 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
      ),
      iconBg: "bg-red-500/10",
    },
    {
      title: "Commission Earned",
      value: `Rs ${overview.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      change: `${overview.commissionChangePercent >= 0 ? "+" : ""}${overview.commissionChangePercent}%`,
      isPositive: overview.commissionChangePercent >= 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
          <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
        </svg>
      ),
      iconBg: "bg-purple-500/10",
    },
  ];

  const topNodes = overview.topNodes.map((node) => ({
    name: node.name,
    uptime: `${node.uptimePercent}%`,
    earnings: `Rs ${node.earnings.toLocaleString()}`,
    uptimeColor: UPTIME_COLOR(node.uptimePercent),
  }));

  const transactions = overview.recentTransactions.map((txn) => ({
    id: `TXN-${txn._id.slice(-6).toUpperCase()}`,
    user: txn.user?.username || "deleted-user",
    avatar: (txn.user?.username?.[0] || "?").toUpperCase(),
    amount: `Rs ${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    description: txn.description,
    status: "COMPLETED",
    date: new Date(txn.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  }));

  const chartData = overview.revenueChart.map((d) => ({ day: d.day, value: d.total }));

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
            <p className="text-sm text-gray-400 mb-1">{m.title}</p>
            <p className="text-[22px] font-bold text-white leading-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Top Nodes row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#16171f] border border-[#262736] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-white">Revenue</h2>
            <RangeToggle value={revenueRange} onChange={setRevenueRange} />
          </div>
          <div className="h-[220px] w-full">
            <RevenueChart chartData={chartData} />
          </div>
        </div>

        <div className="bg-[#16171f] border border-[#262736] rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-white">Top Nodes</h2>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {topNodes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No earnings recorded yet.</p>
            ) : (
              topNodes.map((node, i) => (
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#16171f] border border-[#262736] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#262736] flex justify-between items-center">
          <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#111218] text-[11px] uppercase tracking-widest text-gray-500 border-b border-[#262736]">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">For</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1f2e] text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions yet.</td>
                </tr>
              ) : (
                transactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-[#1a1b25]/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400 text-xs">{txn.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#2a2b40] border border-[#3a3b50] flex items-center justify-center text-[10px] font-bold text-[#a78bfa]">
                          {txn.avatar}
                        </div>
                        <span className="text-gray-300">@{txn.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-[220px] truncate" title={txn.description}>{txn.description}</td>
                    <td className="px-6 py-4 text-gray-300">{txn.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/25">
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{txn.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
