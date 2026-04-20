"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface LayoutProps {
  activeSection: string;
  children: React.ReactNode;
  userRole?: string;
}

export function EnhancedDashboardLayout({ activeSection, children, userRole }: LayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Fetch unacknowledged alerts
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts?acknowledged=false");
        const alerts = await res.json();
        setNotifications(alerts.length);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();

    // Poll every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { name: "Overview", href: "/dashboard", icon: "📊", roles: ["admin", "compliance_officer", "viewer"] },
    { name: "Risks", href: "/dashboard/risks", icon: "⚠️", roles: ["admin", "compliance_officer", "auditor"] },
    { name: "Compliance", href: "/dashboard/compliance", icon: "✓", roles: ["admin", "compliance_officer"] },
    { name: "Access Logs", href: "/dashboard/access-logs", icon: "📋", roles: ["admin", "auditor"] },
    { name: "Data Flows", href: "/dashboard/data-flows", icon: "🔄", roles: ["admin", "data_owner"] },
    { name: "Audit Reports", href: "/dashboard/audit-reports", icon: "📄", roles: ["admin", "auditor"] },
    { name: "Alerts", href: "/dashboard/alerts", icon: "🔔", roles: ["admin", "compliance_officer"] },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️", roles: ["admin"] },
  ];

  const visibleItems = navigationItems.filter(
    (item) => !userRole || item.roles.includes(userRole),
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        className="bg-slate-900 text-white shadow-lg border-r border-slate-800 flex flex-col"
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
                🛡️
              </div>
              <span className="font-bold text-sm">Privacy Guard</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {visibleItems.map((item) => {
            const isActive = activeSection === item.name.toLowerCase() || 
                           (activeSection === "overview" && item.name === "Overview");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer">
            <span className="text-xl">👤</span>
            {isSidebarOpen && (
              <div className="text-sm min-w-0">
                <p className="font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            {navigationItems.find((i) => activeSection === i.name.toLowerCase())?.name ||
              activeSection}
          </h1>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              href="/dashboard/alerts"
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="text-xl">🔔</span>
              {notifications > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {notifications}
                </span>
              )}
            </Link>

            {/* Help */}
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <span className="text-xl">❓</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
