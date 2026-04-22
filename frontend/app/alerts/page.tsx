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
  affectedResources?: string[];
  resolved?: boolean;
  createdAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
};

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
      const res = await client.get("/alerts");
      setAlerts(res.data?.data || []);
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
      const sev = (alert.severity || "low").toLowerCase();
      const st = alert.resolved ? "resolved" : "open";

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (alert.title || "").toLowerCase().includes(q) ||
        (alert.message || "").toLowerCase().includes(q) ||
        (alert.type || "").toLowerCase().includes(q);

      const matchesSeverity = severityFilter === "all" || sev === severityFilter;
      const matchesStatus = statusFilter === "all" || st === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, search, severityFilter, statusFilter]);

  const summary = useMemo(() => {
    return alerts.reduce(
      (acc, alert) => {
        const sev = (alert.severity || "low").toLowerCase() as keyof typeof acc;
        if (acc[sev] !== undefined) acc[sev] += 1;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );
  }, [alerts]);

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
              Monitor important privacy, compliance, and security events across the system
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
          <SummaryCard label="Critical" value={summary.critical} tone="critical" />
          <SummaryCard label="High" value={summary.high} tone="high" />
          <SummaryCard label="Medium" value={summary.medium} tone="medium" />
          <SummaryCard label="Low" value={summary.low} tone="low" />
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />

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

                return (
                  <div key={alert._id} className="p-6 hover:bg-slate-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={alert.severity || "low"} />
                          <StatusBadge status={statusLabel} />
                          {alert.type && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              {alert.type}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900">
                          {alert.title || "Security / Compliance Alert"}
                        </h3>

                        <p className="text-slate-600">
                          {alert.message || "No description available."}
                        </p>

                        {alert.affectedResources?.length ? (
                          <p className="text-sm text-slate-500">
                            Affected resources: {alert.affectedResources.join(", ")}
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