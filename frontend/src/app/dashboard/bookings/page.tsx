"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import RatingModal from "@/components/dashboard/RatingModal";
import CancelBookingModal from "@/components/dashboard/CancelBookingModal";
import { listMyBookings, cancelBooking, Booking } from "@/lib/api/bookings";
import { createRating } from "@/lib/api/ratings";
import { CalendarClock, User, X, Star } from "lucide-react";

const STATUS_STYLES: Record<Booking["status"], string> = {
  running: "bg-[#a39dfa]/10 text-[#a39dfa] border-[#a39dfa]/30",
  completed: "bg-green-500/10 text-green-400 border-green-500/30",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export default function BookingsPage() {
  const [role, setRole] = useState<"seller" | "buyer">("buyer");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async (currentRole: "seller" | "buyer") => {
    setLoading(true);
    setError("");
    try {
      const res = await listMyBookings({ role: currentRole, limit: 50 });
      setBookings(res.data);
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchBookings(role);
    })();
  }, [role, fetchBookings]);

  const handleCancelSubmit = async (reason: string) => {
    if (!cancellingBooking) return;
    await cancelBooking(cancellingBooking._id, reason);
    setCancellingBooking(null);
    fetchBookings(role);
  };

  const handleRatingSubmit = async (stars: number, review: string) => {
    if (!ratingBooking) return;
    await createRating(ratingBooking._id, stars, review || undefined);
    setRatingBooking(null);
    fetchBookings(role);
  };

  const runningBookings = bookings.filter((b) => b.status === "running");
  const historyBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header title="Bookings" />

      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarClock className="text-[#cbbefa]" size={22} />
              Bookings
            </h1>
            <p className="text-sm text-gray-400 mt-1">Jobs you&apos;ve booked and jobs running on your devices.</p>
          </div>
          <div className="flex gap-2 bg-[#16171f] border border-[#2a2b36] rounded-xl p-1.5 w-fit">
            {(["buyer", "seller"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  role === r ? "bg-[#252538] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {r === "buyer" ? "As Buyer" : "As Seller"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
            <CalendarClock size={36} className="opacity-20" />
            <p>No bookings {role === "buyer" ? "made" : "received"} yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {runningBookings.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Active</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {runningBookings.map((booking) => (
                    <div key={booking._id} className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-bold text-sm">{booking.taskName}</h3>
                          {role === "seller" && booking.buyerUsername && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                              <User size={12} /> {booking.buyerUsername}
                            </div>
                          )}
                        </div>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>

                      {booking.status === "running" && (
                        <div className="mb-3">
                          <div className="w-full h-1.5 bg-[#2a2b36] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#cbbefa] transition-all duration-500"
                              style={{ width: `${booking.progress ?? 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{booking.progress ?? 0}% complete</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-300">NPR {booking.totalCost}</span>
                        {role === "buyer" && (
                          <button
                            onClick={() => setCancellingBooking(booking)}
                            className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <X size={13} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {historyBookings.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">History</h2>
                <div className="bg-[#16171f] rounded-xl border border-[#2a2b36] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#1a1b25] border-b border-[#2a2b36] text-xs uppercase tracking-wider text-gray-400">
                          <th className="px-6 py-3 font-semibold">Task</th>
                          {role === "seller" && <th className="px-6 py-3 font-semibold">Buyer</th>}
                          <th className="px-6 py-3 font-semibold">Amount</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          {role === "seller" && <th className="px-6 py-3 font-semibold">Cancel Reason</th>}
                          {role === "buyer" && <th className="px-6 py-3 font-semibold">Rating</th>}
                          <th className="px-6 py-3 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2b36]">
                        {historyBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-[#1a1b25]/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-white">{booking.taskName}</td>
                            {role === "seller" && (
                              <td className="px-6 py-4 text-sm text-gray-400">{booking.buyerUsername || "—"}</td>
                            )}
                            <td className="px-6 py-4 text-sm font-mono text-gray-300">NPR {booking.totalCost}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_STYLES[booking.status]}`}>
                                {booking.status}
                              </span>
                            </td>
                            {role === "seller" && (
                              <td className="px-6 py-4 text-sm text-gray-400 max-w-[220px] truncate" title={booking.cancelReason}>
                                {booking.status === "cancelled" ? booking.cancelReason || "—" : <span className="text-gray-600">—</span>}
                              </td>
                            )}
                            {role === "buyer" && (
                              <td className="px-6 py-4">
                                {booking.status !== "completed" ? (
                                  <span className="text-gray-600 text-xs">—</span>
                                ) : booking.rating ? (
                                  <div className="flex items-center gap-1 text-[#cbbefa]">
                                    <Star size={13} className="fill-[#cbbefa]" />
                                    <span className="text-xs font-semibold">{booking.rating.stars}</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setRatingBooking(booking)}
                                    className="px-3 py-1 text-xs font-medium text-[#cbbefa] border border-[#cbbefa]/30 hover:bg-[#cbbefa]/10 rounded-lg transition-colors"
                                  >
                                    Rate
                                  </button>
                                )}
                              </td>
                            )}
                            <td className="px-6 py-4 text-xs text-gray-500">
                              {new Date(booking.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <RatingModal
        isOpen={ratingBooking !== null}
        onClose={() => setRatingBooking(null)}
        onSubmit={handleRatingSubmit}
        taskName={ratingBooking?.taskName ?? ""}
      />

      <CancelBookingModal
        isOpen={cancellingBooking !== null}
        onClose={() => setCancellingBooking(null)}
        onSubmit={handleCancelSubmit}
        taskName={cancellingBooking?.taskName ?? ""}
      />
    </div>
  );
}
