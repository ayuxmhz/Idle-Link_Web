"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Plus, Search, Edit2, Trash2, Shield, Users } from "lucide-react";
import UserFormModal, { AdminUser, UserFormPayload } from "../../../components/admin/UserFormModal";
import ConfirmDeleteModal from "../../../components/admin/ConfirmDeleteModal";
import { resolveImageUrl } from "@/lib/api/axios-instance";
import Image from "next/image";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination & Search
  const [page, setPage] = useState(1);
  const limit = 10; // constant — no need for state
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce ref
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("auth_token");
      const res = await axios.get("/api/v1/admin/users", {
        params: { page: currentPage, limit: 10, search: currentSearch },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []); // stable — no deps that change

  // Only re-fetch when page changes. Search changes are handled by handleSearchChange.
  useEffect(() => {
    (async () => {
      await fetchUsers(page, search);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // intentionally omit fetchUsers & search — fetchUsers is stable, search changes use debounce

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      fetchUsers(1, val);
    }, 500);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: UserFormPayload) => {
    const token = Cookies.get("auth_token");
    const headers = { Authorization: `Bearer ${token}` };
    
    if (selectedUser) {
      // Edit
      await axios.put(`/api/v1/admin/users/${selectedUser._id}`, data, { headers });
    } else {
      // Create
      await axios.post("/api/v1/admin/users", data, { headers });
    }
    fetchUsers(page, search);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const token = Cookies.get("auth_token");
      await axios.delete(`/api/v1/admin/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteOpen(false);
      setUserToDelete(null);
      // If we deleted the last item on the page, go back a page
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUsers(page, search);
      }
    } catch (err) {
      console.error(err);
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111218] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="text-[#cbbefa]" size={24} />
              User Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              View and manage all users in the system.
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors flex items-center gap-2 w-fit shadow-lg shadow-[#cbbefa]/20"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#16171f] p-4 rounded-xl border border-[#2a2b36] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, username or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-all text-sm"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-[#16171f] rounded-xl border border-[#2a2b36] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1b25] border-b border-[#2a2b36] text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2b36]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="inline-block w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-red-400 bg-red-500/5">
                      {error}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={32} className="opacity-20" />
                        <p>No users found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-[#1a1b25]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2a2b36] border border-[#3a3b46] flex items-center justify-center text-[#cbbefa] font-bold overflow-hidden">
                            {user.profilePicture ? (
                              <Image
                                src={resolveImageUrl(user.profilePicture)!}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              (user.firstName?.[0] || user.username?.[0] || "U").toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white group-hover:text-[#cbbefa] transition-colors">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {user.role === 'admin' && <Shield size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-gray-400 hover:text-[#cbbefa] hover:bg-[#cbbefa]/10 rounded-lg transition-all"
                            title="Edit User"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {!loading && !error && users.length > 0 && (
            <div className="px-6 py-4 border-t border-[#2a2b36] flex items-center justify-between bg-[#111218]">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{(page - 1) * limit + 1}</span> to <span className="text-white font-medium">{Math.min(page * limit, meta.total)}</span> of <span className="text-white font-medium">{meta.total}</span> users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-[#16171f] border border-[#2a2b36] rounded-lg hover:bg-[#2a2b36] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="px-3 py-1.5 text-sm font-medium text-[#cbbefa] bg-[#cbbefa]/10 border border-[#cbbefa]/20 rounded-lg">
                  Page {page} of {meta.totalPages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
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

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
