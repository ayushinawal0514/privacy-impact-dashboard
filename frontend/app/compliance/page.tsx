"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import {
  ComplianceScoreChart,
  RiskDistributionChart,
} from "@/app/components/dashboard/Charts";
import { apiMethods, setAuthToken } from "@/lib/api-client";

type RiskSummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
};

type ComplianceApiData = {
  complianceScore: number;
  hipaaCompliance: number;
  dpdpaCompliance: number;
  risks: RiskSummary;
  recommendations: string[];
  summary: string;
  latestUpload?: {
    fileName?: string;
    dataType?: string;
    status?: string;
    uploadedByUser?: {
      name?: string;
      email?: string;
      role?: string;
    };
  } | null;
  latestAnalysis?: {
    createdAt?: string;
  } | null;
};

type RiskItem = {
  _id?: string;
  severity: "critical" | "high" | "medium" | "low";
  riskCategory?: string;
  description?: string;
  status?: string;
};

export default function ComplianceDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<ComplianceApiData | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session || !accessToken) return;

    setAuthToken(accessToken);
    fetchComplianceData();

    const interval = setInterval(fetchComplianceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, accessToken]);

  async function fetchComplianceData() {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, risksRes] = await Promise.all([
        apiMethods.getDashboardSummary(),
        apiMethods.getRisks(),
      ]);

      const summaryPayload = summaryRes.data?.data || {};
      const risksPayload = risksRes.data?.data || [];

      const normalizedSummary: ComplianceApiData = {
        complianceScore: summaryPayload.latestAnalysis?.complianceScore ?? 0,
        hipaaCompliance: summaryPayload.latestAnalysis?.hipaaCompliance ?? 0,
        dpdpaCompliance: summaryPayload.latestAnalysis?.dpdpaCompliance ?? 0,
        risks: summaryPayload.risks || {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
        recommendations: summaryPayload.latestAnalysis?.recommendations || [],
        summary: summaryPayload.latestAnalysis?.summary || "No compliance analysis available yet.",
        latestUpload: summaryPayload.latestUpload || null,
        latestAnalysis: summaryPayload.latestAnalysis || null,
      };

      setComplianceData(normalizedSummary);
      setRisks(risksPayload);
    } catch (err: any) {
      console.error("Error fetching compliance data:", err);
      setError(err?.response?.data?.message || "Failed to load compliance data.");
    } finally {
      setLoading(false);
    }
  }

  const requirementRows = useMemo(() => {
    const hipaa = complianceData?.hipaaCompliance ?? 0;
    const dpdp = complianceData?.dpdpaCompliance ?? 0;

    return [
      {
        name: "Data Encryption",
        percentage: hipaa,
        status: hipaa >= 75 ? "compliant" : "pending",
      },
      {
        name: "Access Controls",
        percentage: hipaa,
        status: hipaa >= 60 ? "compliant" : "pending",
      },
      {
        name: "Audit Logging",
        percentage: hipaa,
        status: hipaa >= 60 ? "compliant" : "pending",
      },
      {
        name: "Consent Management",
        percentage: dpdp,
        status: dpdp >= 75 ? "compliant" : "pending",
      },
      {
        name: "Data Retention",
        percentage: dpdp,
        status: dpdp >= 60 ? "compliant" : "pending",
      },
    ];
  }, [complianceData]);

  const activeViolations = useMemo(() => {
    if (!complianceData) return 0;
    return (
      (complianceData.risks?.critical || 0) +
      (complianceData.risks?.high || 0) +
      (complianceData.risks?.medium || 0)
    );
  }, [complianceData]);

  const systemsAudited = useMemo(() => {
    if (!complianceData?.latestUpload?.fileName) return 0;
    return 1;
  }, [complianceData]);

  const lastAuditLabel = useMemo(() => {
    const createdAt = complianceData?.latestAnalysis?.createdAt;
    if (!createdAt) return "N/A";

    const then = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - then);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    return `${diffDays} day(s) ago`;
  }, [complianceData]);

  const nextReviewLabel = useMemo(() => {
    return activeViolations > 10 ? "Immediate review suggested" : "In 7 days";
  }, [activeViolations]);

  if (status === "loading" || loading) {
    return (
      <EnhancedDashboardLayout activeSection="compliance" userRole={session?.user?.role}>
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
      <div className="flex items-center justify-between mb-4">
  <button
    onClick={() => router.push("/dashboard")}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
  >
    ← Back to Dashboard
  </button>
</div>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Dashboard</h1>
          <p className="text-slate-600">
            Monitor HIPAA and DPDPA compliance status across your healthcare systems
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Compliance Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">HIPAA Compliance</h3>
              <span className="text-2xl">🏥</span>
            </div>
            <ComplianceScoreChart score={complianceData?.hipaaCompliance || 0} />
          </div>
          

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">DPDPA Compliance</h3>
              <span className="text-2xl">📋</span>
            </div>
            <ComplianceScoreChart score={complianceData?.dpdpaCompliance || 0} />
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Overall Compliance</h3>
              <span className="text-2xl">✓</span>
            </div>
            <ComplianceScoreChart score={complianceData?.complianceScore || 0} />
          </div>
        </div>

        {/* Compliance Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Compliance Requirements</h3>
            <div className="space-y-3">
              {requirementRows.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === "compliant" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {item.percentage}%
                    </span>
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
                <span className="text-2xl font-bold text-red-600">{activeViolations}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Systems Audited</span>
                <span className="text-2xl font-bold text-blue-600">{systemsAudited}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Last Audit</span>
                <span className="text-sm font-medium text-slate-600">{lastAuditLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Next Review</span>
                <span className="text-sm font-medium text-slate-600">{nextReviewLabel}</span>
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
            <h3 className="font-semibold text-slate-900 mb-4">Compliance Trends (Current)</h3>
            <div className="text-center text-slate-600 py-12">
              <p>
                Current overall score:{" "}
                <span className="font-semibold text-slate-900">
                  {complianceData?.complianceScore || 0}%
                </span>
              </p>
              <p className="text-sm mt-2">{complianceData?.summary || "No trend data available."}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">📣 Recommendations</h3>
          {complianceData?.recommendations?.length ? (
            <ul className="space-y-2 list-disc list-inside text-blue-800">
              {complianceData.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-800">No recommendations available.</p>
          )}
        </div>
      </div>
    </EnhancedDashboardLayout>
  );
}