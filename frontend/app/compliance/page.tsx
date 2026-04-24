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
type RequirementScore = {
  passed: number;
  failed: number;
  score: number;
};
type ComplianceApiData = {
  datasetId: string | null;
  datasetName: string | null;
  hipaaCompliance: number;
  dpdpaCompliance: number;
  overallScore: number;
  passedRules: number;
  failedRules: number;
  totalRisks: number;
  requirements: {
    encryption: RequirementScore;
    consent: RequirementScore;
    accessControl: RequirementScore;
    auditLogging: RequirementScore;
    retention: RequirementScore;
  };
  lastUpdated: string | null;
};
type RiskItem = {
  _id?: string;
  severity: "critical" | "high" | "medium" | "low";
  category?: string;
  riskCategory?: string;
  description?: string;
  recommendation?: string;
  ruleId?: string;
  status?: string;
  datasetName?: string;
  recordId?: string;
};
type RisksApiResponse = {
  success: boolean;
  role: string;
  count: number;
  summary: RiskSummary;
  datasets: Array<{
    datasetId?: string | null;
    datasetName?: string | null;
    count: number;
  }>;
  data: RiskItem[];
};
export default function ComplianceDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<ComplianceApiData | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [riskSummary, setRiskSummary] = useState<RiskSummary>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [datasets, setDatasets] = useState<Array<{ datasetId?: string | null; datasetName?: string | null; count: number }>>([]);
  const [selectedDataset, setSelectedDataset] = useState("latest");
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
    fetchComplianceData("latest");
    const interval = setInterval(() => fetchComplianceData(selectedDataset), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, accessToken]);
  async function fetchComplianceData(datasetName = selectedDataset) {
    try {
      setLoading(true);
      setError(null);
      const complianceRes =
        datasetName && datasetName !== "latest"
          ? await apiMethods.getComplianceStatus(datasetName)
          : await apiMethods.getComplianceStatus();

      const risksRes = await apiMethods.getRisks();

      const compliancePayload = complianceRes.data?.data || null;
      const risksPayload: RisksApiResponse = risksRes.data;

      const allRisks = risksPayload?.data || [];
      const allDatasets = risksPayload?.datasets || [];

      const normalizedDatasetName =
        datasetName && datasetName !== "latest" ? datasetName.trim() : null;

      const filteredRisks = normalizedDatasetName
        ? allRisks.filter(
            (risk) => (risk.datasetName || "").trim() === normalizedDatasetName
          )
        : compliancePayload?.datasetName
        ? allRisks.filter(
            (risk) => (risk.datasetName || "").trim() === (compliancePayload.datasetName || "").trim()
          )
        : allRisks;

      const computedRiskSummary = filteredRisks.reduce(
        (acc, risk) => {
          acc[risk.severity] += 1;
          return acc;
        },
        { critical: 0, high: 0, medium: 0, low: 0 }
      );

      setComplianceData(compliancePayload);
      setRisks(filteredRisks);
      setRiskSummary(computedRiskSummary);
      setDatasets(allDatasets);
    } catch (err: any) {
      console.error("Error fetching compliance data:", err);
      setError(err?.response?.data?.message || "Failed to load compliance data.");
    } finally {
      setLoading(false);
    }
  }

  const requirementRows = useMemo(() => {
    if (!complianceData) return [];

    return [
      {
        name: "Data Encryption",
        percentage: complianceData.requirements?.encryption?.score ?? 0,
        status:
          (complianceData.requirements?.encryption?.score ?? 0) >= 75
            ? "compliant"
            : "pending",
      },
      {
        name: "Consent Management",
        percentage: complianceData.requirements?.consent?.score ?? 0,
        status:
          (complianceData.requirements?.consent?.score ?? 0) >= 75
            ? "compliant"
            : "pending",
      },
      {
        name: "Access Control",
        percentage: complianceData.requirements?.accessControl?.score ?? 0,
        status:
          (complianceData.requirements?.accessControl?.score ?? 0) >= 75
            ? "compliant"
            : "pending",
      },
      {
        name: "Audit Logging",
        percentage: complianceData.requirements?.auditLogging?.score ?? 0,
        status:
          (complianceData.requirements?.auditLogging?.score ?? 0) >= 75
            ? "compliant"
            : "pending",
      },
      {
        name: "Data Retention",
        percentage: complianceData.requirements?.retention?.score ?? 0,
        status:
          (complianceData.requirements?.retention?.score ?? 0) >= 75
            ? "compliant"
            : "pending",
      },
    ];
  }, [complianceData]);

  const activeViolations = useMemo(() => {
    if (!complianceData) return 0;
    return complianceData.totalRisks || 0;
  }, [complianceData]);

  const systemsAudited = useMemo(() => {
    return complianceData?.datasetName ? 1 : 0;
  }, [complianceData]);

  const lastAuditLabel = useMemo(() => {
    const createdAt = complianceData?.lastUpdated;
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
    return activeViolations > 5 ? "Immediate review suggested" : "In 7 days";
  }, [activeViolations]);

  const recommendations = useMemo(() => {
    if (!complianceData) return [];

    const recs: string[] = [];

    if ((complianceData.requirements?.encryption?.score ?? 0) < 100) {
      recs.push("Enable encryption for all stored healthcare records.");
    }
    if ((complianceData.requirements?.consent?.score ?? 0) < 100) {
      recs.push("Obtain and track explicit consent for all patient records.");
    }
    if ((complianceData.requirements?.accessControl?.score ?? 0) < 100) {
      recs.push("Restrict access to approved healthcare roles only.");
    }
    if ((complianceData.requirements?.auditLogging?.score ?? 0) < 100) {
      recs.push("Enable audit logging to maintain traceability.");
    }
    if ((complianceData.requirements?.retention?.score ?? 0) < 100) {
      recs.push("Review and reduce retention periods according to policy.");
    }

    if (recs.length === 0) {
      recs.push("Current dataset satisfies all monitored compliance checks.");
    }

    return recs;
  }, [complianceData]);

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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Dashboard</h1>
          <p className="text-slate-600">
            Monitor HIPAA and DPDPA compliance status across uploaded healthcare datasets
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-slate-600 mb-2">Dataset</label>
              <select
                value={selectedDataset}
                onChange={async (e) => {
                  const value = e.target.value;
                  setSelectedDataset(value);
                  await fetchComplianceData(value);
                }}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Latest Dataset</option>
                {datasets
                  .filter((d) => d.datasetName)
                  .map((dataset) => (
                    <option
                      key={dataset.datasetId || dataset.datasetName || Math.random()}
                      value={(dataset.datasetName || "").trim()}
                    >
                      {(dataset.datasetName || "").trim()} ({dataset.count} risk(s))
                    </option>
                  ))}
              </select>
            </div>

            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900">Current Dataset</p>
              <p>{complianceData?.datasetName?.trim() || "N/A"}</p>
            </div>

            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900">Last Updated</p>
              <p>{lastAuditLabel}</p>
            </div>
          </div>
        </div>

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
            <ComplianceScoreChart score={complianceData?.overallScore || 0} />
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
                <span className="text-sm text-slate-600">Total Risks in Dataset</span>
                <span className="text-2xl font-bold text-red-600">{activeViolations}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Systems Audited</span>
                <span className="text-2xl font-bold text-blue-600">{systemsAudited}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Passed Rules</span>
                <span className="text-2xl font-bold text-green-600">
                  {complianceData?.passedRules || 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm text-slate-600">Failed Rules</span>
                <span className="text-2xl font-bold text-orange-600">
                  {complianceData?.failedRules || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Next Review</span>
                <span className="text-sm font-medium text-slate-600">{nextReviewLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution and Current Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Risk Distribution</h3>
            <RiskDistributionChart data={risks} />
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Compliance Summary</h3>
            <div className="text-slate-600 space-y-3">
              <p>
                Current overall score:{" "}
                <span className="font-semibold text-slate-900">
                  {complianceData?.overallScore || 0}%
                </span>
              </p>
              <p>
                HIPAA compliance is{" "}
                <span className="font-semibold text-slate-900">
                  {complianceData?.hipaaCompliance || 0}%
                </span>
                , and DPDPA compliance is{" "}
                <span className="font-semibold text-slate-900">
                  {complianceData?.dpdpaCompliance || 0}%
                </span>
                .
              </p>
              <p>
                Dataset{" "}
                <span className="font-semibold text-slate-900">
                  {complianceData?.datasetName?.trim() || "N/A"}
                </span>{" "}
                produced{" "}
                <span className="font-semibold text-slate-900">
                  {complianceData?.totalRisks || 0}
                </span>{" "}
                detected risk(s).
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">📣 Recommendations</h3>
          {recommendations.length ? (
            <ul className="space-y-2 list-disc list-inside text-blue-800">
              {recommendations.map((rec, i) => (
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