"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import DeviceFormModal from "@/components/dashboard/DeviceFormModal";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import DeviceReviewsModal from "@/components/dashboard/DeviceReviewsModal";
import { listDevices, createDevice, updateDevice, deleteDevice, Device } from "@/lib/api/devices";
import { Plus, Cpu, HardDrive, MemoryStick, Archive, Pencil, Trash2, Star } from "lucide-react";

export default function InventoryPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [reviewsDevice, setReviewsDevice] = useState<Device | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listDevices({ owner: "me" });
      setDevices(res.data);
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchDevices();
    })();
  }, [fetchDevices]);

  const handleAdd = () => {
    setSelectedDevice(null);
    setIsFormOpen(true);
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: { name: string; type: Device["type"]; hourlyRate: number; specs: Device["specs"] }) => {
    if (selectedDevice) {
      await updateDevice(selectedDevice._id, data);
    } else {
      await createDevice(data);
    }
    fetchDevices();
  };

  const handleToggleStatus = async (device: Device) => {
    setTogglingId(device._id);
    try {
      await updateDevice(device._id, { status: device.status === "live" ? "offline" : "live" });
      fetchDevices();
    } catch (err) {
      alert((err as { message?: string })?.message || "Failed to update device status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDevice(deviceToDelete._id);
      setIsDeleteOpen(false);
      setDeviceToDelete(null);
      fetchDevices();
    } catch (err) {
      alert((err as { message?: string })?.message || "Failed to delete device");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header title="Inventory" />

      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Archive className="text-[#cbbefa]" size={22} />
              My Devices
            </h1>
            <p className="text-sm text-gray-400 mt-1">List your idle compute for others to rent.</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors flex items-center gap-2 w-fit shadow-lg shadow-[#cbbefa]/20"
          >
            <Plus size={18} />
            Add Device
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">{error}</div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
            <Archive size={36} className="opacity-20" />
            <p>You haven&apos;t listed any devices yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device._id} className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold">{device.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">{device.type}</span>
                      <button
                        onClick={() => setReviewsDevice(device)}
                        className="flex items-center gap-1 text-xs text-[#cbbefa] hover:underline"
                      >
                        <Star size={11} className={device.avgRating != null ? "fill-[#cbbefa]" : ""} />
                        {device.avgRating != null ? (
                          <>
                            {device.avgRating.toFixed(1)}
                            <span className="text-gray-500">({device.ratingCount})</span>
                          </>
                        ) : (
                          <span className="text-gray-500">No reviews</span>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(device)}
                    disabled={togglingId === device._id}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-colors disabled:opacity-50 ${
                      device.status === "live"
                        ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20"
                    }`}
                    title="Toggle live/offline"
                  >
                    {device.status === "live" ? "Live" : "Offline"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-400 font-mono">
                  <span className="flex items-center gap-1.5"><Cpu size={13} /> {device.specs.cpu}</span>
                  <span className="flex items-center gap-1.5"><MemoryStick size={13} /> {device.specs.ramGB}GB RAM</span>
                  <span className="flex items-center gap-1.5"><HardDrive size={13} /> {device.specs.storageGB}GB</span>
                  <span className="flex items-center gap-1.5 text-[#d4a853]">{device.specs.gpu}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2a2b36]">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Rate</p>
                    <p className="text-sm font-bold text-white">NPR {device.hourlyRate}/hr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Uptime</p>
                    <p className="text-sm font-bold text-white">{device.uptimePercent}%</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(device)}
                      className="p-2 text-gray-400 hover:text-[#cbbefa] hover:bg-[#cbbefa]/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(device)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <DeviceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedDevice}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Device"
        message={`Are you sure you want to delete "${deviceToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />

      <DeviceReviewsModal
        isOpen={reviewsDevice !== null}
        onClose={() => setReviewsDevice(null)}
        deviceId={reviewsDevice?._id ?? null}
        deviceName={reviewsDevice?.name}
      />
    </div>
  );
}
