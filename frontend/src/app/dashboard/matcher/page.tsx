"use client";

import { useState } from "react";
import Header from "@/components/dashboard/Header";
import BookDeviceModal from "@/components/dashboard/BookDeviceModal";
import { findMatchingDevices, MatchedDevice } from "@/lib/api/matcher";
import { createBooking } from "@/lib/api/bookings";
import { useUser } from "@/app/context/UserContext";
import { Sparkles, Cpu, HardDrive, MemoryStick, Search } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "I need to fine-tune a small language model over a weekend",
  "Something cheap for rendering a Blender animation",
  "High RAM machine for a data processing pipeline",
];

export default function MatcherPage() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<MatchedDevice[] | null>(null);

  const [bookingDevice, setBookingDevice] = useState<MatchedDevice | null>(null);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bookedMessage, setBookedMessage] = useState("");

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await findMatchingDevices(query);
      setResults(res.data);
    } catch (err) {
      setError((err as { message?: string })?.message || "Failed to find matches");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (device: MatchedDevice) => {
    setBookingDevice(device);
    setIsBookOpen(true);
  };

  const handleBookSubmit = async (data: { taskName: string; estimatedHours: number }) => {
    if (!bookingDevice) return;
    await createBooking(bookingDevice._id, data.taskName, data.estimatedHours);
    setBookedMessage(`Booked "${bookingDevice.name}" successfully. Track it on the Bookings page.`);
    setTimeout(() => setBookedMessage(""), 5000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header title="Matcher" />

      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-[#cbbefa]" size={22} />
            AI Job Matcher
          </h1>
          <p className="text-sm text-gray-400 mt-1">Describe your task in plain English and IdleLink Ai ranks the best-fitting live devices for you.</p>
        </div>

        {bookedMessage && (
          <div className="mb-6 p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            {bookedMessage}
          </div>
        )}

        <form onSubmit={runSearch} className="mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I need to fine-tune a small language model over a weekend, budget-friendly"
              rows={2}
              className="flex-1 px-4 py-3 bg-[#16171f] border border-[#2a2b36] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#cbbefa] focus:ring-1 focus:ring-[#cbbefa] transition-all text-sm resize-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 md:self-stretch"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#2c2057] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Find Devices
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setQuery(p)}
              className="px-3 py-1.5 text-xs text-gray-400 bg-[#16171f] border border-[#2a2b36] hover:border-[#cbbefa]/40 hover:text-white rounded-full transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-6 text-center text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl mb-8">{error}</div>
        )}

        {results !== null && !error && (
          results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
              <Sparkles size={36} className="opacity-20" />
              <p>No live devices matched that task. Try describing it differently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((device) => {
                const isOwn = device.owner === user?._id;
                return (
                  <div key={device._id} className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-bold">{device.name}</h3>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">{device.type}</span>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-[#cbbefa]/10 text-[#cbbefa] border border-[#cbbefa]/30">
                        {device.matchPercent}% match
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 italic">&ldquo;{device.explanation}&rdquo;</p>

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
          )
        )}
      </main>

      <BookDeviceModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        onSubmit={handleBookSubmit}
        device={bookingDevice}
      />
    </div>
  );
}
