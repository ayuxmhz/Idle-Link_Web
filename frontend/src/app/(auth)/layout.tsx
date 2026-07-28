import Link from "next/link";
import Image from "next/image";
import NetworkBackground from "@/components/NetworkBackground";

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
          <Image
            src="/logo.png"
            alt="IdleLink Logo"
            width={22}
            height={22}
            className="object-contain"
          />
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
          <div className="glow-border rounded-xl overflow-hidden h-44 border border-white/[0.06] relative mb-4">
            <NetworkBackground />
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