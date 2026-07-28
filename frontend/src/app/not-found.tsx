import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c0d16] text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-mono text-[#cbbefa] tracking-widest mb-4">404</p>
      <h1 className="text-3xl font-bold mb-3">Page not found</h1>
      <p className="text-gray-400 text-sm max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
