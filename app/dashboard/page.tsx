"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  DashboardLayout,
  MetricCard,
  RiskTable,
  ComplianceStatus,
  DataFlowVisualization,
} from "@/app/components/dashboard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <DashboardLayout activeSection="overview">
      {/* Overview Section */}
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Overview</h1>
          <p className="text-slate-600">
            Real-time privacy impact assessment and healthcare data compliance monitoring
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Patient Records"
            value="24,563"
            subtitle="Processed this month"
            trend="up"
            icon="📊"
            bgColor="bg-blue-50"
          />
          <MetricCard
            title="Privacy Risks Detected"
            value="12"
            subtitle="5 critical, 7 high"
            trend="down"
            icon="⚠️"
            bgColor="bg-red-50"
          />
          <MetricCard
            title="Compliance Score"
            value="88%"
            subtitle="Above regulatory threshold"
            trend="up"
            icon="✓"
            bgColor="bg-green-50"
          />
          <MetricCard
            title="Active Data Flows"
            value="7"
            subtitle="2 pending approval"
            trend="neutral"
            icon="🔄"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Risk Table */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-900">
                  Detected Privacy Risks
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Automated detection of potential vulnerabilities in healthcare data handling
                </p>
              </div>
              <div className="p-6">
                <RiskTable />
              </div>
            </div>
          </div>

          {/* Right Column - Compliance Status */}
          <div>
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="px-6 py-4 border-b bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-900">
                  Compliance Status
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Regulatory compliance overview
                </p>
              </div>
              <div className="p-6">
                <ComplianceStatus />
              </div>
            </div>
          </div>
        </div>

        {/* Data Flow Visualization */}
        <div>
          <DataFlowVisualization />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="rounded-lg border bg-white p-6 text-left hover:shadow-md hover:border-blue-300 transition">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-slate-900 mb-1">Generate Report</h3>
            <p className="text-xs text-slate-600">
              Create a comprehensive privacy impact assessment report
            </p>
          </button>
          <button className="rounded-lg border bg-white p-6 text-left hover:shadow-md hover:border-blue-300 transition">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-slate-900 mb-1">Detailed Analysis</h3>
            <p className="text-xs text-slate-600">
              View in-depth risk analysis and remediation steps
            </p>
          </button>
          <button className="rounded-lg border bg-white p-6 text-left hover:shadow-md hover:border-blue-300 transition">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold text-slate-900 mb-1">Audit Settings</h3>
            <p className="text-xs text-slate-600">
              Configure assessment parameters and schedules
            </p>
          </button>
        </div>

        {/* Footer Info */}
        <div className="rounded-lg border border-slate-200 bg-blue-50 p-6">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-blue-900">ℹ️ About this dashboard:</span> This automated PIA framework provides continuous monitoring of healthcare data systems for privacy compliance. All risks are detected using pattern analysis and regulatory standards compliance checks. Detected risks should be reviewed and mitigated according to your organizational security policies.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// dashboard page