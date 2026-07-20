import { User, Zap } from "lucide-react";

export interface ActiveJobViewModel {
  taskName: string;
  buyerUsername?: string;
  progress: number;
  cpuUtilPercent: number;
  ramUsedGB: number;
  ramTotalGB: number;
  gpuLabel: string;
  gpuUtilPercent: number;
  consoleLines: { text: string; level: "info" | "warn" }[];
}

interface ActiveJobCardProps {
  job?: ActiveJobViewModel;
}

export default function ActiveJobCard({ job }: ActiveJobCardProps) {
  if (!job) {
    return (
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6 flex flex-col items-center justify-center text-center py-16">
        <div className="w-10 h-10 rounded-full bg-[#2a2b36] flex items-center justify-center text-gray-500 mb-4">
          <Zap size={18} />
        </div>
        <p className="text-white font-bold mb-1">No active jobs right now</p>
        <p className="text-gray-500 text-sm">Your devices will show live job activity here once someone books one.</p>
      </div>
    );
  }

  const circumference = 175; // matches r=28 circle used below
  const strokeDashoffset = circumference * (1 - job.progress / 100);

  return (
    <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-6">
          {/* Circular Progress (CSS based) */}
          <div className="relative w-16 h-16 rounded-full border-4 border-[#2a2b36] flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white opacity-20" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
            </svg>
            <span className="text-sm font-bold text-white relative z-10">{job.progress}%</span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-white">{job.taskName}</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#a39dfa] border border-[#a39dfa]/40 rounded-full">
                RUNNING
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <User size={14} />
              <span>{job.buyerUsername || "Unknown buyer"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 text-sm font-mono text-[#d4a853] mb-6">
        <span>CPU: {job.cpuUtilPercent}%</span>
        <span>RAM: {job.ramUsedGB}GB/{job.ramTotalGB}GB</span>
        <span>GPU: {job.gpuLabel} ({job.gpuUtilPercent}%)</span>
      </div>

      <div className="bg-[#101115] border border-[#1f2029] rounded-lg p-4 font-mono text-xs leading-relaxed text-gray-400 mb-6">
        {job.consoleLines.map((line, i) => (
          <p key={i} className={i === job.consoleLines.length - 1 ? "opacity-50" : undefined}>
            <span className="text-gray-500">{"> "}</span>
            {line.level === "warn" ? (
              <span className="text-orange-400">[WARN] {line.text}</span>
            ) : (
              <>[INFO] {line.text}</>
            )}
          </p>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="px-5 py-2 text-sm text-gray-300 border border-[#2a2b36] hover:bg-[#1a1b25] rounded-lg transition-colors">
          View Console
        </button>
      </div>
    </div>
  );
}
