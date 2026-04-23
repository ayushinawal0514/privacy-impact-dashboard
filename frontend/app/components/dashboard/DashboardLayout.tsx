"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: "overview" | "data-flow" | "privacy-risks" | "compliance" | "audit-logs";
}

export default function DashboardLayout({
  children,
  activeSection = "overview",
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sections = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "data-flow", label: "Data Flow Analysis", icon: "🔄" },
    { id: "privacy-risks", label: "Privacy Risks", icon: "⚠️" },
    { id: "compliance", label: "Compliance Status", icon: "✓" },
    { id: "audit-logs", label: "Audit Logs", icon: "📋" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-bold">PIA Framework</h1>
          <p className="text-xs text-slate-400 mt-1">Privacy Impact Assessment</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeSection === section.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            <span className="mr-2">🚪</span> Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900 transition"
            >
              {sidebarOpen ? "☰" : "☰"}
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              Privacy Impact Assessment Dashboard
            </h2>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {session?.user?.role || "Auditor"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
