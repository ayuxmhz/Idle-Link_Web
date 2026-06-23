import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#111218] text-white flex">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        {children}
      </div>
    </div>
  );
}
