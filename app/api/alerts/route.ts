import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDatabase, logSystemEvent } from "@/lib/db-operations";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const acknowledged = searchParams.get("acknowledged") === "false" ? false : undefined;
    const severity = searchParams.get("severity");
    const limit = parseInt(searchParams.get("limit") || "50");

    const db = await getDatabase();
    const query: any = {};

    if (acknowledged !== undefined) {
      query.acknowledged = acknowledged;
    }

    if (severity) {
      query.severity = severity;
    }

    const alerts = await db
      .collection("alerts")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(alerts);
  } catch (error) {
    await logSystemEvent("error", "alerts-api", `Error fetching alerts: ${error}`, {});
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
    const { action, alertId } = body;

    const db = await getDatabase();

    if (action === "acknowledge") {
      // Mark alert as acknowledged
      const result = await db.collection("alerts").updateOne(
        { _id: new ObjectId(alertId) },
        {
          $set: {
            acknowledged: true,
            acknowledgedBy: new ObjectId((session.user as any)?.id || "000000000000000000000000"),
            acknowledgedAt: new Date(),
          },
        },
      );

      await logSystemEvent("info", "alerts-api", "Alert acknowledged", {
        alertId,
        userId: session.user?.email,
      });

      return NextResponse.json({ success: result.modifiedCount > 0 });
    }

    if (action === "create") {
      // Create new alert
      const alert = {
        alertId: `ALERT-${Date.now()}`,
        type: body.type,
        severity: body.severity,
        title: body.title,
        description: body.description,
        sourceSystem: body.sourceSystem ? new ObjectId(body.sourceSystem) : undefined,
        relatedRisk: body.relatedRisk ? new ObjectId(body.relatedRisk) : undefined,
        timestamp: new Date(),
        acknowledged: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      const result = await db.collection("alerts").insertOne(alert);

      await logSystemEvent("info", "alerts-api", "Alert created", {
        alertId: alert.alertId,
        severity: alert.severity,
      });

      return NextResponse.json({ _id: result.insertedId, ...alert });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    await logSystemEvent("error", "alerts-api", `Error handling alert: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
