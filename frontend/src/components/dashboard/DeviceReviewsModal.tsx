"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Star } from "lucide-react";
import { getDeviceRatings, Rating, RatingSummary } from "@/lib/api/ratings";
import { resolveImageUrl } from "@/lib/api/axios-instance";

interface DeviceReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
  deviceName?: string;
}

export default function DeviceReviewsModal({ isOpen, onClose, deviceId, deviceName }: DeviceReviewsModalProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brokenAvatars, setBrokenAvatars] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen || !deviceId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getDeviceRatings(deviceId, { limit: 20 });
        setRatings(res.data.ratings);
        setSummary(res.data.summary);
      } catch (err) {
        setError((err as { message?: string })?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, deviceId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2b36]">
          <div>
            <h3 className="text-lg font-bold text-white">Reviews{deviceName ? ` — ${deviceName}` : ""}</h3>
            {summary && summary.count > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-[#cbbefa] mt-1">
                <Star size={14} className="fill-[#cbbefa]" />
                <span className="font-semibold">{summary.avgRating.toFixed(1)}</span>
                <span className="text-gray-500">({summary.count} review{summary.count === 1 ? "" : "s"})</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#2a2b36]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl text-sm">{error}</div>
          ) : ratings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
              <Star size={28} className="opacity-20" />
              <p className="text-sm">No reviews yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {ratings.map((r) => (
                <div key={r._id} className="border-b border-[#2a2b36] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2a2b40] border border-[#3a3b50] flex items-center justify-center text-[10px] font-bold text-[#a78bfa] overflow-hidden">
                        {r.buyerProfilePicture && !brokenAvatars.has(r._id) ? (
                          <Image
                            src={resolveImageUrl(r.buyerProfilePicture)!}
                            alt={r.buyerUsername || "Reviewer"}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                            unoptimized
                            onError={() => setBrokenAvatars((prev) => new Set(prev).add(r._id))}
                          />
                        ) : (
                          (r.buyerUsername?.[0] || "?").toUpperCase()
                        )}
                      </div>
                      <span className="text-sm text-white font-medium">@{r.buyerUsername || "unknown"}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={12}
                          className={n <= r.stars ? "text-[#cbbefa] fill-[#cbbefa]" : "text-gray-700"}
                        />
                      ))}
                    </div>
                  </div>
                  {r.review && <p className="text-sm text-gray-400 leading-relaxed">{r.review}</p>}
                  <p className="text-[11px] text-gray-600 mt-1">
                    {new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
