"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiMethods, setAuthToken } from "@/lib/api-client";

interface LayoutProps {
  activeSection: string;
  children: React.ReactNode;
  userRole?: string;
}

export function EnhancedDashboardLayout({
  activeSection,
  children,
  userRole,
}: LayoutProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (!token) return;

    setAuthToken(token);

    const fetchAlerts = async () => {
      try {
        const res = await apiMethods.getDashboardSummary();
        const risks = res.data?.data?.risks || {};
        const count =
          (risks.critical || 0) +
          (risks.high || 0);

        setNotifications(count);
      } catch (error) {
        console.error("Error fetching alert summary:", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const normalizedRole = userRole || session?.user?.role || "user";

  const navigationItems = [
    { name: "Overview", href: "/dashboard", key: "overview", icon: "📊", roles: ["admin", "user"] },
    { name: "Risks", href: "/risks", key: "risks", icon: "⚠️", roles: ["admin", "user"] },
    { name: "Compliance", href: "/compliance", key: "compliance", icon: "✓", roles: ["admin", "user"] },
    { name: "Access Logs", href: "/access-logs", key: "access logs", icon: "📋", roles: ["admin", "user"] },
    { name: "Data Flows", href: "/data-flows", key: "data flows", icon: "🔄", roles: ["admin"] },
    { name: "Audit Reports", href: "/audit-reports", key: "audit reports", icon: "📄", roles: ["admin"] },
    { name: "Alerts", href: "/alerts", key: "alerts", icon: "🔔", roles: ["admin"] },
  ];

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(normalizedRole)
  );

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 64 }}
        className="bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg border-r border-slate-700 flex flex-col"
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
                🛡️
              </div>
              <div>
                <span className="font-bold text-sm">Privacy Guard</span>
                <p className="text-xs text-slate-400">Healthcare</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive =
              activeSection.toLowerCase() === item.key ||
              (activeSection.toLowerCase() === "overview" && item.key === "overview");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && (
                  <span className="text-sm font-semibold truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <span className="text-xl flex-shrink-0">👤</span>
            {isSidebarOpen && (
              <div className="text-sm min-w-0">
                <p className="font-semibold truncate text-white">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {session?.user?.email}
                </p>
                <p className="text-[11px] text-cyan-300 mt-1 capitalize">
                  {normalizedRole}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
            {navigationItems.find((i) => activeSection.toLowerCase() === i.key)?.name ||
              activeSection}
          </h1>

          <div className="flex items-center space-x-6">
            <Link
              href="/alerts"
              className="relative p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
            >
              <span className="text-xl">🔔</span>
              {notifications > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold shadow-lg">
                  {notifications}
                </span>
              )}
            </Link>

            <button
              className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
              title="Help"
            >
              <span className="text-xl">❓</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}