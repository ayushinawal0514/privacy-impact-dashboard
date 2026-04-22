"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { apiMethods, setAuthToken } from "@/lib/api-client";

type UploadItem = {
  _id: string;
  fileName: string;
  dataType: string;
  recordCount: number;
  status: string;
  uploadedAt?: string;
  uploadedByUser?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
};

type SummaryData = {
  latestUpload?: UploadItem | null;
  totalUploads?: number;
  risks?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
};

type FlowStage = {
  title: string;
  subtitle: string;
  description: string;
  tone: "blue" | "purple" | "green" | "orange" | "red";
};

export default function DataFlowsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
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
    fetchData();
  }, [session, accessToken]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const [uploadsRes, summaryRes] = await Promise.all([
        apiMethods.getUploads(0, 20),
        apiMethods.getDashboardSummary(),
      ]);

      setUploads(uploadsRes.data?.data || []);
      setSummary(summaryRes.data?.data || null);
    } catch (err: any) {
      console.error("Error loading data flows:", err);
      setError(err?.response?.data?.message || "Failed to load data flow information.");
    } finally {
      setLoading(false);
    }
  }

  const flowStages: FlowStage[] = useMemo(() => {
    const latest = summary?.latestUpload;

    return [
      {
        title: "Data Source",
        subtitle: latest?.fileName || "Healthcare Dataset",
        description: "Patient, operational, or access-log data is uploaded into the system for privacy assessment.",
        tone: "blue",
      },
      {
        title: "Cloud Storage",
        subtitle: "MongoDB Atlas",
        description: "Uploaded records are stored in a cloud-hosted database, simulating a cloud healthcare data environment.",
        tone: "purple",
      },
      {
        title: "Privacy Analysis Engine",
        subtitle: "Risk + Compliance Evaluation",
        description: "The backend evaluates encryption, consent, access control, retention, audit logging, and breach-readiness.",
        tone: "orange",
      },
      {
        title: "Risk & Audit Layer",
        subtitle: "Risks / Logs / Reports",
        description: "Detected risks, access activity, and generated audit reports are recorded for traceability and monitoring.",
        tone: "red",
      },
      {
        title: "Dashboard Output",
        subtitle: "Admin / User Views",
        description: "Results are shown through role-based dashboards with compliance scores, risk summaries, and recommendations.",
        tone: "green",
      },
    ];
  }, [summary]);

  const totalRecords = useMemo(() => {
    return uploads.reduce((sum, item) => sum + (item.recordCount || 0), 0);
  }, [uploads]);

  const riskTotal = useMemo(() => {
    if (!summary?.risks) return 0;
    return (
      (summary.risks.critical || 0) +
      (summary.risks.high || 0) +
      (summary.risks.medium || 0) +
      (summary.risks.low || 0)
    );
  }, [summary]);

  if (status === "loading" || loading) {
    return (
      <EnhancedDashboardLayout activeSection="data flows" userRole={session?.user?.role}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </EnhancedDashboardLayout>
    );
  }

  return (
    <EnhancedDashboardLayout activeSection="data flows" userRole={session?.user?.role}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Flows</h1>
            <p className="text-slate-600">
              Visual overview of how healthcare data moves through your cloud-based privacy assessment system
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-fit"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Datasets Processed" value={summary?.totalUploads || uploads.length} tone="blue" />
          <StatCard label="Total Records" value={totalRecords} tone="green" />
          <StatCard label="Detected Risks" value={riskTotal} tone="orange" />
          <StatCard label="Latest Dataset" value={summary?.latestUpload?.fileName || "N/A"} tone="purple" isText />
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">System Data Flow Pipeline</h2>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {flowStages.map((stage, index) => (
              <div key={stage.title} className="relative">
                <FlowCard {...stage} />
                {index < flowStages.length - 1 && (
                  <div className="hidden xl:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2 items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shadow">
                      →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoPanel title="How this matches the project objective">
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Healthcare datasets are uploaded into a cloud-backed environment.</li>
              <li>Privacy risks are identified automatically using rule-based analysis.</li>
              <li>Compliance is assessed against HIPAA and DPDP-style checks.</li>
              <li>Access, risks, and audit information are preserved for accountability.</li>
              <li>Findings are surfaced through role-based dashboards for decision-making.</li>
            </ul>
          </InfoPanel>

          <InfoPanel title="Current flow summary">
            <div className="space-y-3 text-slate-700">
              <p>
                <span className="font-semibold">Latest dataset:</span>{" "}
                {summary?.latestUpload?.fileName || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {summary?.latestUpload?.dataType || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {summary?.latestUpload?.status || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Cloud database:</span> MongoDB Atlas
              </p>
              <p>
                <span className="font-semibold">Output layers:</span> Risks, Compliance, Access Logs, Audit Reports
              </p>
            </div>
          </InfoPanel>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-900">Recent Dataset Flow Records</h2>
          </div>

          {uploads.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No uploaded datasets found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Dataset</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Type</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Records</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Flow Stage</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload) => (
                    <tr key={upload._id} className="border-t hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {upload.fileName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {upload.dataType}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {upload.recordCount}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        Stored → Analyzed → Dashboarded
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={upload.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(upload.uploadedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </EnhancedDashboardLayout>
  );
}

function StatCard({
  label,
  value,
  tone,
  isText = false,
}: {
  label: string;
  value: number | string;
  tone: "blue" | "green" | "orange" | "purple";
  isText?: boolean;
}) {
  const toneMap = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  };

  return (
    <div className={`rounded-lg border p-5 ${toneMap[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className={`${isText ? "text-lg" : "text-3xl"} font-bold mt-2 break-words`}>
        {value}
      </p>
    </div>
  );
}

function FlowCard({
  title,
  subtitle,
  description,
  tone,
}: FlowStage) {
  const toneMap = {
    blue: "border-blue-200 bg-blue-50",
    purple: "border-purple-200 bg-purple-50",
    green: "border-green-200 bg-green-50",
    orange: "border-orange-200 bg-orange-50",
    red: "border-red-200 bg-red-50",
  };

  return (
    <div className={`h-full rounded-lg border p-5 ${toneMap[tone]}`}>
      <p className="text-sm text-slate-500 mb-2">{title}</p>
      <h3 className="font-semibold text-slate-900 mb-2">{subtitle}</h3>
      <p className="text-sm text-slate-700 leading-6">{description}</p>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles =
    normalized === "completed"
      ? "bg-green-100 text-green-700"
      : normalized === "processing"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {normalized.toUpperCase()}
    </span>
  );
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
}