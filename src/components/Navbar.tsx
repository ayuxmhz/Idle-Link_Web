import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-14 py-4 border-b border-white/5">
      <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-purple-400"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white">IdleLink</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-gray-300 hover:text-white text-sm transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/register"
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors font-medium"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}