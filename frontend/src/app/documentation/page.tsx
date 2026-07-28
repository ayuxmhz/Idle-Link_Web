import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, ShoppingCart, Archive, Wallet, Sparkles, Star } from "lucide-react";

const SECTIONS = [
  {
    icon: <Archive size={18} />,
    title: "Listing a device",
    body: "Open Inventory and click \"Add Device\". Provide its name, type, CPU/RAM/GPU/storage specs, and hourly rate in NPR. New devices start Offline — flip a device to Live from its menu to make it bookable on the Marketplace.",
  },
  {
    icon: <ShoppingCart size={18} />,
    title: "Booking a device",
    body: "Browse Marketplace, filter by type or search, and click Book on any Live device. Enter a task name and estimated hours — the estimated cost is deducted from your wallet immediately. Track progress from your Dashboard or the Bookings page.",
  },
  {
    icon: <Wallet size={18} />,
    title: "Wallet, deposits & withdrawals",
    body: "Deposit funds with eSewa (running in sandbox/test mode — no real money moves) or withdraw to an eSewa ID / bank account. Every deposit, withdrawal, payment, payout, and commission is logged in your transaction history.",
  },
  {
    icon: <Sparkles size={18} />,
    title: "AI Job Matcher",
    body: "Describe your workload in plain English and the Matcher (powered by Google Gemini) ranks currently live devices by fit, with a percentage match and a short explanation for each recommendation.",
  },
  {
    icon: <Star size={18} />,
    title: "Ratings & reviews",
    body: "Once a booking completes, the buyer can leave a star rating and a short review for that device. Ratings are averaged and shown on the device's Marketplace card to help other buyers choose.",
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#0c0d16] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 md:px-14 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <FileText className="text-purple-400" size={32} />
              Documentation
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">How IdleLink works, end to end.</p>
          </div>

          <div className="flex flex-col gap-4">
            {SECTIONS.map((section) => (
              <div key={section.title} className="bg-[#12131f] border border-white/[0.06] rounded-xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg mb-1">{section.title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">{section.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
