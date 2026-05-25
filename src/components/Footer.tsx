import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 md:px-14 py-5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-gray-600 text-xs font-mono">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-purple-600"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          IdleLink System v2.4.1
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="#"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="#"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        <p className="text-gray-700 text-xs">
          © 2024 IdleLink. All rights reserved.
        </p>
      </div>
    </footer>
  );
}