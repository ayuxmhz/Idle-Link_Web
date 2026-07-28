import Link from "next/link";
import { Plus, BarChart } from "lucide-react";

export default function RecommendedActions() {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-white mb-4">Recommended Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Link
          href="/dashboard/inventory"
          className="bg-[#16171f] hover:bg-[#1a1b25] transition-colors border border-[#2a2b36] rounded-xl p-6 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#2a2b36] flex items-center justify-center text-gray-300">
            <Plus size={20} />
          </div>
          <div>
            <h4 className="text-white font-bold">Add Device</h4>
            <p className="text-gray-400 text-xs">List more compute</p>
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="bg-[#16171f] hover:bg-[#1a1b25] transition-colors border border-[#2a2b36] rounded-xl p-6 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#2a2b36] flex items-center justify-center text-gray-300">
            <BarChart size={20} />
          </div>
          <div>
            <h4 className="text-white font-bold">View Earnings</h4>
            <p className="text-gray-400 text-xs">Detailed breakdown</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
