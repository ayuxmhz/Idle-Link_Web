"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Search, Trash2, Server, Zap } from "lucide-react";
import ConfirmDeleteModal from "../../../components/admin/ConfirmDeleteModal";

interface AdminDevice {
  _id: string;
  name: string;
  type: string;
  hourlyRate: number;
  status: "live" | "offline";
  uptimePercent: number;
  ownerUsername?: string;
  createdAt: string;
}

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<AdminDevice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchDevices = useCallback(async (currentPage: number, currentSearch: string, type: string, status: string) => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("auth_token");
      const res = await axios.get("/api/v1/admin/devices", {
        params: { page: currentPage, limit, search: currentSearch, type: type || undefined, status: status || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchDevices(page, search, typeFilter, statusFilter);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchDevices(1, val, typeFilter, statusFilter);
    }, 500);
  };

  const handleDeleteClick = (device: AdminDevice) => {
    setDeviceToDelete(device);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;
    setIsDeleting(true);
    try {
      const token = Cookies.get("auth_token");
      await axios.delete(`/api/v1/admin/devices/${deviceToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteOpen(false);
      setDeviceToDelete(null);
      if (devices.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchDevices(page, search, typeFilter, statusFilter);
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || "Failed to delete device");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111218] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="text-[#cbbefa]" size={24} />
            Nodes
          </h1>
          <p className="text-sm text-gray-400 mt-1">All devices listed on the platform.</p>
        </div>

        <div className="bg-[#16171f] p-4 rounded-xl border border-[#2a2b36] flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by device name..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-all text-sm"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setPage(1); setTypeFilter(e.target.value); }}
            className="px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white text-sm focus:outline-none focus:border-[#cbbefa]"
          >
            <option value="">All Types</option>
            <option value="GPU">GPU</option>
            <option value="CPU">CPU</option>
            <option value="ML-Ready">ML-Ready</option>
            <option value="Gaming">Gaming</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            className="px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white text-sm focus:outline-none focus:border-[#cbbefa]"
          >
            <option value="">All Status</option>
            <option value="live">Live</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="bg-[#16171f] rounded-xl border border-[#2a2b36] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1b25] border-b border-[#2a2b36] text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4 font-semibold">Device</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Rate</th>
                  <th className="px-6 py-4 font-semibold">Uptime</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2b36]">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
                  </td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-red-400 bg-red-500/5">{error}</td></tr>
                ) : devices.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Server size={32} className="opacity-20" />
                      <p>No devices found matching your criteria.</p>
                    </div>
                  </td></tr>
                ) : (
                  devices.map((device) => (
                    <tr key={device._id} className="hover:bg-[#1a1b25]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{device.name}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{device.type}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">@{device.ownerUsername || "unknown"}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-300">NPR {device.hourlyRate}/hr</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{device.uptimePercent}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          device.status === "live"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>
                          {device.status === "live" && <Zap size={12} />}
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(device)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Device"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && !error && devices.length > 0 && (
            <div className="px-6 py-4 border-t border-[#2a2b36] flex items-center justify-between bg-[#111218]">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{(page - 1) * limit + 1}</span> to <span className="text-white font-medium">{Math.min(page * limit, meta.total)}</span> of <span className="text-white font-medium">{meta.total}</span> devices
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

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Device"
        message={`Are you sure you want to delete "${deviceToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
