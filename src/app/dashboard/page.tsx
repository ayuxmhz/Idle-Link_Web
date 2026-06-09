import { getUserData, getTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const token = await getTokenCookie();
  const user = await getUserData();

  if (!token || !user) {
    redirect("/login");
  }

  const name =
    user?.firstName || user?.username || user?.name || user?.email || "Driver";

  return (
    <div className="min-h-screen bg-[#0c0d16] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/[0.06] pb-8">
          <div>
            <p className="text-[11px] font-mono tracking-[0.12em] uppercase text-purple-400 mb-2">
              Console
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {name}
            </h1>
          </div>
          <LogoutButton />
        </div>

        {/* Console Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-[#12131f] border border-white/[0.06] rounded-xl p-6">
            <h3 className="text-gray-500 text-[11px] font-mono tracking-[0.12em] uppercase mb-4">
              Node Status
            </h3>
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-medium text-lg">Active & Ready</span>
            </div>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              Your device is properly mapped to the IdleLink network, awaiting matching tasks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#12131f] border border-white/[0.06] rounded-xl p-6">
            <h3 className="text-gray-500 text-[11px] font-mono tracking-[0.12em] uppercase mb-4">
              Performance Share
            </h3>
            <p className="text-white font-mono font-medium text-2xl tracking-tight">
              0.00 GFLOPS
            </p>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              No tasks currently running. Idle compute is available for client rental.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#12131f] border border-white/[0.06] rounded-xl p-6">
            <h3 className="text-gray-500 text-[11px] font-mono tracking-[0.12em] uppercase mb-4">
              Pending Payouts
            </h3>
            <p className="text-purple-400 font-mono font-medium text-2xl tracking-tight">
              $0.00 USD
            </p>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              Earnings are calculated automatically and disbursed daily to your wallet address.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#12131f]/50 border border-white/[0.06] rounded-xl p-8">
          <h2 className="text-xl font-bold mb-4">Quick Setup</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Download our CLI client daemon to link your system&apos;s resources directly. Set allocation preferences, core usage ceilings, and priority parameters.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              Download Daemon (macOS/Linux)
            </button>
            <button className="px-5 py-2.5 bg-[#1a1b2e] hover:bg-[#25263d] border border-white/[0.08] text-white text-sm font-medium rounded-lg transition-all cursor-pointer">
              View CLI Guide
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
