"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ROADMAP } from "./roadmap-data";
import { ChevronDown, CheckCircle2, Rocket, Sparkles } from "lucide-react";

const STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode }> = {
  done: { badge: "bg-green-500/10 text-green-400 border-green-500/30", icon: <CheckCircle2 size={14} /> },
  next: { badge: "bg-[#cbbefa]/10 text-[#cbbefa] border-[#cbbefa]/30", icon: <Rocket size={14} /> },
  future: { badge: "bg-gray-500/10 text-gray-400 border-gray-500/30", icon: <Sparkles size={14} /> },
};

const STATUS_LABELS: Record<string, string> = {
  done: "Shipped",
  next: "Up Next",
  future: "Planned",
};

export default function RoadmapPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-[#0c0d16] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 md:px-14 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Roadmap</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            IdleLink started as a college project simulating a compute marketplace. Here&apos;s the plan for
            turning it into the real thing — from real payments, to a real compute agent, to a fully
            decentralized network.
          </p>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col">
          {ROADMAP.map((phase, i) => {
            const isOpen = openIndex === i;
            const style = STATUS_STYLES[phase.status];
            return (
              <div key={phase.phase} className="relative pl-10 pb-2">
                {/* timeline rail */}
                <div className="absolute left-[11px] top-1 bottom-0 w-px bg-[#2a2b36]" />
                <div
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    phase.status === "done"
                      ? "bg-green-500/20 border-green-500"
                      : phase.status === "next"
                      ? "bg-[#cbbefa]/20 border-[#cbbefa]"
                      : "bg-[#16171f] border-[#2a2b36]"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${phase.status === "done" ? "bg-green-500" : phase.status === "next" ? "bg-[#cbbefa]" : "bg-gray-600"}`} />
                </div>

                <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl mb-5 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{phase.phase}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${style.badge}`}>
                          {style.icon}
                          {STATUS_LABELS[phase.status]}
                        </span>
                        <span className="text-[11px] text-gray-500">{phase.timeline}</span>
                      </div>
                      <h2 className="text-lg font-bold text-white">{phase.title}</h2>
                    </div>
                    <ChevronDown size={18} className={`shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 space-y-5">
                      <p className="text-sm text-gray-400 leading-relaxed">{phase.goal}</p>

                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">Key Features</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          {phase.features.map((f) => (
                            <div key={f} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-[#cbbefa] mt-1.5 w-1 h-1 rounded-full bg-[#cbbefa] shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-[#2a2b36]">
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Revenue Target</p>
                          <p className="text-sm text-white font-mono">{phase.revenueTarget}</p>
                        </div>
                        <div className="flex-[2]">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Tech Stack</p>
                          <p className="text-xs text-gray-400 leading-relaxed">{phase.tech}</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 italic leading-relaxed">{phase.note}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
