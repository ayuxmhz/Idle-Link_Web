"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyEsewaPayment } from "@/lib/api/esewa";
import { useUser } from "@/app/context/UserContext";

interface DecodedEsewaData {
  transaction_uuid?: string;
  total_amount?: string | number;
}

export default function EsewaSuccessContent() {
  const searchParams = useSearchParams();
  const { fetchUser } = useUser();

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const encoded = searchParams.get("data");
      if (!encoded) {
        setStatus("error");
        setError("Missing payment data from eSewa.");
        return;
      }

      try {
        const decoded = JSON.parse(atob(encoded)) as DecodedEsewaData;
        if (!decoded.transaction_uuid) {
          throw new Error("Missing transaction reference");
        }
        const res = await verifyEsewaPayment(decoded.transaction_uuid);
        setAmount(res.data.amount);
        setStatus("success");
        await fetchUser();
      } catch (err) {
        setStatus("error");
        setError((err as { message?: string })?.message || "Failed to verify payment");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#111218] flex items-center justify-center p-8">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <Loader2 size={40} className="mx-auto mb-4 text-[#cbbefa] animate-spin" />
            <h1 className="text-xl font-bold text-white mb-2">Verifying your payment…</h1>
            <p className="text-sm text-gray-400">Hang tight, confirming with eSewa.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={40} className="mx-auto mb-4 text-green-400" />
            <h1 className="text-xl font-bold text-white mb-2">Payment successful</h1>
            <p className="text-sm text-gray-400 mb-6">
              NPR {amount?.toLocaleString()} has been added to your wallet.
            </p>
            <Link
              href="/dashboard/wallet"
              className="inline-block px-5 py-2.5 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors"
            >
              Back to Wallet
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={40} className="mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-bold text-white mb-2">Verification failed</h1>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <Link
              href="/dashboard/wallet"
              className="inline-block px-5 py-2.5 bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Back to Wallet
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
