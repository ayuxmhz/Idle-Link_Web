"use client";

import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Device, DeviceSpecs } from "@/lib/api/devices";
import { parseCapacityToGB } from "@/lib/parseCapacity";

interface DeviceFormData {
  name: string;
  type: Device["type"];
  hourlyRate: number;
  specs: DeviceSpecs;
}

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeviceFormData) => Promise<void>;
  initialData?: Device | null;
}

const EMPTY_FORM: DeviceFormData = {
  name: "",
  type: "GPU",
  hourlyRate: 0,
  specs: { cpu: "", ramGB: 0, gpu: "", storageGB: 0 },
};

export default function DeviceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DeviceFormModalProps) {
  const [formData, setFormData] = useState<DeviceFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // RAM/storage are typed as free text ("16GB", "1 TB", "512") rather than
  // being locked to a bare number field — kept separate from formData.specs
  // (which stays numeric, since it feeds real computations like the booking
  // service's simulated RAM utilization) so the input isn't fighting the
  // user's keystrokes while they type a unit suffix.
  const [ramGBText, setRamGBText] = useState("");
  const [storageGBText, setStorageGBText] = useState("");

  const isEditing = !!initialData;

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      if (initialData) {
        setFormData({
          name: initialData.name,
          type: initialData.type,
          hourlyRate: initialData.hourlyRate,
          specs: { ...initialData.specs },
        });
        setRamGBText(String(initialData.specs.ramGB));
        setStorageGBText(String(initialData.specs.storageGB));
      } else {
        setFormData(EMPTY_FORM);
        setRamGBText("");
        setStorageGBText("");
      }
      setError("");
    })();
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in formData.specs) {
      setFormData((prev) => ({
        ...prev,
        specs: { ...prev.specs, [name]: value },
      }));
    } else if (name === "hourlyRate") {
      setFormData((prev) => ({ ...prev, hourlyRate: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const ramGB = parseCapacityToGB(ramGBText);
    const storageGB = parseCapacityToGB(storageGBText);
    if (ramGB === null) {
      setError("RAM must be a number, optionally with a unit (e.g. 16GB, 1TB)");
      return;
    }
    if (storageGB === null) {
      setError("Storage must be a number, optionally with a unit (e.g. 512GB, 1TB)");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, specs: { ...formData.specs, ramGB, storageGB } });
      onClose();
    } catch (err) {
      setError((err as { message?: string })?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2b36]">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? "Edit Device" : "Add New Device"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#2a2b36]"
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
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Device Name</label>
              <input
                required
                type="text"
                name="name"
                placeholder="RTX 4090 Rig"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors appearance-none"
                >
                  <option value="GPU">GPU</option>
                  <option value="CPU">CPU</option>
                  <option value="ML-Ready">ML-Ready</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Hourly Rate (NPR)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="hourlyRate"
                  value={formData.hourlyRate || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">CPU</label>
                <input
                  required
                  type="text"
                  name="cpu"
                  placeholder="AMD Ryzen 9"
                  value={formData.specs.cpu}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">RAM</label>
                <input
                  required
                  type="text"
                  placeholder="16GB"
                  value={ramGBText}
                  onChange={(e) => setRamGBText(e.target.value)}
                  className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">GPU</label>
                <input
                  required
                  type="text"
                  name="gpu"
                  placeholder="RTX 4090"
                  value={formData.specs.gpu}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Storage</label>
                <input
                  required
                  type="text"
                  placeholder="512GB"
                  value={storageGBText}
                  onChange={(e) => setStorageGBText(e.target.value)}
                  className="w-full px-4 py-2 bg-[#111218] border border-[#2a2b36] rounded-lg text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-colors"
                />
              </div>
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
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-[#2c2057] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSubmitting ? "Saving..." : "Save Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
