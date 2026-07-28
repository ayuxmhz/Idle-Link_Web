"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="min-h-screen bg-[#111218] text-white flex">
      <Sidebar />
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}
      <div className="flex-1 w-full lg:ml-[260px] min-w-0">
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
}
