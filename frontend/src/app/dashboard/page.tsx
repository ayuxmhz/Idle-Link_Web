"use client";

import { useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import ActiveJobCard, { ActiveJobViewModel } from "@/components/dashboard/ActiveJobCard";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import EarningsChart from "@/components/dashboard/EarningsChart";
import TransactionList, { TransactionViewModel } from "@/components/dashboard/TransactionList";
import { BarChart2 } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { listMyBookings, Booking } from "@/lib/api/bookings";
import { listDevices } from "@/lib/api/devices";
import { listMyTransactions, getSummary, EarningsSummary, Transaction } from "@/lib/api/transactions";

const TRANSACTION_TYPE_LABELS: Record<Transaction["type"], string> = {
  job_payment: "Job Payment",
  commission: "Commission",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
};

const formatNpr = (value: number) => `NPR ${Math.round(value).toLocaleString()}`;

const todayIndexMonFirst = () => {
  const jsDay = new Date().getDay(); // 0 (Sun) - 6 (Sat)
  return jsDay === 0 ? 6 : jsDay - 1;
};

export default function DashboardPage() {
  const { user } = useUser();

  const [runningJobs, setRunningJobs] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [avgUptime, setAvgUptime] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      const [bookingsRes, summaryRes, devicesRes, transactionsRes] = await Promise.allSettled([
        listMyBookings({ role: "seller", status: "running" }),
        getSummary("week"),
        listDevices({ owner: "me" }),
        listMyTransactions({ limit: 5 }),
      ]);

      if (cancelled) return;

      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.success) {
        setRunningJobs(bookingsRes.value.data);
      }
      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
      if (devicesRes.status === "fulfilled" && devicesRes.value?.success) {
        const devices = devicesRes.value.data as { uptimePercent: number }[];
        setAvgUptime(
          devices.length > 0
            ? devices.reduce((sum, d) => sum + d.uptimePercent, 0) / devices.length
            : null
        );
      }
      if (transactionsRes.status === "fulfilled" && transactionsRes.value?.success) {
        setTransactions(transactionsRes.value.data);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const dayIndex = todayIndexMonFirst();
  const todayTotal = summary?.dailyBreakdown?.[dayIndex]?.total ?? summary?.todayTotal ?? 0;
  const yesterdayTotal = dayIndex > 0 ? summary?.dailyBreakdown?.[dayIndex - 1]?.total : undefined;
  const earningsBadge =
    yesterdayTotal && yesterdayTotal > 0
      ? `${todayTotal >= yesterdayTotal ? "+" : ""}${Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)}%`
      : undefined;

  const primaryJob = runningJobs[0];
  const activeJob: ActiveJobViewModel | undefined = primaryJob
    ? {
        taskName: primaryJob.taskName,
        buyerUsername: primaryJob.buyerUsername,
        progress: primaryJob.progress ?? 0,
        cpuUtilPercent: primaryJob.cpuUtilPercent ?? 0,
        ramUsedGB: primaryJob.ramUsedGB ?? 0,
        ramTotalGB: primaryJob.ramTotalGB ?? 0,
        gpuLabel: primaryJob.gpuLabel ?? "GPU",
        gpuUtilPercent: primaryJob.gpuUtilPercent ?? 0,
        consoleLines: primaryJob.consoleLines ?? [],
      }
    : undefined;

  const transactionViewModels: TransactionViewModel[] = transactions.map((tx) => ({
    type: TRANSACTION_TYPE_LABELS[tx.type],
    details: tx.description,
    amount: `${tx.amount >= 0 ? "+" : "-"}${formatNpr(Math.abs(tx.amount))}`,
    positive: tx.amount >= 0,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header />

      <main className="flex-1 p-8">

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Earnings"
            value={formatNpr(todayTotal)}
            badge={earningsBadge}
          />
          <StatCard
            title="This Week"
            value={formatNpr(summary?.weekTotal ?? 0)}
            icon={<BarChart2 size={28} className="text-[#cbbefa]" />}
          />
          <StatCard
            title="Active Jobs"
            value={String(runningJobs.length)}
            icon={<div className="w-4 h-4 rounded-full bg-[#cbbefa] shadow-[0_0_10px_#cbbefa]" />}
          />
          <StatCard
            title="Uptime (30d)"
            value={avgUptime !== null ? `${avgUptime.toFixed(1)}%` : "—"}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-8">

          {/* Left Column (Active Jobs & Recommended) */}
          <div className="flex-[2] flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Active Jobs</h2>
              <ActiveJobCard job={activeJob} />
            </div>
            <RecommendedActions />
          </div>

          {/* Right Column (Earnings & Transactions) */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-[260px]">
              <EarningsChart data={summary?.dailyBreakdown} />
            </div>
            <div className="flex-1 min-h-[260px]">
              <TransactionList transactions={transactionViewModels} />
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
