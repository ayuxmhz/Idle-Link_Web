"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Pause, ChevronRight, Star, CheckCircle2, Zap } from "lucide-react";

interface Step {
  title: string;
  description: string;
  visual: React.ReactNode;
}

const PROVIDERS = [
  { user: "@provider_01", gpu: "2x RTX 4090", rate: "1,200", rating: 5.0 },
  { user: "@provider_02", gpu: "1x RTX 4090", rate: "950", rating: 4.8 },
  { user: "@provider_03", gpu: "1x RTX 4050", rate: "450", rating: 4.5, selected: true },
  { user: "@provider_04", gpu: "1x Ryzen 9 CPU", rate: "300", rating: null },
];

function SearchVisual() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Live devices</p>
        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/25 font-mono">
          {PROVIDERS.length} online
        </span>
      </div>

      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium rounded-lg px-3 py-2 mb-4">
        <CheckCircle2 size={14} />
        Booking confirmed
        <span className="ml-auto font-mono text-emerald-300">1 / 1</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-[10px] text-gray-500 uppercase tracking-widest px-1 mb-2">
        <span>Device</span>
        <span>Rate/hr</span>
        <span>Rating</span>
      </div>

      <div className="flex flex-col divide-y divide-white/5 border-t border-white/5">
        {PROVIDERS.map((p) => (
          <div key={p.user} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 py-3 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.selected ? "bg-[#cbbefa]" : "bg-emerald-500"}`} />
              <div className="min-w-0">
                <p className="text-xs text-gray-300 font-mono truncate">{p.user}</p>
                <p className="text-[11px] text-gray-600 truncate">{p.gpu}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400">NPR {p.rate}</span>
            {p.selected ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#cbbefa]/15 text-[#cbbefa] border border-[#cbbefa]/30 whitespace-nowrap">
                ✓ Booked
              </span>
            ) : p.rating ? (
              <span className="flex items-center gap-1 text-xs text-gray-300 font-mono">
                <Star size={11} className="fill-[#cbbefa] text-[#cbbefa]" />
                {p.rating.toFixed(1)}
              </span>
            ) : (
              <span className="text-xs text-gray-600">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchVisual() {
  const matches = [
    { name: "RTX 4090", spec: "24GB VRAM · CUDA", pct: 96 },
    { name: "RTX 4050", spec: "6GB VRAM · CUDA", pct: 81 },
    { name: "Ryzen 9 CPU", spec: "32GB RAM", pct: 42 },
  ];
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={14} className="text-[#cbbefa]" />
        <p className="text-sm font-semibold text-white">AI Job Matcher</p>
      </div>

      <div className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 mb-5">
        &quot;I need a GPU to train a small image classifier&quot;
      </div>

      <div className="flex flex-col gap-2.5">
        {matches.map((m, i) => (
          <div
            key={m.name}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${
              i === 0 ? "bg-[#cbbefa]/[0.08] border-[#cbbefa]/30" : "bg-white/[0.02] border-white/5"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{m.name}</p>
              <p className="text-[11px] text-gray-500">{m.spec}</p>
            </div>
            <span className={`text-sm font-bold font-mono ${i === 0 ? "text-[#cbbefa]" : "text-gray-500"}`}>
              {m.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PayoutVisual() {
  const consoleLines = [
    "Loading dataset shards 1-40...",
    "Initializing distributed training...",
    "Epoch 8/10. Loss: 0.9142, Step: 4200/5000",
    "Epoch 10/10 complete. Job finished.",
  ];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">train_model.py</p>
        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#cbbefa]/15 text-[#cbbefa] border border-[#cbbefa]/30">
          COMPLETED
        </span>
      </div>

      <div className="bg-black/40 border border-white/5 rounded-lg p-3.5 font-mono text-[11px] leading-relaxed text-gray-400 mb-4">
        {consoleLines.map((line, i) => (
          <p key={i} className={i === consoleLines.length - 1 ? "text-emerald-400" : undefined}>
            <span className="text-gray-600">{"> "}</span>
            {line}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold rounded-lg px-3.5 py-3">
        <CheckCircle2 size={16} />
        <span className="flex-1">Payout sent to wallet</span>
        <span className="font-mono">+ NPR 425.00</span>
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    title: "Search or list a device",
    description:
      "Browse the marketplace for live GPUs and CPUs, or list your own idle hardware with a price per hour in a couple of minutes.",
    visual: <SearchVisual />,
  },
  {
    title: "Get matched instantly",
    description:
      "Book a device directly, or describe your workload to the AI Matcher and get ranked recommendations with a fit score in seconds.",
    visual: <MatchVisual />,
  },
  {
    title: "Job runs, you get paid",
    description:
      "Track live progress from your dashboard. When the job completes, payouts land in the seller's wallet automatically — no invoicing.",
    visual: <PayoutVisual />,
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [playing]);

  return (
    <section className="bg-[#0c0d16] border-t border-white/5 px-6 md:px-14 py-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: terminal-style mockup, swaps per active step */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="flex items-center gap-1.5 px-5 py-4 border-b border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>

          <div key={active} className="animate-fade-in-scale min-h-[330px]">
            {STEPS[active].visual}
          </div>
        </div>

        {/* Right: numbered steps */}
        <div>
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
            Go from searching for compute to a running job in minutes — no contracts, no waiting.
          </p>

          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4 border-t border-white/10 first:border-t-0 py-5">
                <button
                  onClick={() => setActive(i)}
                  className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    active === i
                      ? "bg-[#cbbefa] border-[#cbbefa] text-[#2c2057]"
                      : "bg-transparent border-white/15 text-gray-500 hover:border-white/30"
                  }`}
                >
                  {i + 1}
                </button>
                <div className="flex-1">
                  <button onClick={() => setActive(i)} className="text-left w-full">
                    <span
                      className={`font-semibold block transition-all duration-300 ${
                        active === i ? "text-white text-lg mb-2" : "text-gray-400 text-base"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-400 ease-out ${
                      active === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`text-gray-400 text-sm leading-relaxed max-w-md transition-opacity duration-300 ${
                          active === i ? "opacity-100 delay-100" : "opacity-0"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Show step ${i + 1}`}
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

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors"
            >
              Get Started
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
