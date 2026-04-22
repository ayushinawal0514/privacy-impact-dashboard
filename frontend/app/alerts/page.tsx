"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { getApiClient, setAuthToken } from "@/lib/api-client";

type AlertItem = {
  _id: string;
  title?: string;
  message?: string;
  severity?: "critical" | "high" | "medium" | "low";
  type?: string;
  datasetId?: string;
  datasetName?: string;
  triggeredByRule?: string;
  affectedResources?: string[];
  recommendation?: string;
  resolved?: boolean;
  createdAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
};

type AlertDataset = {
  datasetId?: string | null;
  datasetName?: string | null;
  count: number;
};

type AlertsApiResponse = {
  success: boolean;
  data: AlertItem[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  datasets: AlertDataset[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
  };
};

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [datasets, setDatasets] = useState<AlertDataset[]>([]);
  const [summary, setSummary] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
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
    fetchAlerts();
  }, [session, accessToken]);

  async function fetchAlerts() {
    try {
      setLoading(true);
      setError(null);

      const client = getApiClient();
      const params: Record<string, any> = {};

      if (severityFilter !== "all") params.severity = severityFilter;
      if (statusFilter !== "all") params.resolved = statusFilter === "resolved";
      if (datasetFilter !== "all") params.datasetName = datasetFilter;

      const res = await client.get("/alerts", { params });
      const payload: AlertsApiResponse = res.data;

      setAlerts(payload.data || []);
      setDatasets(payload.datasets || []);
      setSummary(
        payload.summary || {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        }
      );
    } catch (err: any) {
      console.error("Error fetching alerts:", err);
      setError(err?.response?.data?.message || "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }

  async function resolveAlert(id: string) {
    try {
      const client = getApiClient();
      await client.put(`/alerts/${id}/resolve`, {
        resolutionNotes: "Resolved from dashboard",
      });
      await fetchAlerts();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resolve alert.");
    }
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        (alert.title || "").toLowerCase().includes(q) ||
        (alert.message || "").toLowerCase().includes(q) ||
        (alert.type || "").toLowerCase().includes(q) ||
        (alert.datasetName || "").toLowerCase().includes(q) ||
        (alert.triggeredByRule || "").toLowerCase().includes(q) ||
        (alert.affectedResources || []).join(", ").toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [alerts, search]);

  if (status === "loading" || loading) {
    return (
      <EnhancedDashboardLayout activeSection="alerts" userRole={session?.user?.role}>
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
    <EnhancedDashboardLayout activeSection="alerts" userRole={session?.user?.role}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Alerts</h1>
            <p className="text-slate-600">
              Automatically generated alerts based on detected privacy risks and compliance violations
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
              placeholder="Search alerts, datasets, rules..."
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
              <option value="resolved">Resolved</option>
            </select>

            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-900">
              Alert Stream ({filteredAlerts.length})
            </h2>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No alerts found.
            </div>
          ) : (
            <div className="divide-y">
              {filteredAlerts.map((alert) => {
                const statusLabel = alert.resolved ? "resolved" : "open";
                const affectedRecord = alert.affectedResources?.[0];

                return (
                  <div key={alert._id} className="p-6 hover:bg-slate-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={alert.severity || "low"} />
                          <StatusBadge status={statusLabel} />
                          {alert.type && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              {alert.type}
                            </span>
                          )}
                          {alert.datasetName && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {(alert.datasetName || "").trim()}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900">
                          {alert.title || "Privacy / Compliance Alert"}
                          {affectedRecord ? (
                            <span className="text-slate-500 font-medium">
                              {" "}— Record: {affectedRecord}
                            </span>
                          ) : null}
                        </h3>

                        <p className="text-slate-600">
                          {alert.message || "No description available."}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="text-slate-500">
                            <span className="font-medium text-slate-700">Rule:</span>{" "}
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {alert.triggeredByRule || "N/A"}
                            </code>
                          </div>

                          <div className="text-slate-500">
                            <span className="font-medium text-slate-700">Affected resources:</span>{" "}
                            {alert.affectedResources?.length
                              ? alert.affectedResources.join(", ")
                              : "N/A"}
                          </div>
                        </div>

                        {alert.recommendation ? (
                          <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                            <span className="font-medium">Recommendation:</span>{" "}
                            {alert.recommendation}
                          </p>
                        ) : null}

                        <p className="text-sm text-slate-500">
                          Created: {formatDate(alert.createdAt)}
                        </p>

                        {alert.resolvedAt ? (
                          <p className="text-sm text-green-700">
                            Resolved: {formatDate(alert.resolvedAt)}
                          </p>
                        ) : null}

                        {alert.resolutionNotes ? (
                          <p className="text-sm text-slate-500">
                            Notes: {alert.resolutionNotes}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        {!alert.resolved && (
                          <button
                            onClick={() => resolveAlert(alert._id)}
                            className="px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-semibold hover:bg-green-200"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
  const normalized = severity.toLowerCase();
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[normalized] || "bg-slate-100 text-slate-700"}`}>
      {normalized.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles: Record<string, string> = {
    open: "bg-red-100 text-red-700",
    resolved: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[normalized] || "bg-slate-100 text-slate-700"}`}>
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