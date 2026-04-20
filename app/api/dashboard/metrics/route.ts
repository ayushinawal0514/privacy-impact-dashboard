import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getDashboardMetrics,
  getPrivacyRisks,
  getAccessLogs,
  getLatestComplianceScores,
  getDatabase,
  logSystemEvent,
} from "@/lib/db-operations";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const timeRange = searchParams.get("timeRange") || "24h";

    const db = await getDatabase();

    // Get metrics
    const metrics = await getDashboardMetrics(
      organizationId ? new ObjectId(organizationId) : undefined,
    );

    // Get recent risks
    const [criticalRisks, allRisks] = await Promise.all([
      getPrivacyRisks("critical", "open", 10),
      getPrivacyRisks(undefined, "open", 50),
    ]);

    // Get recent access anomalies
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1;
    const recentLogs = await getAccessLogs(undefined, undefined, 100, days);
    const anomalies = recentLogs.filter((log: any) => log.anomalyDetected);

    // Get compliance trends
    const complianceScores = organizationId
      ? await getLatestComplianceScores(new ObjectId(organizationId), 10)
      : [];

    // Risk distribution
    const riskDistribution = {
      critical: allRisks.filter((r: any) => r.severity === "critical").length,
      high: allRisks.filter((r: any) => r.severity === "high").length,
      medium: allRisks.filter((r: any) => r.severity === "medium").length,
      low: allRisks.filter((r: any) => r.severity === "low").length,
    };

    await logSystemEvent("info", "dashboard-api", "Dashboard metrics retrieved", {
      userId: session.user?.email,
      timeRange,
    });

    return NextResponse.json({
      metrics,
      criticalRisks,
      anomalies,
      riskDistribution,
      complianceTrend: complianceScores,
      summary: {
        totalRisks: allRisks.length,
        activeAnomalies: anomalies.length,
        complianceScore: metrics.complianceScore,
      },
    });
  } catch (error) {
    await logSystemEvent("error", "dashboard-api", `Error fetching metrics: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
