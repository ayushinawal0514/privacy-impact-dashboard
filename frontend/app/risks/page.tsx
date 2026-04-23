"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { apiMethods, setAuthToken } from "@/lib/api-client";

type RiskItem = {
  _id: string;
  severity: "critical" | "high" | "medium" | "low";
  category?: string;
  riskCategory?: string;
  description?: string;
  recommendation?: string;
  ruleId?: string;
  status?: string;
  dataType?: string;
  datasetId?: string;
  datasetName?: string;
  recordId?: string;
  createdAt?: string;
  detectedAt?: string;
};

type DatasetOption = {
  datasetId?: string | null;
  datasetName?: string | null;
  count: number;
};

type RisksApiResponse = {
  success: boolean;
  role: string;
  count: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  datasets: DatasetOption[];
  data: RiskItem[];
};

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function RisksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [summary, setSummary] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [datasetFilter, setDatasetFilter] = useState("all");
  const [search, setSearch] = useState("");

  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session || !accessToken) return;
    setAuthToken(accessToken);
    fetchRisks();
  }, [session, accessToken]);

  async function fetchRisks() {
    try {
      setLoading(true);
      setError(null);

      const res = await apiMethods.getRisks();
      const payload: RisksApiResponse = res.data;

      setRisks(payload.data || []);
      setSummary(
        payload.summary || {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        }
      );
      setDatasets(payload.datasets || []);
    } catch (err: any) {
      console.error("Error fetching risks:", err);
      setError(err?.response?.data?.message || "Failed to load risks.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRisks = useMemo(() => {
    return [...risks]
      .filter((risk) => {
        const matchSeverity =
          severityFilter === "all" || risk.severity === severityFilter;

        const matchStatus =
          statusFilter === "all" || (risk.status || "open") === statusFilter;

        const normalizedDatasetName = (risk.datasetName || "").trim();
        const matchDataset =
          datasetFilter === "all" || normalizedDatasetName === datasetFilter;

        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          risk.category?.toLowerCase().includes(q) ||
          risk.riskCategory?.toLowerCase().includes(q) ||
          risk.description?.toLowerCase().includes(q) ||
          risk.recommendation?.toLowerCase().includes(q) ||
          risk.ruleId?.toLowerCase().includes(q) ||
          risk.dataType?.toLowerCase().includes(q) ||
          risk.datasetName?.toLowerCase().includes(q) ||
          risk.recordId?.toLowerCase().includes(q) ||
          risk.severity?.toLowerCase().includes(q);

        return matchSeverity && matchStatus && matchDataset && matchSearch;
      })
      .sort((a, b) => {
        const sev =
          (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
        if (sev !== 0) return sev;

        const aTime = new Date(a.detectedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.detectedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [risks, severityFilter, statusFilter, datasetFilter, search]);

  if (status === "loading" || loading) {
    return (
      <EnhancedDashboardLayout activeSection="risks" userRole={session?.user?.role}>
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
    <EnhancedDashboardLayout activeSection="risks" userRole={session?.user?.role}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Risk Management</h1>
            <p className="text-slate-600">
              Review rule-based privacy and compliance risks across uploaded healthcare datasets
            </p>
          </div>

          <Link
            href="/dashboard/admin"
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
          <SummaryCard label="Critical" value={summary.critical} tone="critical" />
          <SummaryCard label="High" value={summary.high} tone="high" />
          <SummaryCard label="Medium" value={summary.medium} tone="medium" />
          <SummaryCard label="Low" value={summary.low} tone="low" />
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search risks, rules, records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={datasetFilter}
              onChange={(e) => setDatasetFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Datasets</option>
              {datasets
                .filter((d) => d.datasetName)
                .map((dataset) => (
                  <option
                    key={dataset.datasetId || dataset.datasetName || Math.random()}
                    value={(dataset.datasetName || "").trim()}
                  >
                    {(dataset.datasetName || "").trim()} ({dataset.count})
                  </option>
                ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            <button
              onClick={fetchRisks}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-900">
              Detected Risks ({filteredRisks.length})
            </h2>
          </div>

          {filteredRisks.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No risks found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Severity</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Dataset</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Record</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Category</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Rule</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Description</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Recommendation</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Detected</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRisks.map((risk) => (
                    <tr key={risk._id} className="border-t hover:bg-slate-50 align-top">
                      <td className="px-6 py-4">
                        <SeverityBadge severity={risk.severity} />
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {risk.datasetName?.trim() || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {risk.recordId || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {risk.category || risk.riskCategory || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {risk.ruleId || "N/A"}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-md">
                        {risk.description || "No description available"}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-md">
                        {risk.recommendation || "No recommendation available"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={risk.status || "open"} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(risk.detectedAt || risk.createdAt)}
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

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "critical" | "high" | "medium" | "low";
}) {
  const toneMap = {
    critical: "border-red-200 bg-red-50 text-red-700",
    high: "border-orange-200 bg-orange-50 text-orange-700",
    medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
    low: "border-green-200 bg-green-50 text-green-700",
  };

  return (
    <div className={`rounded-lg border p-5 ${toneMap[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[severity] || "bg-slate-100 text-slate-700"}`}>
      {severity.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles =
    normalized === "closed"
      ? "bg-green-100 text-green-700"
      : "bg-blue-100 text-blue-700";

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