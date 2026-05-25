import Link from "next/link";

const bullets = [
  "Earn passive income",
  "Rent affordable compute",
  "AI matches your task",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0c0d16] flex">
      {/* ── Left Panel ── */}
      <div className="hidden md:flex md:w-[45%] bg-[#10111d] border-r border-white/[0.06] flex-col p-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          IdleLink
        </Link>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center mt-12">
          <h2 className="text-[28px] font-bold text-white leading-tight mb-3">
            Your idle device,
            <br />
            someone&apos;s supercomputer.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
            Join the decentralized compute marketplace. Monetize your hardware
            downtime or access high-performance instances at a fraction of
            traditional cloud costs.
          </p>

          {/* Network visualization image area */}
          <div className="rounded-xl overflow-hidden h-44 bg-[#0c0d18] border border-white/[0.06] relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-950/10" />
            {/* Simulated network nodes */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 380 176"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Connection lines */}
              <line x1="60" y1="40" x2="150" y2="88" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.3"/>
              <line x1="150" y1="88" x2="230" y2="50" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.3"/>
              <line x1="230" y1="50" x2="310" y2="110" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.3"/>
              <line x1="150" y1="88" x2="200" y2="140" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.3"/>
              <line x1="60" y1="40" x2="100" y2="130" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.2"/>
              <line x1="100" y1="130" x2="200" y2="140" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.25"/>
              <line x1="200" y1="140" x2="310" y2="110" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.25"/>
              <line x1="230" y1="50" x2="320" y2="40" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.2"/>
              {/* Glow nodes */}
              <circle cx="60" cy="40" r="3" fill="#a78bfa" fillOpacity="0.8"/>
              <circle cx="150" cy="88" r="4" fill="#a78bfa" fillOpacity="0.9"/>
              <circle cx="230" cy="50" r="3" fill="#a78bfa" fillOpacity="0.7"/>
              <circle cx="310" cy="110" r="3" fill="#a78bfa" fillOpacity="0.8"/>
              <circle cx="200" cy="140" r="2.5" fill="#c4b5fd" fillOpacity="0.6"/>
              <circle cx="100" cy="130" r="2" fill="#c4b5fd" fillOpacity="0.5"/>
              <circle cx="320" cy="40" r="2" fill="#c4b5fd" fillOpacity="0.5"/>
              {/* Halos */}
              <circle cx="150" cy="88" r="8" fill="#7c3aed" fillOpacity="0.12"/>
              <circle cx="60" cy="40" r="6" fill="#7c3aed" fillOpacity="0.08"/>
              <circle cx="310" cy="110" r="6" fill="#7c3aed" fillOpacity="0.08"/>
            </svg>
          </div>
        </div>

        {/* Bullets */}
        <div className="space-y-3">
          {bullets.map((b) => (
            <div key={b} className="flex items-center gap-3 text-gray-300 text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-purple-400">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0c0d16]">
        <div className="w-full max-w-90">{children}</div>
      </div>
    </div>
  );
}