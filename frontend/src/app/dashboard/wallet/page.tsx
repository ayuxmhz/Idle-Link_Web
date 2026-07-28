"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import AmountModal from "@/components/dashboard/AmountModal";
import { listMyTransactions, withdraw, Transaction } from "@/lib/api/transactions";
import { initiateEsewaDeposit } from "@/lib/api/esewa";
import { submitToEsewa } from "@/lib/esewaRedirect";
import { useUser } from "@/app/context/UserContext";
import { Wallet as WalletIcon, ArrowUpCircle, Download, Upload, Landmark, RefreshCw } from "lucide-react";

const TYPE_LABELS: Record<Transaction["type"], string> = {
  job_payment: "Job Payment",
  commission: "Commission",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
};

export default function WalletPage() {
  const { user, setUser, fetchUser } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [modalMode, setModalMode] = useState<"withdraw" | "esewa" | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listMyTransactions({ limit: 20 });
      setTransactions(res.data);
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchTransactions();
    })();
  }, [fetchTransactions]);

  const handleAmountSubmit = async (amount: number, destination: string) => {
    if (modalMode === "esewa") {
      const res = await initiateEsewaDeposit(amount);
      submitToEsewa(res.data.paymentUrl, res.data.fields);
      return; // browser is navigating away to eSewa's checkout page
    }
    if (modalMode === "withdraw") {
      await withdraw(amount, destination);
      // Update the balance immediately from the known result instead of
      // waiting on a second round-trip fetch, so it never looks stale.
      if (user) setUser({ ...user, walletBalance: (user.walletBalance ?? 0) - amount });
    }
    await Promise.all([fetchUser(), fetchTransactions()]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Keep the spin visible for a moment even when the request itself is
      // near-instant, so the click reads as "refreshing" rather than nothing
      // happening.
      await Promise.all([fetchUser(), new Promise((resolve) => setTimeout(resolve, 500))]);
    } finally {
      setRefreshing(false);
    }
  };

  const balance = user?.walletBalance ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header title="Wallet" />

      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <WalletIcon className="text-[#cbbefa]" size={22} />
            Wallet
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your balance and view transaction history.</p>
        </div>

        <div className="bg-gradient-to-r from-[#2c2057] via-[#3d2a7a] to-[#1a1b2e] border border-[#2a2b36] rounded-xl p-8 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-gray-300 uppercase tracking-widest">Available Balance</p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh balance"
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <p className="text-4xl font-bold text-white">NPR {balance.toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setModalMode("esewa")}
              className="px-5 py-2.5 bg-[#60bb46] hover:bg-[#4fa338] text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <Landmark size={16} />
              Deposit with eSewa
            </button>
            <button
              onClick={() => setModalMode("withdraw")}
              className="px-5 py-2.5 bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowUpCircle size={16} />
              Withdraw
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-8">
          eSewa is running in <span className="text-gray-400">test mode</span> (sandbox) — no real money moves. Withdrawals are simulated to the eSewa ID or bank account you enter.
        </p>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Transaction History</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
            <WalletIcon size={36} className="opacity-20" />
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="bg-[#16171f] rounded-xl border border-[#2a2b36] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#1a1b25] border-b border-[#2a2b36] text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Description</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2b36]">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-[#1a1b25]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2a2b36]/50 flex items-center justify-center text-gray-400">
                            {tx.amount >= 0 ? <Download size={14} /> : <Upload size={14} />}
                          </div>
                          <span className="text-sm text-white">{TYPE_LABELS[tx.type]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{tx.description}</td>
                      <td className={`px-6 py-4 text-sm font-mono ${tx.amount >= 0 ? "text-[#cbbefa]" : "text-gray-300"}`}>
                        {tx.amount >= 0 ? "+" : "-"}NPR {Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <AmountModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        onSubmit={handleAmountSubmit}
        title={modalMode === "esewa" ? "Deposit with eSewa (Test Mode)" : "Withdraw Funds"}
        actionLabel={modalMode === "esewa" ? "Continue to eSewa" : "Withdraw"}
        requireDestination={modalMode === "withdraw"}
        processingLabel={modalMode === "withdraw" ? "Processing withdrawal..." : undefined}
        successLabel={modalMode === "withdraw" ? "Withdrawal successful!" : undefined}
        minProcessingMs={modalMode === "withdraw" ? 3500 : 0}
      />
    </div>
  );
}
