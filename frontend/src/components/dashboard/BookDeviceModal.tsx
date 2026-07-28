"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, CheckCircle2 } from "lucide-react";
import { Device } from "@/lib/api/devices";

interface BookDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { taskName: string; estimatedHours: number }) => Promise<void>;
  device: Device | null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function BookDeviceModal({
  isOpen,
  onClose,
  onSubmit,
  device,
}: BookDeviceModalProps) {
  const [taskName, setTaskName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setTaskName("");
      setEstimatedHours(1);
      setError("");
      setShowSuccess(false);
    })();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!device) return;
    if (estimatedHours < 0.5) {
      setError("Estimated hours must be at least 0.5");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit({ taskName, estimatedHours });
      setShowSuccess(true);
      await wait(1500);
      onClose();
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to book device");
    } finally {
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };

  if (!isOpen || !device) return null;

  const totalCost = Math.round(device.hourlyRate * estimatedHours * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {showSuccess ? (
          <div className="p-10 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={40} className="text-emerald-400" />
            <p className="text-white font-bold">Booking confirmed!</p>
          </div>
        ) : (
          <>
        <div className="flex items-center justify-between p-5 border-b border-[#2a2b36]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={18} className="text-[#cbbefa]" />
            Book {device.name}
          </h3>
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
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Task Description</label>
              <input
                required
                type="text"
                placeholder="LLM Fine-tuning Task"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estimated Hours</label>
              <input
                required
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours || ""}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
              />
            </div>

            <div className="bg-[#111218] border border-[#2a2b36] rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                NPR {device.hourlyRate}/hr &times; {estimatedHours || 0}hr
              </span>
              <span className="text-lg font-bold text-[#cbbefa]">NPR {totalCost.toLocaleString()}</span>
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
              className="px-5 py-2 text-sm font-bold text-[#2c2057] bg-[#cbbefa] hover:bg-[#b8abeb] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-[#2c2057] border-t-transparent rounded-full animate-spin" />
              )}
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
