"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { CreditCard, Download, Upload } from "lucide-react";

interface AdminTransaction {
  _id: string;
  user: { username: string; firstName: string; lastName: string } | null;
  type: "job_payment" | "commission" | "deposit" | "withdrawal";
  amount: number;
  description: string;
  createdAt: string;
}

const TYPE_LABELS: Record<AdminTransaction["type"], string> = {
  job_payment: "Job Payment",
  commission: "Commission",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const limit = 15;
  const [typeFilter, setTypeFilter] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const fetchTransactions = useCallback(async (currentPage: number, type: string) => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("auth_token");
      const res = await axios.get("/api/v1/admin/transactions", {
        params: { page: currentPage, limit, type: type || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchTransactions(page, typeFilter);
    })();
  }, [page, typeFilter, fetchTransactions]);

  return (
    <div className="min-h-screen bg-[#111218] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-[#cbbefa]" size={24} />
            Transactions
          </h1>
          <p className="text-sm text-gray-400 mt-1">All wallet activity across the platform.</p>
        </div>

        <div className="bg-[#16171f] p-4 rounded-xl border border-[#2a2b36] flex items-center gap-4">
          <select
            value={typeFilter}
            onChange={(e) => { setPage(1); setTypeFilter(e.target.value); }}
            className="px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white text-sm focus:outline-none focus:border-[#cbbefa]"
          >
            <option value="">All Types</option>
            <option value="job_payment">Job Payment</option>
            <option value="commission">Commission</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>

        <div className="bg-[#16171f] rounded-xl border border-[#2a2b36] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1b25] border-b border-[#2a2b36] text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2b36]">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
                  </td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-red-400 bg-red-500/5">{error}</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard size={32} className="opacity-20" />
                      <p>No transactions found.</p>
                    </div>
                  </td></tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-[#1a1b25]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#2a2b40] border border-[#3a3b50] flex items-center justify-center text-[10px] font-bold text-[#a78bfa]">
                            {(tx.user?.firstName?.[0] || tx.user?.username?.[0] || "?").toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-300">@{tx.user?.username || "deleted-user"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          {tx.amount >= 0 ? <Download size={14} className="text-green-400" /> : <Upload size={14} className="text-gray-500" />}
                          {TYPE_LABELS[tx.type]}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{tx.description}</td>
                      <td className={`px-6 py-4 text-sm font-mono ${tx.amount >= 0 ? "text-green-400" : "text-gray-300"}`}>
                        {tx.amount >= 0 ? "+" : "-"}NPR {Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && !error && transactions.length > 0 && (
            <div className="px-6 py-4 border-t border-[#2a2b36] flex items-center justify-between bg-[#111218]">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{(page - 1) * limit + 1}</span> to <span className="text-white font-medium">{Math.min(page * limit, meta.total)}</span> of <span className="text-white font-medium">{meta.total}</span> transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-[#16171f] border border-[#2a2b36] rounded-lg hover:bg-[#2a2b36] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="px-3 py-1.5 text-sm font-medium text-[#cbbefa] bg-[#cbbefa]/10 border border-[#cbbefa]/20 rounded-lg">
                  Page {page} of {meta.totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-[#16171f] border border-[#2a2b36] rounded-lg hover:bg-[#2a2b36] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
