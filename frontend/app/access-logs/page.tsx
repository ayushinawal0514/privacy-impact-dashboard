"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { apiMethods, setAuthToken } from "@/lib/api-client";

type AccessLog = {
  _id?: string;
  userId?: string;
  action?: string;
  dataType?: string;
  resourceId?: string;
  timestamp?: string;
  organizationId?: string;
  loggedBy?: string;
  ipAddress?: string;
  userAgent?: string;
};

type Analytics = {
  totalAccesses: number;
  accessByType: Array<{ _id: string; count: number }>;
  topUsers: Array<{ _id: string; count: number }>;
};

export default function AccessLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [dataTypeFilter, setDataTypeFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session || !accessToken) return;

    setAuthToken(accessToken);
    fetchAccessLogs();
  }, [session, accessToken]);

  async function fetchAccessLogs() {
    try {
      setLoading(true);
      setError(null);

      const [logsRes, analyticsRes] = await Promise.all([
        apiMethods.getAccessLogs(0, 100),
        apiMethods.getAccessLogAnalytics(),
      ]);

      const logsPayload = logsRes.data?.data || [];
      const analyticsPayload = analyticsRes.data?.data || null;

      setLogs(logsPayload);
      setAnalytics(analyticsPayload);
    } catch (err: any) {
      console.error("Error fetching access logs:", err);
      setError(err?.response?.data?.message || "Failed to load access logs.");
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        (log.userId || "").toLowerCase().includes(q) ||
        (log.action || "").toLowerCase().includes(q) ||
        (log.dataType || "").toLowerCase().includes(q) ||
        (log.resourceId || "").toLowerCase().includes(q);

      const matchesDataType =
        dataTypeFilter === "all" || (log.dataType || "") === dataTypeFilter;

      const matchesAction =
        actionFilter === "all" || (log.action || "") === actionFilter;

      return matchesSearch && matchesDataType && matchesAction;
    });
  }, [logs, search, dataTypeFilter, actionFilter]);

  const distinctDataTypes = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.dataType).filter(Boolean))) as string[];
  }, [logs]);

  const distinctActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action).filter(Boolean))) as string[];
  }, [logs]);

  if (status === "loading" || loading) {
    return (
      <EnhancedDashboardLayout activeSection="access logs" userRole={session?.user?.role}>
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
    <EnhancedDashboardLayout activeSection="access logs" userRole={session?.user?.role}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Logs</h1>
            <p className="text-slate-600">
              Monitor who accessed which healthcare data resources and when
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
          <StatCard
            label="Total Access Events"
            value={analytics?.totalAccesses || 0}
            tone="blue"
          />
          <StatCard
            label="Data Types Accessed"
            value={analytics?.accessByType?.length || 0}
            tone="green"
          />
          <StatCard
            label="Top Active Users"
            value={analytics?.topUsers?.length || 0}
            tone="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Access by Data Type</h2>
            <div className="space-y-3">
              {analytics?.accessByType?.length ? (
                analytics.accessByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <span className="text-slate-700">{item._id || "Unknown"}</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No analytics available.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Top Users by Access</h2>
            <div className="space-y-3">
              {analytics?.topUsers?.length ? (
                analytics.topUsers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <span className="text-slate-700">{item._id || "Unknown"}</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No analytics available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by user, action, type, resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={dataTypeFilter}
              onChange={(e) => setDataTypeFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Data Types</option>
              {distinctDataTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              {distinctActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            <button
              onClick={fetchAccessLogs}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-900">
              Access Events ({filteredLogs.length})
            </h2>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No access logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">User</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Action</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Data Type</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Resource</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">IP Address</th>
                    <th className="text-left px-6 py-4 font-semibold text-slate-700">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={log._id || index} className="border-t hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {log.userId || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <ActionBadge action={log.action || "read"} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {log.dataType || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {log.resourceId || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {log.ipAddress || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(log.timestamp)}
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
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "orange";
}) {
  const toneMap = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
  };

  return (
    <div className={`rounded-lg border p-5 ${toneMap[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const normalized = action.toLowerCase();
  const styles: Record<string, string> = {
    read: "bg-blue-100 text-blue-700",
    write: "bg-green-100 text-green-700",
    update: "bg-yellow-100 text-yellow-700",
    delete: "bg-red-100 text-red-700",
    login: "bg-purple-100 text-purple-700",
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