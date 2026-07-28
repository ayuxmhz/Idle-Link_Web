"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FileText, Download, Upload } from "lucide-react";
import RangeToggle, { Range } from "@/components/RangeToggle";

interface AdminTransaction {
  _id: string;
  type: "job_payment" | "commission" | "deposit" | "withdrawal";
  amount: number;
  createdAt: string;
}

interface AdminDevice {
  _id: string;
  type: string;
}

interface AdminUser {
  _id: string;
  createdAt: string;
}

const TYPE_LABELS: Record<AdminTransaction["type"], string> = {
  job_payment: "Job Payments",
  commission: "Commission",
  deposit: "Deposits",
  withdrawal: "Withdrawals",
};

const DEVICE_TYPE_COLORS: Record<string, string> = {
  GPU: "bg-purple-400",
  CPU: "bg-blue-400",
  "ML-Ready": "bg-green-400",
  Gaming: "bg-orange-400",
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = startOfDay(d);
  monday.setDate(monday.getDate() + diffToMonday);
  return monday;
}

// Builds signup buckets for the requested granularity, always ending "now":
// day -> last 14 days, week -> last 8 weeks, month -> last 6 months.
function buildSignupBuckets(users: AdminUser[], range: Range): { label: string; count: number }[] {
  const now = new Date();

  if (range === "day") {
    return Array.from({ length: 14 }, (_, i) => {
      const d = startOfDay(now);
      d.setDate(d.getDate() - (13 - i));
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = users.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= d && created < next;
      }).length;
      return { label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count };
    });
  }

  if (range === "week") {
    return Array.from({ length: 8 }, (_, i) => {
      const d = startOfWeek(now);
      d.setDate(d.getDate() - (7 - i) * 7);
      const next = new Date(d);
      next.setDate(d.getDate() + 7);
      const count = users.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= d && created < next;
      }).length;
      return { label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count };
    });
  }

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const count = users.filter((u) => {
      const created = new Date(u.createdAt);
      return created >= d && created < next;
    }).length;
    return { label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), count };
  });
}

export default function AdminReportsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signupRange, setSignupRange] = useState<Range>("month");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const token = Cookies.get("auth_token");
        const headers = { Authorization: `Bearer ${token}` };
        const [txnRes, deviceRes, userRes] = await Promise.all([
          axios.get("/api/v1/admin/transactions", { params: { limit: 500 }, headers }),
          axios.get("/api/v1/admin/devices", { params: { limit: 500 }, headers }),
          axios.get("/api/v1/admin/users", { params: { limit: 500 }, headers }),
        ]);
        setTransactions(txnRes.data.data);
        setDevices(deviceRes.data.data);
        setUsers(userRes.data.data);
      } catch (err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const typeTotals = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.type] = (acc[tx.type] ?? 0) + Math.abs(tx.amount);
    return acc;
  }, {});
  const maxTypeTotal = Math.max(1, ...Object.values(typeTotals));

  const deviceTypeCounts = devices.reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1;
    return acc;
  }, { GPU: 0, CPU: 0, "ML-Ready": 0, Gaming: 0 });
  const maxDeviceTypeCount = Math.max(1, ...Object.values(deviceTypeCounts));

  const signupBuckets = buildSignupBuckets(users, signupRange);
  const maxSignups = Math.max(1, ...signupBuckets.map((m) => m.count));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111218] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-[#cbbefa]" size={24} />
          Reports
        </h1>
        <p className="text-sm text-gray-400 mt-1">Platform breakdowns across transactions, devices, and user growth.</p>
      </div>

      {error && (
        <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Transaction type breakdown */}
        <div className="bg-[#16171f] border border-[#262736] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Transaction Volume by Type</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500">No transactions yet.</p>
          ) : (
            <div className="space-y-4">
              {(["job_payment", "commission", "deposit", "withdrawal"] as const).map((type) => {
                const total = typeTotals[type] ?? 0;
                const pct = (total / maxTypeTotal) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>{TYPE_LABELS[type]}</span>
                      <span className="font-mono text-gray-300">Rs {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full h-2 bg-[#1a1b26] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device type distribution */}
        <div className="bg-[#16171f] border border-[#262736] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Devices by Type</h2>
          {devices.length === 0 ? (
            <p className="text-sm text-gray-500">No devices listed yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(deviceTypeCounts).map(([type, count]) => {
                const pct = (count / maxDeviceTypeCount) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>{type}</span>
                      <span className="text-gray-300">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-[#1a1b26] rounded-full overflow-hidden">
                      <div className={`h-full ${DEVICE_TYPE_COLORS[type] || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* User signups trend */}
      <div className="bg-[#16171f] border border-[#262736] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">User Signups</h2>
          <RangeToggle value={signupRange} onChange={setSignupRange} />
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {signupBuckets.map((m, i) => (
            <div key={`${m.label}-${i}`} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-xs text-gray-400">{m.count}</span>
              <div
                className="w-full bg-gradient-to-t from-[#6d28d9] to-[#a78bfa] rounded-t-sm transition-all"
                style={{ height: `${Math.max(4, (m.count / maxSignups) * 100)}%` }}
              />
              <span className="text-[10px] text-gray-500 whitespace-nowrap">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#16171f] border border-[#262736] rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400"><Download size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Total Inflow (Deposits)</p>
            <p className="text-lg font-bold text-white">
              Rs {(typeTotals.deposit ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="bg-[#16171f] border border-[#262736] rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400"><Upload size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Total Withdrawals</p>
            <p className="text-lg font-bold text-white">Rs {(typeTotals.withdrawal ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-[#16171f] border border-[#262736] rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400"><FileText size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Total Transactions</p>
            <p className="text-lg font-bold text-white">{transactions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
