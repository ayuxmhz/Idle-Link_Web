"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import BookDeviceModal from "@/components/dashboard/BookDeviceModal";
import DeviceReviewsModal from "@/components/dashboard/DeviceReviewsModal";
import { listDevices, Device } from "@/lib/api/devices";
import { createBooking } from "@/lib/api/bookings";
import { useUser } from "@/app/context/UserContext";
import { Search, Cpu, HardDrive, MemoryStick, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/api/axios-instance";

const TYPES: ("All" | Device["type"])[] = ["All", "GPU", "CPU", "ML-Ready", "Gaming"];

export default function MarketplacePage() {
  const { user } = useUser();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<(typeof TYPES)[number]>("All");

  const [bookingDevice, setBookingDevice] = useState<Device | null>(null);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bookedMessage, setBookedMessage] = useState("");
  const [reviewsDevice, setReviewsDevice] = useState<Device | null>(null);

  const fetchDevices = useCallback(async (type: (typeof TYPES)[number], searchTerm: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await listDevices({
        status: "live",
        type: type === "All" ? undefined : type,
        search: searchTerm || undefined,
      });
      setDevices(res.data);
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchDevices(activeType, search), 300);
    return () => clearTimeout(timeout);
  }, [activeType, search, fetchDevices]);

  const handleBookClick = (device: Device) => {
    setBookingDevice(device);
    setIsBookOpen(true);
  };

  const handleBookSubmit = async (data: { taskName: string; estimatedHours: number }) => {
    if (!bookingDevice) return;
    await createBooking(bookingDevice._id, data.taskName, data.estimatedHours);
    setBookedMessage(`Booked "${bookingDevice.name}" successfully. Track it on the Bookings page.`);
    setTimeout(() => setBookedMessage(""), 5000);
    fetchDevices(activeType, search);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header title="Marketplace" />

      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-[#cbbefa]" size={22} />
            Explore
          </h1>
          <p className="text-sm text-gray-400 mt-1">Rent idle compute from the community.</p>
        </div>

        {bookedMessage && (
          <div className="mb-6 p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            {bookedMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex gap-2 bg-[#16171f] border border-[#2a2b36] rounded-xl p-1.5 w-fit">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeType === type ? "bg-[#252538] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#16171f] border border-[#2a2b36] rounded-xl text-white focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">{error}</div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
            <ShoppingCart size={36} className="opacity-20" />
            <p>No live devices match your filters right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device) => {
              const isOwn = device.owner === user?._id;
              return (
                <div
                  key={device._id}
                  className={`bg-[#16171f] border border-[#2a2b36] rounded-xl p-6 flex flex-col gap-4 ${
                    device.hasActiveBooking && !isOwn ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2a2b40] border border-[#3a3b50] flex items-center justify-center text-[10px] font-bold text-[#a78bfa] overflow-hidden">
                      {device.ownerProfilePicture ? (
                        <Image
                          src={resolveImageUrl(device.ownerProfilePicture)!}
                          alt={device.ownerUsername || "Owner"}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        (device.ownerUsername?.[0] || "?").toUpperCase()
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {isOwn ? "You" : `@${device.ownerUsername || "unknown"}`}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-bold">{device.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">{device.type}</span>
                        {device.avgRating != null && (
                          <button
                            onClick={() => setReviewsDevice(device)}
                            className="flex items-center gap-1 text-xs text-[#cbbefa] hover:underline"
                          >
                            <Star size={11} className="fill-[#cbbefa]" />
                            {device.avgRating.toFixed(1)}
                            <span className="text-gray-500">({device.ratingCount})</span>
                          </button>
                        )}
                      </div>
                    </div>
                    {device.hasActiveBooking ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                        Booked
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                        Live
                      </span>
                    )}
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
                    {isOwn ? (
                      <span className="px-4 py-2 text-xs font-medium text-gray-500 border border-[#2a2b36] rounded-lg">
                        Your Device
                      </span>
                    ) : device.hasActiveBooking ? (
                      <span className="px-4 py-2 text-xs font-medium text-gray-500 border border-[#2a2b36] rounded-lg cursor-not-allowed">
                        Booked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBookClick(device)}
                        className="px-4 py-2 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors"
                      >
                        Book
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BookDeviceModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        onSubmit={handleBookSubmit}
        device={bookingDevice}
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
