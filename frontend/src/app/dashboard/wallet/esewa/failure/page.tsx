import Link from "next/link";
import { XCircle } from "lucide-react";

export default function EsewaFailurePage() {
  return (
    <div className="min-h-screen bg-[#111218] flex items-center justify-center p-8">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-10 max-w-md w-full text-center">
        <XCircle size={40} className="mx-auto mb-4 text-red-400" />
        <h1 className="text-xl font-bold text-white mb-2">Payment cancelled</h1>
        <p className="text-sm text-gray-400 mb-6">
          Your eSewa payment was cancelled or didn&apos;t go through. No funds were deducted.
        </p>
        <Link
          href="/dashboard/wallet"
          className="inline-block px-5 py-2.5 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors"
        >
          Back to Wallet
        </Link>
      </div>
    </div>
  );
}
