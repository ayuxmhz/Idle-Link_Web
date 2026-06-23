import { User } from "lucide-react";

export default function ActiveJobCard() {
  return (
    <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-6">
          {/* Circular Progress (CSS based) */}
          <div className="relative w-16 h-16 rounded-full border-4 border-[#2a2b36] flex items-center justify-center">
            {/* The actual progress ring can be complex, simulating with a partial border visually using conic-gradient if needed, but a simple border + text is fine for mockup */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white opacity-20" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white" strokeDasharray="175" strokeDashoffset="21" />
            </svg>
            <span className="text-sm font-bold text-white relative z-10">88%</span>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-white">LLM Fine-tuning Task</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#a39dfa] border border-[#a39dfa]/40 rounded-full">
                RUNNING
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <User size={14} />
              <span>Buyer_X92</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 text-sm font-mono text-[#d4a853] mb-6">
        <span>CPU: 88.4%</span>
        <span>RAM: 124GB/256GB</span>
        <span>GPU: 2x A100 (92%)</span>
      </div>

      <div className="bg-[#101115] border border-[#1f2029] rounded-lg p-4 font-mono text-xs leading-relaxed text-gray-400 mb-6">
        <p><span className="text-gray-500">{"> "}</span>[INFO] Loading dataset shards 1-40...</p>
        <p><span className="text-gray-500">{"> "}</span>[INFO] Initializing distributed training...</p>
        <p><span className="text-gray-500">{"> "}</span><span className="text-orange-400">[WARN] GPU 1 temperature: 82°C. Engaging auxiliary cooling.</span></p>
        <p><span className="text-gray-500">{"> "}</span>[INFO] Epoch 1/10 started. Batch size 32.</p>
        <p className="opacity-50"><span className="text-gray-500">{"> "}</span>[INFO] Loss: 2.3411, Step: 100/5000</p>
      </div>

      <div className="flex justify-end">
        <button className="px-5 py-2 text-sm text-gray-300 border border-[#2a2b36] hover:bg-[#1a1b25] rounded-lg transition-colors">
          View Console
        </button>
      </div>
    </div>
  );
}
