"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Play, Pause, Cpu, HardDrive, MemoryStick } from "lucide-react";

interface Panel {
  title: string;
  description: string;
  cta: { label: string; href: string };
  visual: React.ReactNode;
}

function ProviderVisual() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 bg-[#16171f] border border-[#2a2b36] rounded-xl p-5">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-1">Earnings</p>
        <p className="text-2xl font-bold text-white mb-3">NPR 4,850.00</p>
        <div className="flex items-end gap-1.5 h-16">
          {[30, 55, 40, 70, 45, 85, 60].map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-[#6d28d9] to-[#cbbefa] rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-4">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-1">Uptime</p>
        <p className="text-xl font-bold text-white">100%</p>
      </div>
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-4">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-1">Devices</p>
        <p className="text-xl font-bold text-white">3 Live</p>
      </div>
    </div>
  );
}

function BuyerVisual() {
  return (
    <div className="flex flex-col gap-3">
      {[
        { name: "RTX 4090", type: "GPU", rate: "NPR 12/hr" },
        { name: "Ryzen 9 Node", type: "CPU", rate: "NPR 5/hr" },
      ].map((d) => (
        <div key={d.name} className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">{d.name}</p>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Cpu size={11} /> {d.type}</span>
              <span className="flex items-center gap-1"><MemoryStick size={11} /> 32GB</span>
              <span className="flex items-center gap-1"><HardDrive size={11} /> 1TB</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{d.rate}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">Live</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MatcherVisual() {
  return (
    <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-5">
      <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">Ask the AI Matcher</p>
      <div className="bg-[#111218] border border-[#2a2b36] rounded-lg px-3 py-2.5 text-sm text-gray-300 mb-4">
        &quot;I need a GPU to train a small image classifier&quot;
      </div>
      <div className="flex items-center justify-between bg-[#111218] border border-[#cbbefa]/30 rounded-lg px-3 py-2.5">
        <div>
          <p className="text-sm font-bold text-white">RTX 4090</p>
          <p className="text-[11px] text-gray-500">Great for CUDA-accelerated training</p>
        </div>
        <span className="text-sm font-bold text-[#cbbefa]">96% match</span>
      </div>
    </div>
  );
}

const PANELS: Panel[] = [
  {
    title: "Become a Compute Provider",
    description:
      "Monetize your idle GPU or CPU. List your hardware in minutes, set your own hourly rate, and get paid automatically to your in-app wallet as jobs complete.",
    cta: { label: "List a Device", href: "/register" },
    visual: <ProviderVisual />,
  },
  {
    title: "Rent Compute On Demand",
    description:
      "Browse live devices from the community, filter by GPU/CPU/ML-Ready, and book by the hour. No contracts, no idle cloud bills — pay only for what you use.",
    cta: { label: "Browse Marketplace", href: "/register" },
    visual: <BuyerVisual />,
  },
  {
    title: "Find the Right Device with AI",
    description:
      "Describe your workload in plain English and the AI Job Matcher, powered by Google Gemini, ranks live devices by fit with a match score and explanation.",
    cta: { label: "Try the Matcher", href: "/register" },
    visual: <MatcherVisual />,
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function GetStartedSection() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % PANELS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [playing]);

  const panel = PANELS[active];

  return (
    <section className="bg-[#0e0f1c] border-t border-white/5 px-6 md:px-14 py-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: rotating pitch list */}
        <div>
          <h2 className="text-4xl font-bold text-white mb-10">Get Started</h2>

          <div className="flex flex-col">
            {PANELS.map((p, i) => (
              <div key={p.title} className="border-t border-white/10 first:border-t-0">
                <button
                  onClick={() => setActive(i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 group"
                >
                  <span
                    className={`font-semibold transition-all duration-300 ${
                      active === i ? "text-white text-lg" : "text-gray-500 text-base group-hover:text-gray-300"
                    }`}
                  >
                    {p.title}
                  </span>
                  <ChevronRight
                    size={20}
                    className={`text-[#cbbefa] shrink-0 transition-all duration-300 ${
                      active === i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-400 ease-out ${
                    active === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`pb-6 -mt-2 transition-opacity duration-300 ${active === i ? "opacity-100 delay-100" : "opacity-0"}`}
                    >
                      <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-md">{p.description}</p>
                      <Link
                        href={p.cta.href}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors"
                      >
                        {p.cta.label}
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex gap-1.5">
              {PANELS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show panel ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    active === i ? "w-6 bg-[#cbbefa]" : "w-1.5 bg-gray-700 hover:bg-gray-600"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        </div>

        {/* Right: mock preview matching the active panel */}
        <div className="rounded-2xl bg-gradient-to-br from-[#3d2a7a] via-[#2c2057] to-[#1a1b2e] border border-white/10 p-8 min-h-[360px] flex items-center overflow-hidden">
          <div key={active} className="w-full animate-fade-in-scale">
            {panel.visual}
          </div>
        </div>
      </div>
    </section>
  );
}
