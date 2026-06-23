import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Archive, BarChart2, Wallet, Settings, HelpCircle, FileText } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard", active: true },
    { name: "Marketplace", icon: <ShoppingCart size={18} />, href: "#", active: false },
    { name: "Inventory", icon: <Archive size={18} />, href: "#", active: false },
    { name: "Analytics", icon: <BarChart2 size={18} />, href: "#", active: false },
    { name: "Wallet", icon: <Wallet size={18} />, href: "#", active: false },
    { name: "Settings", icon: <Settings size={18} />, href: "#", active: false },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#11121a] border-r border-[#262736] flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#c9c5f8] tracking-tight leading-none mb-1">IdleLink</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Compute Marketplace</p>
      </div>

      {/* Main Menu */}
      <div className="px-4 py-2 flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              item.active 
                ? "bg-[#252538] text-white" 
                : "text-gray-400 hover:bg-[#1a1b25] hover:text-white"
            }`}
          >
            <span className={item.active ? "text-[#a39dfa]" : "text-gray-500"}>
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}

        <div className="mt-8 px-2">
          <button className="w-full py-3 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] text-sm font-bold rounded-lg transition-colors">
            Deploy Instance
          </button>
        </div>
      </div>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-[#262736]">
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <HelpCircle size={18} className="text-gray-500" />
          Support
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <FileText size={18} className="text-gray-500" />
          Documentation
        </Link>
      </div>
    </aside>
  );
}
