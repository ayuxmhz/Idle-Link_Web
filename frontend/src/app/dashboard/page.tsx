"use client";

import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import ActiveJobCard from "@/components/dashboard/ActiveJobCard";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import EarningsChart from "@/components/dashboard/EarningsChart";
import TransactionList from "@/components/dashboard/TransactionList";
import { BarChart2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#111218]">
      <Header />
      
      <main className="flex-1 p-8">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Today's Earnings"
            value="NPR 3,240"
            badge="+18%"
          />
          <StatCard 
            title="This Week"
            value="NPR 18,900"
            icon={<BarChart2 size={28} className="text-[#cbbefa]" />}
          />
          <StatCard 
            title="Active Jobs"
            value="3"
            icon={<div className="w-4 h-4 rounded-full bg-[#cbbefa] shadow-[0_0_10px_#cbbefa]" />}
          />
          <StatCard 
            title="Uptime (30d)"
            value="99.9%"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Left Column (Active Jobs & Recommended) */}
          <div className="flex-[2] flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Active Jobs</h2>
              <ActiveJobCard />
            </div>
            <RecommendedActions />
          </div>

          {/* Right Column (Earnings & Transactions) */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-[260px]">
              <EarningsChart />
            </div>
            <div className="flex-1 min-h-[260px]">
              <TransactionList />
            </div>
          </div>
          
        </div>
        
      </main>
    </div>
  );
}
