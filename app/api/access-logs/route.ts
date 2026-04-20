import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAccessLogs,
  logSystemEvent,
  logAccess,
  getAnomalousAccessLogs,
} from "@/lib/db-operations";
import { analyzeAccessPattern, calculateBaseline, detectAnomalies } from "@/lib/compliance-engine";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const systemId = searchParams.get("systemId");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const days = parseInt(searchParams.get("days") || "30");

    let logs;

    if (type === "anomalies") {
      logs = await getAnomalousAccessLogs(50, days);
    } else {
      logs = await getAccessLogs(
        systemId ? new ObjectId(systemId) : undefined,
        userId ? new ObjectId(userId) : undefined,
        100,
        days,
      );
    }

    const pattern = analyzeAccessPattern(logs);

    await logSystemEvent("info", "access-logs-api", `Fetched ${logs.length} access logs`, {
      userId: session.user?.email,
      systemId,
      type,
    });

    return NextResponse.json({
      logs,
      pattern,
      summary: {
        total: logs.length,
        anomalies: logs.filter((l: any) => l.anomalyDetected).length,
      },
    });
  } catch (error) {
    await logSystemEvent("error", "access-logs-api", `Error fetching logs: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, systemId, action, dataAccessed, ipAddress, duration } = body;

    // Get baseline for anomaly detection
    const recentLogs = await getAccessLogs(
      new ObjectId(systemId),
      new ObjectId(userId),
      100,
      30,
    );

    const baseline = calculateBaseline(recentLogs);

    const currentAccess = {
      volume: dataAccessed?.length || 0,
      timestamp: new Date(),
    };

    const anomalyDetection = detectAnomalies(currentAccess, baseline);

    const accessLog = {
      userId: new ObjectId(userId),
      systemId: new ObjectId(systemId),
      action,
      dataAccessed,
      ipAddress,
      timestamp: new Date(),
      duration,
      status: "success" as const,
      riskScore: anomalyDetection.isAnomaly ? 0.7 : 0.3,
      anomalyDetected: anomalyDetection.isAnomaly,
      anomalyType: anomalyDetection.anomalyType,
    };

    const result = await logAccess(accessLog);

    await logSystemEvent(
      anomalyDetection.isAnomaly ? "warn" : "info",
      "access-logs-api",
      `Access logged: ${action}`,
      {
        accessLogId: result.insertedId,
        anomalyDetected: anomalyDetection.isAnomaly,
      },
    );

    return NextResponse.json({
      _id: result.insertedId,
      ...accessLog,
      anomalyScore: anomalyDetection.score,
    });
  } catch (error) {
    await logSystemEvent("error", "access-logs-api", `Error logging access: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
