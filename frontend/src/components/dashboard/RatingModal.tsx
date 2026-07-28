"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stars: number, review: string) => Promise<void>;
  taskName: string;
}

export default function RatingModal({ isOpen, onClose, onSubmit, taskName }: RatingModalProps) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars < 1) {
      setError("Please select a star rating");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit(stars, review);
      setStars(0);
      setReview("");
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2b36]">
          <h3 className="text-lg font-bold text-white">Rate this booking</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#2a2b36]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-400">&quot;{taskName}&quot;</p>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-center gap-1 py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHoverStars(n)}
                  onMouseLeave={() => setHoverStars(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={30}
                    className={(hoverStars || stars) >= n ? "text-[#cbbefa] fill-[#cbbefa]" : "text-gray-600"}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Review (optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="How was this device?"
                className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-5 border-t border-[#2a2b36] bg-[#111218]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent border border-gray-600 rounded-lg transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-[#2c2057] bg-[#cbbefa] hover:bg-[#b8abeb] rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
