import Link from "next/link";
import Image from "next/image";
import { SunMedium } from "lucide-react";

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98.01 1.96.13 2.88.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5H12z" />
    </svg>
  );
}

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Marketplace", href: "/register" },
      { label: "AI Matcher", href: "/register" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/documentation" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About IdleLink", href: "/roadmap" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

// Showcase-only for now — not wired to real accounts yet.
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.076.076 0 00-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.029 19.83 19.83 0 006.002-3.03.077.077 0 00.032-.057c.5-5.177-.838-9.674-3.548-13.66a.06.06 0 00-.031-.028z" />
    </svg>
  );
}

// GitHub links to the real repo; X/Discord are shown as a visual showcase
// only (no accounts set up yet) so they render as inert, not dead links.
const GITHUB_REPO_URL = "https://github.com/ayuxmhz/Idle-Link_Web";
const SOCIAL_LINKS: { label: string; href?: string; icon: React.ReactNode }[] = [
  { label: "GitHub", href: GITHUB_REPO_URL, icon: <GithubIcon /> },
  { label: "X (Twitter)", icon: <XIcon /> },
  { label: "Discord", icon: <DiscordIcon /> },
  // Decorative only for now — no light theme has been built yet.
  { label: "Toggle theme", icon: <SunMedium size={16} /> },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 md:px-14 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="IdleLink Logo"
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span className="text-white font-bold text-lg">IdleLink</span>
              </Link>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[220px] mb-4">
              A compute marketplace — rent idle GPUs and CPUs from the community, or list your own.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) =>
                s.href ? (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/25 transition-colors"
                  >
                    {s.icon}
                  </a>
                ) : (
                  <span
                    key={s.label}
                    aria-label={s.label}
                    title={`${s.label} — coming soon`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-600"
                  >
                    {s.icon}
                  </span>
                )
              )}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-gray-300 text-xs font-semibold uppercase tracking-widest mb-4">{col.title}</h3>
              <div className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <p className="text-gray-700 text-xs">© {new Date().getFullYear()} IdleLink. All rights reserved.</p>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Privacy
            </Link>
          </div>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-xs font-mono transition-colors"
          >
            <GithubIcon />
            GitHub v2.4.1
          </a>
        </div>
      </div>
    </footer>
  );
}
