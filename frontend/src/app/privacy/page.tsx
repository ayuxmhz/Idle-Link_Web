import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "What we collect",
    body:
      "Account details you provide at signup (name, username, email, password — stored as a bcrypt hash, never in plain text) or via Google Sign-In (name, email, profile photo). Optional profile fields like phone number and profile picture. Device listings you create (specs, hourly rate, status) and bookings you make or receive. Wallet transactions (deposits, withdrawals, payments, payouts). Ratings and reviews you leave after a completed booking.",
  },
  {
    title: "How it's used",
    body:
      "Solely to operate the marketplace: authenticating you, matching bookings between buyers and sellers, calculating and crediting wallet balances, sending you email verification codes and booking/payment notifications, and showing your device's ratings to other users. Your data is never sold or shared with third parties for advertising.",
  },
  {
    title: "Payments",
    body:
      "Deposits and withdrawals go through eSewa. In this environment eSewa runs in sandbox/test mode — no real money moves and no real payment details are collected. In a production deployment, payment credentials would be handled entirely by eSewa's own checkout flow; IdleLink never sees or stores your card or eSewa password.",
  },
  {
    title: "Third-party services",
    body:
      "Google (OAuth sign-in, and the Gemini API for the AI Job Matcher — your matcher queries are sent to Google's API to generate recommendations). Resend (for transactional emails like verification codes). eSewa (for payments). Each is used only for the specific feature it powers.",
  },
  {
    title: "Your controls",
    body:
      "You can update or remove your profile information at any time from Settings. Deleting your account (or asking us to) removes your personal profile data; transaction and booking records tied to completed payments are retained for accounting integrity, consistent with standard marketplace practice.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0c0d16] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 md:px-14 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <Shield className="text-purple-400" size={32} />
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              IdleLink is a student coursework project. This page describes, in plain language, what data the
              application actually collects and how it&apos;s used — no legalese, no hidden tracking.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {SECTIONS.map((section) => (
              <div key={section.title} className="bg-[#12131f] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-white font-semibold text-lg mb-2">{section.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-xs mt-10">Last updated {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
