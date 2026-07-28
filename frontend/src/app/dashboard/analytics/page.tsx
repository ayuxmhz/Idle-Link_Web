"use client";

import { useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import EarningsChart from "@/components/dashboard/EarningsChart";
import { listMyBookings, Booking } from "@/lib/api/bookings";
import { listDevices, Device } from "@/lib/api/devices";
import { getSummary, EarningsSummary } from "@/lib/api/transactions";
import { BarChart2, TrendingUp, TrendingDown, CalendarClock } from "lucide-react";

const STATUS_COLORS: Record<Booking["status"], string> = {
  running: "bg-[#a39dfa]",
  completed: "bg-green-400",
  cancelled: "bg-gray-500",
};

export default function AnalyticsPage() {
  const [sellerBookings, setSellerBookings] = useState<Booking[]>([]);
  const [buyerBookings, setBuyerBookings] = useState<Booking[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [sellerRes, buyerRes, devicesRes, summaryRes] = await Promise.all([
          listMyBookings({ role: "seller", limit: 100 }),
          listMyBookings({ role: "buyer", limit: 100 }),
          listDevices({ owner: "me" }),
          getSummary("week"),
        ]);
        setSellerBookings(sellerRes.data);
        setBuyerBookings(buyerRes.data);
        setDevices(devicesRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        setError((err as { message?: string })?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalEarned = sellerBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.totalCost * 0.85, 0);
  const totalSpent = buyerBookings
    .filter((b) => b.status === "completed" || b.status === "running")
    .reduce((sum, b) => sum + b.totalCost, 0);
  const avgUptime = devices.length > 0
    ? devices.reduce((sum, d) => sum + d.uptimePercent, 0) / devices.length
    : null;

  const allBookings = [...sellerBookings, ...buyerBookings];
  const statusCounts = allBookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});
  const totalBookingCount = sellerBookings.length + buyerBookings.length;

  const deviceStats = devices.map((device) => {
    const bookingsForDevice = sellerBookings.filter((b) => b.device === device._id && b.status === "completed");
    const earned = bookingsForDevice.reduce((sum, b) => sum + b.totalCost * 0.85, 0);
    return { device, bookingCount: bookingsForDevice.length, earned };
  }).sort((a, b) => b.earned - a.earned);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#111218]">
        <Header title="Analytics" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header title="Analytics" />

      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-[#cbbefa]" size={22} />
            Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-1">Your earnings, spending, and device performance at a glance.</p>
        </div>

        {error && (
          <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl mb-8">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earned (as Seller)"
            value={`NPR ${totalEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            icon={<TrendingUp size={22} className="text-green-400" />}
          />
          <StatCard
            title="Total Spent (as Buyer)"
            value={`NPR ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            icon={<TrendingDown size={22} className="text-orange-400" />}
          />
          <StatCard
            title="Total Bookings"
            value={String(totalBookingCount)}
            icon={<CalendarClock size={22} className="text-[#cbbefa]" />}
          />
          <StatCard
            title="Avg. Device Uptime"
            value={avgUptime !== null ? `${avgUptime.toFixed(1)}%` : "—"}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 h-[280px]">
            <EarningsChart data={summary?.dailyBreakdown} />
          </div>

          <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Booking Status</h3>
            {totalBookingCount === 0 ? (
              <p className="text-sm text-gray-500">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {(["running", "completed", "cancelled"] as const).map((status) => {
                  const count = statusCounts[status] ?? 0;
                  const pct = totalBookingCount > 0 ? (count / totalBookingCount) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1 capitalize">
                        <span>{status}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#2a2b36] rounded-full overflow-hidden">
                        <div className={`h-full ${STATUS_COLORS[status]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Device Performance</h2>
        {devices.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-[#16171f] border border-[#2a2b36] rounded-xl">
            You haven&apos;t listed any devices yet.
          </div>
        ) : (
          <div className="bg-[#16171f] rounded-xl border border-[#2a2b36] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#1a1b25] border-b border-[#2a2b36] text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-3 font-semibold">Device</th>
                    <th className="px-6 py-3 font-semibold">Completed Jobs</th>
                    <th className="px-6 py-3 font-semibold">Earned</th>
                    <th className="px-6 py-3 font-semibold">Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2b36]">
                  {deviceStats.map(({ device, bookingCount, earned }) => (
                    <tr key={device._id} className="hover:bg-[#1a1b25]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-white font-medium">{device.name}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{device.type}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{bookingCount}</td>
                      <td className="px-6 py-4 text-sm font-mono text-[#cbbefa]">NPR {earned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{device.uptimePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
