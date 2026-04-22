"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { setAuthToken } from "@/lib/api-client";

interface UploadItem {
  _id: string;
  fileName: string;
  dataType: string;
  recordCount: number;
  status: string;
  uploadedAt: string;
  analysisId?: string;
}

interface AnalysisResult {
  _id: string;
  complianceScore: number;
  hipaaCompliance: number;
  dpdpaCompliance: number;
  ruleResults: Array<{
    ruleId: string;
    ruleName: string;
    severity: "critical" | "high" | "medium" | "low";
    passed: boolean | null;
    details: string;
    riskCount: number;
  }>;
  anomalies: Array<{
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
  }>;
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  summary: string;
  createdAt: string;
}

interface DashboardData {
  risks: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  complianceScore: number;
  hipaaCompliance: number;
  dpdpaCompliance: number;
  pendingAlerts: number;
  recommendations: string[];
  summary: string;
  latestUpload: UploadItem | null;
  failedRules: AnalysisResult["ruleResults"];
  anomalies: AnalysisResult["anomalies"];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken =
    (session as any)?.accessToken ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!accessToken) {
          setError("No authentication token found. Please sign in again.");
          setLoading(false);
          return;
        }

        setAuthToken(accessToken);

        const uploadsRes = await fetch(`${API_BASE}/upload/uploads`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const uploadsJson = await uploadsRes.json();

        if (!uploadsRes.ok || !uploadsJson.success) {
          throw new Error(uploadsJson.message || "Failed to fetch uploads");
        }

        const uploads: UploadItem[] = uploadsJson.data || [];
        const latestCompleted = uploads.find((u) => u.status === "completed" && u.analysisId);

        if (!latestCompleted?.analysisId) {
          setData({
            risks: { critical: 0, high: 0, medium: 0, low: 0 },
            complianceScore: 0,
            hipaaCompliance: 0,
            dpdpaCompliance: 0,
            pendingAlerts: 0,
            recommendations: [],
            summary: "No completed analysis found yet. Upload and analyze data to see your dashboard insights.",
            latestUpload: null,
            failedRules: [],
            anomalies: [],
          });
          setLoading(false);
          return;
        }

        const resultRes = await fetch(
          `${API_BASE}/upload/results/${latestCompleted.analysisId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const resultJson = await resultRes.json();

        if (!resultRes.ok || !resultJson.success) {
          throw new Error(resultJson.message || "Failed to fetch analysis result");
        }

        const analysis: AnalysisResult = resultJson.data;
        const failedRules = (analysis.ruleResults || []).filter((r) => r.passed === false);

        setData({
          risks: analysis.riskSummary || { critical: 0, high: 0, medium: 0, low: 0 },
          complianceScore: analysis.complianceScore || 0,
          hipaaCompliance: analysis.hipaaCompliance || 0,
          dpdpaCompliance: analysis.dpdpaCompliance || 0,
          pendingAlerts: (analysis.riskSummary?.critical || 0) + (analysis.riskSummary?.high || 0),
          recommendations: analysis.recommendations || [],
          summary: analysis.summary || "No summary available.",
          latestUpload: latestCompleted,
          failedRules,
          anomalies: analysis.anomalies || [],
        });
      } catch (err: any) {
        console.error("Failed to fetch user dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role !== "admin") {
      fetchDashboardData();
    }
  }, [status, session, accessToken]);

  const complianceStatus = useMemo(() => {
    if (!data) return "Unknown";
    if (data.complianceScore >= 80) return "✓ Strong";
    if (data.complianceScore >= 60) return "⚠ Moderate";
    return "✗ Weak";
  }, [data]);

  const riskLevel = useMemo(() => {
    if (!data) return "Low";
    if (data.risks.critical > 0) return "Critical";
    if (data.risks.high > 0) return "High";
    return "Low";
  }, [data]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role === "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      <header className="bg-black/30 backdrop-blur border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">User Dashboard</h1>
              <p className="text-sm text-gray-400">Your privacy compliance and risk overview</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                <p className="text-[11px] text-cyan-300 mt-1">Role: User</p>
              </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-red-500/15 border border-red-400/30 rounded-lg p-4 text-red-100">
            {error}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Your Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Compliance Score"
              value={`${data?.complianceScore || 0}%`}
              badge={complianceStatus}
              tone="emerald"
              progress={data?.complianceScore || 0}
            />
            <MetricCard
              title="Your Active Risks"
              value={`${(data?.risks.critical || 0) + (data?.risks.high || 0) + (data?.risks.medium || 0)}`}
              badge={riskLevel}
              tone="red"
              subtitle={`Critical: ${data?.risks.critical || 0} • High: ${data?.risks.high || 0}`}
            />
            <MetricCard
              title="HIPAA Compliance"
              value={`${data?.hipaaCompliance || 0}%`}
              tone="blue"
              progress={data?.hipaaCompliance || 0}
            />
            <MetricCard
              title="DPDP Compliance"
              value={`${data?.dpdpaCompliance || 0}%`}
              tone="indigo"
              progress={data?.dpdpaCompliance || 0}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionLink href="/compliance" label="View Compliance" tone="cyan" />
              <ActionLink href="/upload" label="Upload Data" tone="purple" />
              <ActionLink href="/compliance" label="Generate Report" tone="pink" />
              <ActionLink href="/compliance" label="View Risks" tone="green" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Latest Analysis</h3>
            <InfoBox label="File" value={data?.latestUpload?.fileName || "N/A"} />
            <InfoBox label="Type" value={data?.latestUpload?.dataType || "N/A"} />
            <InfoBox label="Status" value={data?.latestUpload?.status || "N/A"} valueClassName="text-green-400 font-semibold" />
            <InfoBox label="Pending Alerts" value={`${data?.pendingAlerts || 0}`} valueClassName="text-orange-300 font-semibold" />
          </div>
        </section>

        <section className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Risk Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 font-semibold text-white">Severity</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Count</th>
                  <th className="text-right py-3 px-4 font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                <RiskRow label="Critical" color="bg-red-500" textColor="text-red-400" value={data?.risks.critical || 0} badge="Urgent" />
                <RiskRow label="High" color="bg-orange-500" textColor="text-orange-400" value={data?.risks.high || 0} badge="Important" />
                <RiskRow label="Medium" color="bg-yellow-500" textColor="text-yellow-400" value={data?.risks.medium || 0} badge="Monitor" />
                <RiskRow label="Low" color="bg-green-500" textColor="text-green-400" value={data?.risks.low || 0} badge="Info" />
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Recommendations">
            {data?.recommendations?.length ? (
              <ul className="space-y-3">
                {data.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-200 text-sm leading-relaxed bg-white/5 border border-white/10 rounded-lg p-3">
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300">No recommendations available.</p>
            )}
          </Panel>

          <Panel title="Analysis Summary">
            <p className="text-gray-200 leading-relaxed">{data?.summary || "No summary available."}</p>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">Failed Rules</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {data?.failedRules?.length ? (
                  data.failedRules.map((rule) => (
                    <div key={rule.ruleId} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex justify-between gap-3">
                        <p className="text-white font-medium text-sm">{rule.ruleName}</p>
                        <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-200 capitalize whitespace-nowrap">
                          {rule.severity}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs mt-2">{rule.details}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300 text-sm">No failed rules found.</p>
                )}
              </div>
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  badge,
  tone,
  progress,
  subtitle,
}: {
  title: string;
  value: string;
  badge?: string;
  tone: "emerald" | "red" | "blue" | "indigo";
  progress?: number;
  subtitle?: string;
}) {
  const toneMap = {
    emerald: {
      box: "from-emerald-500/20 to-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-400",
      bg: "bg-emerald-500",
      badge: "bg-emerald-500/30 text-emerald-200",
    },
    red: {
      box: "from-red-500/20 to-red-500/10 border-red-500/30",
      text: "text-red-400",
      bg: "bg-red-500",
      badge: "bg-red-500/30 text-red-200",
    },
    blue: {
      box: "from-blue-500/20 to-blue-500/10 border-blue-500/30",
      text: "text-blue-400",
      bg: "bg-blue-500",
      badge: "bg-blue-500/30 text-blue-200",
    },
    indigo: {
      box: "from-indigo-500/20 to-indigo-500/10 border-indigo-500/30",
      text: "text-indigo-400",
      bg: "bg-indigo-500",
      badge: "bg-indigo-500/30 text-indigo-200",
    },
  };

  const styles = toneMap[tone];

  return (
    <div className={`min-h-[140px] bg-gradient-to-br ${styles.box} backdrop-blur border rounded-lg p-6 shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-gray-300 font-medium">{title}</p>
        {badge ? <span className={`text-xs font-bold px-2 py-1 rounded ${styles.badge}`}>{badge}</span> : null}
      </div>
      <p className={`text-4xl font-bold mb-2 ${styles.text}`}>{value}</p>
      {typeof progress === "number" ? (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div className={`${styles.bg} h-full transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {subtitle ? <div className="text-xs text-gray-400 mt-2">{subtitle}</div> : null}
    </div>
  );
}

function ActionLink({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "cyan" | "purple" | "pink" | "green";
}) {
  const toneMap = {
    cyan: "from-cyan-500/20 to-cyan-500/10 border-cyan-500/30 text-cyan-200 hover:from-cyan-500/30 hover:to-cyan-500/20",
    purple: "from-purple-500/20 to-purple-500/10 border-purple-500/30 text-purple-200 hover:from-purple-500/30 hover:to-purple-500/20",
    pink: "from-pink-500/20 to-pink-500/10 border-pink-500/30 text-pink-200 hover:from-pink-500/30 hover:to-pink-500/20",
    green: "from-green-500/20 to-green-500/10 border-green-500/30 text-green-200 hover:from-green-500/30 hover:to-green-500/20",
  };

  return (
    <Link
      href={href}
      className={`p-4 bg-gradient-to-r border rounded-lg transition font-medium flex items-center justify-between group ${toneMap[tone]}`}
    >
      <span>{label}</span>
      <span className="group-hover:translate-x-1 transition">→</span>
    </Link>
  );
}

function InfoBox({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="p-3 bg-white/10 rounded-lg border border-white/20 mb-3">
      <p className="text-gray-400 mb-1 text-sm">{label}</p>
      <p className={`break-all ${valueClassName}`}>{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function RiskRow({
  label,
  color,
  textColor,
  value,
  badge,
}: {
  label: string;
  color: string;
  textColor: string;
  value: number;
  badge: string;
}) {
  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition">
      <td className="py-3 px-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`}></span>
        {label}
      </td>
      <td className={`py-3 px-4 text-center font-bold ${textColor}`}>{value}</td>
      <td className="py-3 px-4 text-right">
        <span className="text-xs px-2 py-1 bg-white/10 text-gray-200 rounded-full">{badge}</span>
      </td>
    </tr>
  );
}