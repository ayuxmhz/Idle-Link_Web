"use client";

export type Range = "day" | "week" | "month";

const OPTIONS: { value: Range; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

interface RangeToggleProps {
  value: Range;
  onChange: (value: Range) => void;
}

export default function RangeToggle({ value, onChange }: RangeToggleProps) {
  return (
    <div className="flex bg-[#1a1b26] border border-[#2a2b3d] rounded-full p-1 w-fit">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
            value === opt.value ? "bg-[#252644] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
