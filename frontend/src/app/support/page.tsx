"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, Mail, ChevronDown, MessageSquare } from "lucide-react";

const FAQS = [
  {
    q: "How do I list a device to earn money?",
    a: "Go to Inventory and click \"Add Device\". Fill in its specs and hourly rate, then set it to Live from the device menu — it'll immediately appear on the Marketplace for others to book.",
  },
  {
    q: "How does booking and payment work?",
    a: "Renting a device deducts the estimated cost from your wallet upfront. Once the job completes, 85% of that goes to the device owner and 15% is IdleLink's commission. If you cancel a running booking, you get a full refund.",
  },
  {
    q: "Why can't I book a device that says \"Booked\"?",
    a: "A device can only run one job at a time. Once its current booking finishes (or is cancelled), it becomes available again.",
  },
  {
    q: "How do I add funds to my wallet?",
    a: "Use \"Deposit with eSewa\" on the Wallet page. This project runs eSewa in sandbox/test mode, so no real money is charged — use the published eSewa test credentials.",
  },
  {
    q: "How do withdrawals work?",
    a: "Enter the amount and a destination (eSewa ID or bank account) on the Wallet page. Like deposits, withdrawals are simulated in this environment — no real transfer takes place.",
  },
  {
    q: "What is the AI Matcher?",
    a: "Describe what you need in plain English (e.g. \"a GPU for training a small image classifier\") and the Matcher ranks live devices by fit, with an explanation for each match.",
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#0c0d16] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 md:px-14 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <HelpCircle className="text-purple-400" size={32} />
              Support
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">Answers to common questions, and how to reach us.</p>
          </div>

          <div className="bg-[#12131f] border border-white/[0.06] rounded-xl divide-y divide-white/[0.06] mb-8">
            {FAQS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-500 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openIndex === i && (
                  <p className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#12131f] border border-white/[0.06] rounded-xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">Still need help?</h2>
              <p className="text-gray-400 text-sm mb-3">Reach out and we&apos;ll get back to you as soon as we can.</p>
              <a
                href="mailto:support@idlelink.com.np"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <Mail size={15} />
                support@idlelink.com.np
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
