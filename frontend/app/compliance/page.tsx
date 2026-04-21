"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { ComplianceScoreChart, RiskDistributionChart, AnomalyTimelineChart } from "@/app/components/dashboard/Charts";

export default function ComplianceDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchComplianceData();
      // Refresh every 5 minutes
      const interval = setInterval(fetchComplianceData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function fetchComplianceData() {
    try {
      setLoading(true);
      const [metricsRes, risksRes, complianceRes] = await Promise.all([
        fetch("/api/dashboard/metrics"),
        fetch("/api/risks?severity=high&limit=20"),
        fetch("/api/compliance"),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (risksRes.ok) {
        const risksData = await risksRes.json();
        setRisks(risksData);
      }

      if (complianceRes.ok) {
        const complianceDataResponse = await complianceRes.json();
        setComplianceData(complianceDataResponse);
      }
    } catch (error) {
      console.error("Error fetching compliance data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <EnhancedDashboardLayout activeSection="compliance">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </EnhancedDashboardLayout>
    );
  }

  return (
    <EnhancedDashboardLayout activeSection="compliance" userRole={session?.user?.role}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Dashboard</h1>
          <p className="text-slate-600">
            Monitor HIPAA and DPDPA compliance status across your healthcare systems
          </p>
        </div>

        {/* Compliance Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* HIPAA Score */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">HIPAA Compliance</h3>
              <span className="text-2xl">🏥</span>
            </div>
            <ComplianceScoreChart score={complianceData?.hipaaScore || 88} />
          </div>

          {/* DPDPA Score */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">DPDPA Compliance</h3>
              <span className="text-2xl">📋</span>
            </div>
            <ComplianceScoreChart score={complianceData?.dpdpaScore || 82} />
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Overall Compliance</h3>
              <span className="text-2xl">✓</span>
            </div>
            <ComplianceScoreChart score={metrics?.complianceScore || 85} />
          </div>
        </div>

        {/* Compliance Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Compliance Requirements</h3>
            <div className="space-y-3">
              {[
                { name: "Data Encryption", status: "compliant", percentage: 100 },
                { name: "Access Controls", status: "compliant", percentage: 95 },
                { name: "Audit Logging", status: "compliant", percentage: 90 },
                { name: "Consent Management", status: "pending", percentage: 70 },
                { name: "Data Retention", status: "pending", percentage: 65 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === "compliant"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Active Violations</span>
                <span className="text-2xl font-bold text-red-600">
                  {risks.filter((r) => r.severity === "critical").length}
                </span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Systems Audited</span>
                <span className="text-2xl font-bold text-blue-600">
                  {metrics?.systemsMonitored || 7}
                </span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Last Audit</span>
                <span className="text-sm font-medium text-slate-600">3 days ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Next Review</span>
                <span className="text-sm font-medium text-slate-600">In 4 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Risk Distribution</h3>
            <RiskDistributionChart data={risks} />
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Compliance Trends (7D)</h3>
            <div className="text-center text-slate-600 py-12">
              <p>↑ Compliance score improved by 3% this week</p>
              <p className="text-sm mt-2">Trend: Positive</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">📣 Recommendations</h3>
          <ul className="space-y-2 list-disc list-inside text-blue-800">
            <li>Address 2 pending consent management issues by next week</li>
            <li>Schedule quarterly compliance review for Q3</li>
            <li>Implement automated data retention policies</li>
            <li>Conduct security awareness training for 15 new staff members</li>
          </ul>
        </div>
      </div>
    </EnhancedDashboardLayout>
  );
}
