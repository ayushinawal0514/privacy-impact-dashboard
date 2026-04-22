"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { apiMethods, setAuthToken, getApiClient } from "@/lib/api-client";

type AuditReport = {
  _id: string;
  reportName: string;
  reportType: string;
  reportPeriod?: {
    startDate?: string;
    endDate?: string;
  };
  summary?: {
    totalEvents?: number;
    risksIdentified?: number;
    complianceScore?: number;
    hipaaCompliance?: number;
    dpdpaCompliance?: number;
    anomaliesDetected?: number;
    uniqueUsers?: number;
  };
  details?: {
    risks?: {
      critical?: number;
      high?: number;
      medium?: number;
      low?: number;
    };
    anomalies?: {
      critical?: number;
      high?: number;
      medium?: number;
      low?: number;
    };
    accessMetrics?: {
      totalAccess?: number;
      failedAccess?: number;
      uniqueUsers?: number;
      readOperations?: number;
      writeOperations?: number;
      deleteOperations?: number;
      exportOperations?: number;
    };
  };
  recommendations?: string[];
  generatedAt?: string;
  generatedBy?: string;
};

export default function AuditReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session || !accessToken) return;

    setAuthToken(accessToken);
    fetchReports();
  }, [session, accessToken]);

  async function fetchReports() {
    try {
      setLoading(true);
      setError(null);

      const res = await apiMethods.getReports(0, 50);
      const payload = res.data?.data || [];
      setReports(payload);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err?.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateReport() {
    try {
      if (!reportName.trim()) {
        setError("Report name is required.");
        return;
      }

      setCreating(true);
      setError(null);

      const res = await apiMethods.generateReport(
        reportName,
        reportType,
        startDate || undefined,
        endDate || undefined
      );

      const newReport = res.data?.report;
      if (newReport) {
        setSelectedReport(newReport);
      }

      setReportName("");
      setReportType("custom");
      setStartDate("");
      setEndDate("");

      await fetchReports();
    } catch (err: any) {
      console.error("Error generating report:", err);
      setError(err?.response?.data?.message || "Failed to generate report.");
    } finally {
      setCreating(false);
    }
  }

  async function handleViewReport(reportId: string) {
    try {
      setError(null);
      const res = await apiMethods.getReportDetails(reportId);
      setSelectedReport(res.data?.data || null);
    } catch (err: any) {
      console.error("Error fetching report details:", err);
      setError(err?.response?.data?.message || "Failed to fetch report.");
    }
  }

  async function handleDeleteReport(reportId: string) {
    try {
      setError(null);
      const client = getApiClient();
      await client.delete(`/report/${reportId}`);

      if (selectedReport?._id === reportId) {
        setSelectedReport(null);
      }

      await fetchReports();
    } catch (err: any) {
      console.error("Error deleting report:", err);
      setError(err?.response?.data?.message || "Failed to delete report.");
    }
  }

  const totalReports = useMemo(() => reports.length, [reports]);

  if (status === "loading" || loading) {
    return (
      <EnhancedDashboardLayout activeSection="audit reports" userRole={session?.user?.role}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </EnhancedDashboardLayout>
    );
  }

  return (
    <EnhancedDashboardLayout activeSection="audit reports" userRole={session?.user?.role}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Reports</h1>
            <p className="text-slate-600">
              Generate and review compliance audit summaries from risks, anomalies, and access activity
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Reports" value={totalReports} tone="blue" />
          <StatCard
            label="Latest Compliance Score"
            value={selectedReport?.summary?.complianceScore ?? 0}
            tone="green"
            suffix="%"
          />
          <StatCard
            label="Latest Risks Identified"
            value={selectedReport?.summary?.risksIdentified ?? 0}
            tone="orange"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 bg-white rounded-lg border shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Generate Report</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Monthly Compliance Review"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="incident">Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={creating}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-60"
              >
                {creating ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          <div className="xl:col-span-2 bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-slate-900">Generated Reports</h2>
            </div>

            {reports.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No reports generated yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-slate-700">Name</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-700">Type</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-700">Compliance</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-700">Risks</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-700">Generated</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="border-t hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {report.reportName}
                        </td>
                        <td className="px-6 py-4 text-slate-600 capitalize">
                          {report.reportType}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {report.summary?.complianceScore ?? 0}%
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {report.summary?.risksIdentified ?? 0}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(report.generatedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewReport(report._id)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report._id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selectedReport && (
          <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedReport.reportName}</h2>
                <p className="text-slate-600">
                  Generated on {formatDate(selectedReport.generatedAt)}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold capitalize w-fit">
                {selectedReport.reportType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MiniCard title="Compliance Score" value={`${selectedReport.summary?.complianceScore ?? 0}%`} />
              <MiniCard title="HIPAA" value={`${selectedReport.summary?.hipaaCompliance ?? 0}%`} />
              <MiniCard title="DPDPA" value={`${selectedReport.summary?.dpdpaCompliance ?? 0}%`} />
              <MiniCard title="Risks Identified" value={`${selectedReport.summary?.risksIdentified ?? 0}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InfoPanel title="Risk Breakdown">
                <ul className="space-y-2 text-slate-700">
                  <li>Critical: {selectedReport.details?.risks?.critical ?? 0}</li>
                  <li>High: {selectedReport.details?.risks?.high ?? 0}</li>
                  <li>Medium: {selectedReport.details?.risks?.medium ?? 0}</li>
                  <li>Low: {selectedReport.details?.risks?.low ?? 0}</li>
                </ul>
              </InfoPanel>

              <InfoPanel title="Access Metrics">
                <ul className="space-y-2 text-slate-700">
                  <li>Total Access: {selectedReport.details?.accessMetrics?.totalAccess ?? 0}</li>
                  <li>Failed Access: {selectedReport.details?.accessMetrics?.failedAccess ?? 0}</li>
                  <li>Unique Users: {selectedReport.details?.accessMetrics?.uniqueUsers ?? 0}</li>
                  <li>Read Operations: {selectedReport.details?.accessMetrics?.readOperations ?? 0}</li>
                  <li>Write Operations: {selectedReport.details?.accessMetrics?.writeOperations ?? 0}</li>
                  <li>Delete Operations: {selectedReport.details?.accessMetrics?.deleteOperations ?? 0}</li>
                </ul>
              </InfoPanel>
            </div>

            <InfoPanel title="Recommendations">
              {selectedReport.recommendations?.length ? (
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">No recommendations available.</p>
              )}
            </InfoPanel>
          </div>
        )}
      </div>
    </EnhancedDashboardLayout>
  );
}

function StatCard({
  label,
  value,
  tone,
  suffix = "",
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "orange";
  suffix?: string;
}) {
  const toneMap = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
  };

  return (
    <div className={`rounded-lg border p-5 ${toneMap[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-2">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
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
    <div className="rounded-lg border p-5">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
}