import Link from "next/link";

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 8h10M7 12h6M7 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 md:px-14 pt-24 pb-28 lg:pt-28 lg:pb-32">
      {/* Decorative background gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-purple-600/[0.16] rounded-full blur-[130px]" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.035)_1px,transparent_0)] [background-size:32px_32px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-gray-300 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_theme(colors.purple.400)]" />
          Now onboarding early providers
        </div>

        <h1 className="animate-fade-up-1 text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.06] tracking-tight mb-6">
          Share your idle device,
          <br />
          <span className="bg-gradient-to-r from-purple-300 via-purple-200 to-white bg-clip-text text-transparent">
            earn every day.
          </span>
        </h1>

        <p className="animate-fade-up-2 text-gray-400 text-lg leading-relaxed mb-9 max-w-2xl mx-auto">
          Join the high-performance compute marketplace. Monetize your
          underutilized hardware or access scalable, reliable GPU
          infrastructure on demand.
        </p>

        <div className="animate-fade-up-2 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-b from-purple-500 to-purple-600 text-white text-sm font-semibold shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_24px_-8px_rgba(147,51,234,0.6)] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_30px_-6px_rgba(147,51,234,0.75)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            <MonitorIcon />
            Start Earning
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/12 text-gray-200 text-sm font-medium hover:border-orange-400/50 hover:text-white hover:bg-orange-500/[0.06] transition-all duration-300"
          >
            <DocumentIcon />
            Rent Compute
          </Link>
        </div>

        <div className="animate-fade-up-3 flex items-center justify-center gap-6 mt-10 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            eSewa secured payouts
          </span>
        </div>
      </div>
    </section>
  );
}
