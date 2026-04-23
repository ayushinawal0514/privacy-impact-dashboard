"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { setAuthToken } from "@/lib/api-client";

interface UploadUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

interface UploadItem {
  _id: string;
  fileName: string;
  dataType: string;
  recordCount: number;
  status: string;
  uploadedAt: string;
  analysisId?: string;
  uploadedByUser?: UploadUser | null;
}

interface LatestAnalysis {
  _id?: string;
  datasetId?: string;
  datasetName?: string;
  dataType?: string;
  createdAt?: string;
  summary?: {
    totalRecords: number;
    totalRisks: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance?: {
    hipaaScore: number;
    dpdpaScore: number;
    overallScore: number;
    passedRules: number;
    failedRules: number;
    requirements?: {
      encryption?: { passed: number; failed: number; score: number };
      consent?: { passed: number; failed: number; score: number };
      accessControl?: { passed: number; failed: number; score: number };
      auditLogging?: { passed: number; failed: number; score: number };
      retention?: { passed: number; failed: number; score: number };
    };
  };
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
  latestUpload: UploadItem | null;
  latestAnalysis: LatestAnalysis | null;
  totalUploads: number;
  recentUploads: UploadItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AdminDashboardPage() {
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

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/dashboard/user");
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

        const summaryRes = await fetch(`${API_BASE}/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const summaryJson = await summaryRes.json();

        if (!summaryRes.ok || !summaryJson.success) {
          throw new Error(summaryJson.message || "Failed to fetch dashboard summary");
        }

        const summary = summaryJson.data || {};
        const latestAnalysis: LatestAnalysis | null = summary.latestAnalysis || null;
        const latestCompliance = latestAnalysis?.compliance || null;

        setData({
          risks: summary.risks || { critical: 0, high: 0, medium: 0, low: 0 },
          complianceScore: latestCompliance?.overallScore || 0,
          hipaaCompliance: latestCompliance?.hipaaScore || 0,
          dpdpaCompliance: latestCompliance?.dpdpaScore || 0,
          pendingAlerts: (summary.risks?.critical || 0) + (summary.risks?.high || 0),
          latestUpload: summary.latestUpload || null,
          latestAnalysis,
          totalUploads: summary.totalUploads || 0,
          recentUploads: summary.recentUploads || [],
        });
      } catch (err: any) {
        console.error("Failed to fetch admin dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchDashboardData();
    }
  }, [status, session, accessToken]);

  const complianceStatus = useMemo(() => {
    if (!data) return "Unknown";
    if (data.complianceScore >= 80) return "Strong";
    if (data.complianceScore >= 60) return "Moderate";
    return "Weak";
  }, [data]);

  const riskLevel = useMemo(() => {
    if (!data) return "Low";
    if (data.risks.critical > 0) return "Critical";
    if (data.risks.high > 0) return "High";
    if (data.risks.medium > 0) return "Medium";
    return "Low";
  }, [data]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  const latestSummary = data?.latestAnalysis?.summary;
  const latestRequirements = data?.latestAnalysis?.compliance?.requirements;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      <header className="bg-black/30 backdrop-blur border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Privacy Impact Dashboard</h1>
              <p className="text-sm text-gray-400">
                Monitor privacy risks, compliance status, and data activity across healthcare systems
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                <p className="text-[11px] text-cyan-300 mt-1">Role: Admin</p>
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
          <h2 className="text-xl font-bold text-white mb-4">Organization Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
            <MetricCard
              title="Overall Compliance Score"
              value={`${data?.complianceScore || 0}%`}
              badge={complianceStatus}
              tone="blue"
              progress={data?.complianceScore || 0}
            />
            <MetricCard
              title="Active Risks"
              value={`${(data?.risks.critical || 0) + (data?.risks.high || 0) + (data?.risks.medium || 0) + (data?.risks.low || 0)}`}
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
              title="DPDPA Compliance"
              value={`${data?.dpdpaCompliance || 0}%`}
              tone="blue"
              progress={data?.dpdpaCompliance || 0}
            />
            <MetricCard
              title="Total Datasets"
              value={`${data?.totalUploads || 0}`}
              tone="blue"
              subtitle="Organization-wide uploads"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionLink href="/upload" label="Upload Data" primary />
              <ActionLink href="/risks" label="View Risks" />
              <ActionLink href="/compliance" label="View Compliance" />
              <ActionLink href="/audit-reports" label="Generate Report" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Latest Analysis</h3>
            <InfoBox label="Dataset" value={data?.latestUpload?.fileName || "N/A"} />
            <InfoBox label="Type" value={data?.latestUpload?.dataType || "N/A"} />
            <InfoBox
              label="Status"
              value={data?.latestUpload?.status || "N/A"}
              valueClassName="text-green-400 font-semibold"
            />
            <InfoBox
              label="Records"
              value={`${latestSummary?.totalRecords ?? data?.latestUpload?.recordCount ?? 0}`}
            />
            <InfoBox
              label="Total Risks"
              value={`${latestSummary?.totalRisks ?? 0}`}
              valueClassName="text-orange-300 font-semibold"
            />
          </div>
        </section>

        <section className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Recent Uploads</h3>

          {data?.recentUploads?.length ? (
            <div className="space-y-3">
              {data.recentUploads.map((upload) => (
                <div
                  key={upload._id}
                  className="p-4 bg-white/10 rounded-lg border border-white/20"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-white font-medium">{upload.fileName}</p>
                      <p className="text-sm text-gray-300">
                        {upload.dataType} • {upload.recordCount} record(s)
                      </p>
                    </div>

                    <div className="text-sm text-right">
                      <p className="text-gray-400 capitalize">{upload.status}</p>
                      <p className="text-gray-400">
                        {upload.uploadedAt ? new Date(upload.uploadedAt).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">No uploads found.</p>
          )}
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
          <Panel title="Latest Compliance Breakdown">
            {latestRequirements ? (
              <div className="space-y-3">
                <RequirementRow label="Encryption" score={latestRequirements.encryption?.score ?? 0} />
                <RequirementRow label="Consent" score={latestRequirements.consent?.score ?? 0} />
                <RequirementRow label="Access Control" score={latestRequirements.accessControl?.score ?? 0} />
                <RequirementRow label="Audit Logging" score={latestRequirements.auditLogging?.score ?? 0} />
                <RequirementRow label="Retention" score={latestRequirements.retention?.score ?? 0} />
              </div>
            ) : (
              <p className="text-gray-300">No compliance breakdown available.</p>
            )}
          </Panel>

          <Panel title="Latest Analysis Summary">
            {latestSummary ? (
              <div className="space-y-3 text-gray-200">
                <p>Total Records: {latestSummary.totalRecords}</p>
                <p>Total Risks: {latestSummary.totalRisks}</p>
                <p>Critical Risks: {latestSummary.critical}</p>
                <p>High Risks: {latestSummary.high}</p>
                <p>Medium Risks: {latestSummary.medium}</p>
                <p>Low Risks: {latestSummary.low}</p>
              </div>
            ) : (
              <p className="text-gray-300">No summary available.</p>
            )}
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
  tone: "blue" | "red";
  progress?: number;
  subtitle?: string;
}) {
  const toneMap = {
    blue: {
      box: "from-blue-500/20 to-blue-500/10 border-blue-500/30",
      text: "text-blue-400",
      bg: "bg-blue-500",
      badge: "bg-blue-500/30 text-blue-200",
    },
    red: {
      box: "from-red-500/20 to-red-500/10 border-red-500/30",
      text: "text-red-400",
      bg: "bg-red-500",
      badge: "bg-red-500/30 text-red-200",
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
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`p-4 border rounded-lg transition font-medium flex items-center justify-between group ${
        primary
          ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
          : "bg-white/10 border-white/20 text-gray-200 hover:bg-white/20"
      }`}
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

function RequirementRow({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white text-sm">{label}</span>
        <span className="text-cyan-300 font-semibold">{score}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}