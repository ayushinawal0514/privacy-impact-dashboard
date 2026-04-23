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
  datasetId?: string;
  datasetName?: string;
  dataType?: string;
  createdAt: string;
  summary: {
    totalRecords: number;
    totalRisks: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance: {
    overallScore: number;
    hipaaScore: number;
    dpdpaScore: number;
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

interface UserDashboardData {
  uploadsCount: number;
  latestUpload: UploadItem | null;
  complianceScore: number;
  hipaaCompliance: number;
  dpdpaCompliance: number;
  totalRisks: number;
  risks: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  passedRules: number;
  failedRules: number;
  summary: string;
  nextAction: string;
  requirements: {
    label: string;
    score: number;
  }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<UserDashboardData | null>(null);
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
        const latestCompleted = uploads.find(
          (u) => u.status === "completed" && u.analysisId
        );

        if (!latestCompleted?.analysisId) {
          setData({
            uploadsCount: uploads.length,
            latestUpload: uploads[0] || null,
            complianceScore: 0,
            hipaaCompliance: 0,
            dpdpaCompliance: 0,
            totalRisks: 0,
            risks: { critical: 0, high: 0, medium: 0, low: 0 },
            passedRules: 0,
            failedRules: 0,
            summary:
              uploads.length > 0
                ? "You have uploaded data, but no completed analysis is available yet."
                : "You have not uploaded any datasets yet. Start by uploading a healthcare dataset.",
            nextAction:
              uploads.length > 0
                ? "Wait for analysis completion or upload a fresh dataset."
                : "Upload a dataset to begin privacy and compliance analysis.",
            requirements: [],
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

        const requirements = analysis.compliance?.requirements || {};

        const requirementCards = [
          {
            label: "Encryption",
            score: requirements.encryption?.score ?? 0,
          },
          {
            label: "Consent",
            score: requirements.consent?.score ?? 0,
          },
          {
            label: "Access Control",
            score: requirements.accessControl?.score ?? 0,
          },
          {
            label: "Audit Logging",
            score: requirements.auditLogging?.score ?? 0,
          },
          {
            label: "Retention",
            score: requirements.retention?.score ?? 0,
          },
        ];

        const totalRisks = analysis.summary?.totalRisks || 0;
        const overallScore = analysis.compliance?.overallScore || 0;

        let nextAction = "Your dataset looks healthy.";
        if ((analysis.summary?.critical || 0) > 0) {
          nextAction = "Review critical privacy issues immediately.";
        } else if ((analysis.summary?.high || 0) > 0) {
          nextAction = "Review high-severity issues and improve compliance.";
        } else if (totalRisks > 0) {
          nextAction = "Address medium-priority issues to improve compliance.";
        }

        setData({
          uploadsCount: uploads.length,
          latestUpload: latestCompleted,
          complianceScore: overallScore,
          hipaaCompliance: analysis.compliance?.hipaaScore || 0,
          dpdpaCompliance: analysis.compliance?.dpdpaScore || 0,
          totalRisks,
          risks: {
            critical: analysis.summary?.critical || 0,
            high: analysis.summary?.high || 0,
            medium: analysis.summary?.medium || 0,
            low: analysis.summary?.low || 0,
          },
          passedRules: analysis.compliance?.passedRules || 0,
          failedRules: analysis.compliance?.failedRules || 0,
          summary: `Your latest analyzed dataset "${latestCompleted.fileName}" contains ${totalRisks} detected risk(s) across ${analysis.summary?.totalRecords || 0} record(s).`,
          nextAction,
          requirements: requirementCards,
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
    if (data.complianceScore >= 80) return "Strong";
    if (data.complianceScore >= 60) return "Moderate";
    return "Needs Attention";
  }, [data]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your workspace...</p>
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
              <h1 className="text-2xl font-bold text-white">My Data & Compliance</h1>
              <p className="text-sm text-gray-400">
                View your uploads, latest analysis, and compliance health
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session.user?.email}
                </p>
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
          <h2 className="text-xl font-bold text-white mb-4">My Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="My Datasets"
              value={`${data?.uploadsCount || 0}`}
              tone="blue"
              subtitle="Uploads available in your workspace"
            />
            <MetricCard
              title="Compliance Score"
              value={`${data?.complianceScore || 0}%`}
              tone="emerald"
              badge={complianceStatus}
              progress={data?.complianceScore || 0}
            />
            <MetricCard
              title="Detected Risks"
              value={`${data?.totalRisks || 0}`}
              tone="red"
              subtitle={`Critical: ${data?.risks.critical || 0} • High: ${data?.risks.high || 0}`}
            />
            <MetricCard
              title="Rules Status"
              value={`${data?.passedRules || 0}/${(data?.passedRules || 0) + (data?.failedRules || 0)}`}
              tone="indigo"
              subtitle={`Failed: ${data?.failedRules || 0}`}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">What you can do</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionLink href="/upload" label="Upload Dataset" tone="purple" />
              <ActionLink href="/risks" label="View My Risks" tone="green" />
              <ActionLink href="/compliance" label="View Compliance" tone="cyan" />
              <ActionLink href="/audit-reports" label="My Reports" tone="pink" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Latest Dataset</h3>
            <InfoBox label="File" value={data?.latestUpload?.fileName || "N/A"} />
            <InfoBox label="Type" value={data?.latestUpload?.dataType || "N/A"} />
            <InfoBox
              label="Records"
              value={`${data?.latestUpload?.recordCount || 0}`}
            />
            <InfoBox
              label="Status"
              value={data?.latestUpload?.status || "N/A"}
              valueClassName="text-green-400 font-semibold"
            />
          </div>
        </section>

        <section className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">My Risk Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 font-semibold text-white">Severity</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Count</th>
                  <th className="text-right py-3 px-4 font-semibold text-white">Meaning</th>
                </tr>
              </thead>
              <tbody>
                <RiskRow
                  label="Critical"
                  color="bg-red-500"
                  textColor="text-red-400"
                  value={data?.risks.critical || 0}
                  badge="Immediate action"
                />
                <RiskRow
                  label="High"
                  color="bg-orange-500"
                  textColor="text-orange-400"
                  value={data?.risks.high || 0}
                  badge="Priority"
                />
                <RiskRow
                  label="Medium"
                  color="bg-yellow-500"
                  textColor="text-yellow-400"
                  value={data?.risks.medium || 0}
                  badge="Review"
                />
                <RiskRow
                  label="Low"
                  color="bg-green-500"
                  textColor="text-green-400"
                  value={data?.risks.low || 0}
                  badge="Monitor"
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="My Compliance Snapshot">
            <div className="space-y-4">
              <MiniMetric
                label="Overall Compliance"
                value={`${data?.complianceScore || 0}%`}
              />
              <MiniMetric
                label="HIPAA Compliance"
                value={`${data?.hipaaCompliance || 0}%`}
              />
              <MiniMetric
                label="DPDP Compliance"
                value={`${data?.dpdpaCompliance || 0}%`}
              />
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">
                Requirement Scores
              </h4>
              <div className="space-y-3">
                {data?.requirements?.length ? (
                  data.requirements.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-200">{item.label}</span>
                        <span className="text-gray-300">{item.score}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300 text-sm">
                    No requirement breakdown available yet.
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="What this means for me">
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Summary</p>
                <p className="text-gray-200 leading-relaxed">
                  {data?.summary || "No summary available."}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Suggested next action</p>
                <p className="text-gray-200 leading-relaxed">
                  {data?.nextAction || "No immediate action needed."}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Why this page matters</p>
                <p className="text-gray-200 leading-relaxed">
                  This view helps you understand the privacy health of your own uploaded
                  data without exposing organization-wide administrative controls.
                </p>
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
    <div
      className={`min-h-[140px] bg-gradient-to-br ${styles.box} backdrop-blur border rounded-lg p-6 shadow-lg`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-gray-300 font-medium">{title}</p>
        {badge ? (
          <span className={`text-xs font-bold px-2 py-1 rounded ${styles.badge}`}>
            {badge}
          </span>
        ) : null}
      </div>
      <p className={`text-4xl font-bold mb-2 ${styles.text}`}>{value}</p>
      {typeof progress === "number" ? (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className={`${styles.bg} h-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
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
        <span className="text-xs px-2 py-1 bg-white/10 text-gray-200 rounded-full">
          {badge}
        </span>
      </td>
    </tr>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
      <span className="text-gray-300">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}