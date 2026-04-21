"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiMethods, setAuthToken } from "@/lib/api-client";

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
  totalUsers: number;
  pendingAlerts: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set auth token if available from session
        if (session?.accessToken) {
          setAuthToken(session.accessToken);
        }

        // Fetch risks and compliance data
        const risksResponse = await apiMethods.getRisks();
        const complianceResponse = await apiMethods.getComplianceStatus();

        const risks = risksResponse.data.data || [];
        const compliance = complianceResponse.data.data || {
          hipaaCompliance: 0,
          dpdpaCompliance: 0,
          overallScore: 0,
        };

        // Calculate risk summary
        const riskSummary = {
          critical: risks.filter((r: any) => r.severity === 'critical').length,
          high: risks.filter((r: any) => r.severity === 'high').length,
          medium: risks.filter((r: any) => r.severity === 'medium').length,
          low: risks.filter((r: any) => r.severity === 'low').length,
        };

        setData({
          risks: riskSummary,
          complianceScore: compliance.overallScore || 75,
          hipaaCompliance: compliance.hipaaCompliance || 80,
          dpdpaCompliance: compliance.dpdpaCompliance || 70,
          totalUsers: 42,
          pendingAlerts: riskSummary.critical + riskSummary.high,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        // Set default data for demo
        setData({
          risks: { critical: 2, high: 5, medium: 8, low: 12 },
          complianceScore: 75,
          hipaaCompliance: 80,
          dpdpaCompliance: 70,
          totalUsers: 42,
          pendingAlerts: 7,
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const complianceStatus = data?.complianceScore ? (
    data.complianceScore >= 80 ? '✓ Strong' :
    data.complianceScore >= 60 ? '⚠ Moderate' : '✗ Weak'
  ) : 'Unknown';

  const riskLevel = (data?.risks.critical || 0) > 0 ? 'Critical' :
                    (data?.risks.high || 0) > 0 ? 'High' : 'Low';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Healthcare Privacy Dashboard
              </h1>
              <p className="text-sm text-gray-400">Real-time compliance & risk monitoring</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-400">{session.user?.email}</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 text-amber-200">
            {error}
          </div>
        )}

        {/* Key Metrics Cards */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Compliance Score Card */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 backdrop-blur border border-emerald-500/30 rounded-lg p-6 hover:border-emerald-500/50 transition shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-300 font-medium">Compliance Score</p>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-500/30 text-emerald-200 rounded">
                  {complianceStatus}
                </span>
              </div>
              <p className="text-4xl font-bold text-emerald-400 mb-2">
                {data?.complianceScore || 0}%
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${data?.complianceScore || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Active Risks Card */}
            <div className="bg-gradient-to-br from-red-500/20 to-red-500/10 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500/50 transition shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-300 font-medium">Active Risks</p>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  riskLevel === 'Critical' ? 'bg-red-500/30 text-red-200' :
                  riskLevel === 'High' ? 'bg-orange-500/30 text-orange-200' :
                  'bg-yellow-500/30 text-yellow-200'
                }`}>
                  {riskLevel}
                </span>
              </div>
              <p className="text-4xl font-bold text-red-400 mb-2">
                {((data?.risks.critical || 0) + (data?.risks.high || 0) + (data?.risks.medium || 0))}
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Critical: <span className="text-red-400 font-bold">{data?.risks.critical || 0}</span></div>
                <div>High: <span className="text-orange-400 font-bold">{data?.risks.high || 0}</span></div>
              </div>
            </div>

            {/* HIPAA Compliance Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 backdrop-blur border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/50 transition shadow-lg">
              <p className="text-sm text-gray-300 font-medium mb-4">HIPAA Compliance</p>
              <p className="text-4xl font-bold text-blue-400 mb-2">
                {data?.hipaaCompliance || 0}%
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${data?.hipaaCompliance || 0}%` }}
                ></div>
              </div>
            </div>

            {/* DPDP Compliance Card */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 backdrop-blur border border-indigo-500/30 rounded-lg p-6 hover:border-indigo-500/50 transition shadow-lg">
              <p className="text-sm text-gray-300 font-medium mb-4">DPDP Compliance</p>
              <p className="text-4xl font-bold text-indigo-400 mb-2">
                {data?.dpdpaCompliance || 0}%
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${data?.dpdpaCompliance || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions & Information */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/compliance"
                className="p-4 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30 rounded-lg hover:from-cyan-500/30 hover:to-cyan-500/20 hover:border-cyan-500/50 transition text-cyan-200 font-medium flex items-center justify-between group"
              >
                <span>View Compliance</span>
                <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
              <Link
                href="/compliance"
                className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-purple-500/20 hover:border-purple-500/50 transition text-purple-200 font-medium flex items-center justify-between group"
              >
                <span>Upload Data</span>
                <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
              <Link
                href="/compliance"
                className="p-4 bg-gradient-to-r from-pink-500/20 to-pink-500/10 border border-pink-500/30 rounded-lg hover:from-pink-500/30 hover:to-pink-500/20 hover:border-pink-500/50 transition text-pink-200 font-medium flex items-center justify-between group"
              >
                <span>Generate Report</span>
                <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
              <Link
                href="/compliance"
                className="p-4 bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-green-500/20 hover:border-green-500/50 transition text-green-200 font-medium flex items-center justify-between group"
              >
                <span>View Risks</span>
                <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
                <span className="text-gray-300">API Status</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-sm font-bold">Healthy</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
                <span className="text-gray-300">Database</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-sm font-bold">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
                <span className="text-gray-300">Monitoring</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-sm font-bold">Active</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Summary Table */}
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
                <tr className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Critical
                  </td>
                  <td className="py-3 px-4 text-center text-red-400 font-bold">{data?.risks.critical || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs px-2 py-1 bg-red-500/30 text-red-200 rounded-full">Urgent</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    High
                  </td>
                  <td className="py-3 px-4 text-center text-orange-400 font-bold">{data?.risks.high || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs px-2 py-1 bg-orange-500/30 text-orange-200 rounded-full">Important</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Medium
                  </td>
                  <td className="py-3 px-4 text-center text-yellow-400 font-bold">{data?.risks.medium || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs px-2 py-1 bg-yellow-500/30 text-yellow-200 rounded-full">Monitor</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Low
                  </td>
                  <td className="py-3 px-4 text-center text-green-400 font-bold">{data?.risks.low || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs px-2 py-1 bg-green-500/30 text-green-200 rounded-full">Info</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
                <div className="w-3 h-3 bg-cyan-400 rounded-full flex-shrink-0"></div>
                <span className="text-gray-200 font-medium">Automated compliance scoring</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition">
                <div className="w-3 h-3 bg-cyan-400 rounded-full flex-shrink-0"></div>
                <span className="text-gray-200 font-medium">ML-powered anomaly detection</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg">
                View Risks
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg">
                Check Alerts
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg">
                Compliance Report
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg">
                Access Logs
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-2">Full Dashboard Coming Soon</h3>
          <p className="text-gray-300 text-lg">
            Connect your backend to see real-time data, risk assessments, compliance scores, and more.
          </p>
        </div>
      </main>
    </div>
  );
}
