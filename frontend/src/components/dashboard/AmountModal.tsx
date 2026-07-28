"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";

interface AmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, destination: string) => Promise<void>;
  title: string;
  actionLabel: string;
  requireDestination?: boolean;
  // Optional staged UX for actions that should visibly "process" rather than
  // resolve instantly (e.g. withdrawals) — shows processingLabel while the
  // request is in flight (padded to at least minProcessingMs), then
  // successLabel briefly before the modal closes itself.
  processingLabel?: string;
  successLabel?: string;
  minProcessingMs?: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AmountModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  actionLabel,
  requireDestination = false,
  processingLabel,
  successLabel,
  minProcessingMs = 0,
}: AmountModalProps) {
  const [amount, setAmount] = useState(0);
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setAmount(0);
      setDestination("");
      setError("");
      setShowSuccess(false);
    })();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await Promise.all([onSubmit(amount, destination), wait(minProcessingMs)]);
      if (successLabel) {
        setShowSuccess(true);
        await wait(1500);
      }
      onClose();
    } catch (err) {
      setError((err as { message?: string })?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {showSuccess ? (
          <div className="p-10 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={40} className="text-emerald-400" />
            <p className="text-white font-bold">{successLabel}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-[#2a2b36]">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#2a2b36] disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Amount (NPR)</label>
                  <input
                    required
                    autoFocus
                    type="number"
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors disabled:opacity-50"
                  />
                </div>
                {requireDestination && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">eSewa ID or Bank Account</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 98XXXXXXXX or account number"
                      disabled={isSubmitting}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors disabled:opacity-50"
                    />
                  </div>
                )}
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
                  className="px-5 py-2 text-sm font-bold text-[#2c2057] bg-[#cbbefa] hover:bg-[#b8abeb] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-[#2c2057] border-t-transparent rounded-full animate-spin" />
                  )}
                  {isSubmitting ? processingLabel || "Processing..." : actionLabel}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
