import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GetStartedSection from "@/components/GetStartedSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import HeroSection from "@/components/HeroSection";

const stats = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
        <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 12h3M13 12h4M18 7l-3 3.5M18 17l-3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "NETWORK DENSITY",
    value: "1,402 Nodes Active",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="8" y="8" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 9h2M4 12h2M4 15h2M18 9h2M18 12h2M18 15h2M9 4v2M12 4v2M15 4v2M9 18v2M12 18v2M15 18v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "PROCESSING POWER",
    value: "4.2 PFLOPS Total Compute",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "MEMORY POOL",
    value: "12.4 PB Available RAM",
  },
];

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v12M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 21H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    iconBg: "bg-amber-900/30 border-amber-700/30 text-amber-400",
    title: "For Sellers",
    description:
      "Connect your idle GPUs or CPUs via our secure client. Set your rates, monitor utilization in real-time, and receive automated payouts with zero friction.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21V9M8 17l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 3H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    iconBg: "bg-orange-900/30 border-orange-700/30 text-orange-400",
    title: "For Buyers",
    description:
      "Deploy Docker containers or raw binaries across a globally distributed network. Access massive parallel compute at a fraction of traditional cloud costs.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 4v5c0 4-2.9 7.7-7 9-4.1-1.3-7-5-7-9V7l7-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    iconBg: "bg-blue-900/30 border-blue-700/30 text-blue-400",
    title: "Enterprise Security",
    description:
      "End-to-end encryption, container isolation, and rigorous node vetting ensure your workloads and data remain isolated and tamper-proof.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0d16] text-white flex flex-col">
      <Navbar />

      <HeroSection />

      {/* ── Stats ── */}
      <section className="px-6 md:px-14 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#12131f] border border-white/[0.06] rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                {stat.icon}
                <span className="text-gray-500 text-[11px] font-mono tracking-[0.12em] uppercase">
                  {stat.label}
                </span>
              </div>
              <p className="text-white text-[22px] font-mono font-medium tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#0e0f1c] border-t border-white/5 px-6 md:px-14 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature) => (
            <div key={feature.title}>
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${feature.iconBg}`}
              >
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <GetStartedSection />

      <HowItWorksSection />

      <Footer />
    </div>
  );
}