import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  badge?: string;
  icon?: ReactNode;
}

export default function StatCard({ title, value, badge, icon }: StatCardProps) {
  return (
    <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6 flex flex-col justify-between">
      <h3 className="text-gray-400 text-xs font-medium mb-3">{title}</h3>
      <div className="flex items-end justify-between mt-auto">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-orange-200 bg-orange-500/20 border border-orange-500/30 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {icon && <div className="text-[#a39dfa]">{icon}</div>}
      </div>
    </div>
  );
}
