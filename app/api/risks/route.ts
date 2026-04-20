import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getPrivacyRisks,
  updateRiskStatus,
  logSystemEvent,
  createPrivacyRisk,
  getDatabase,
} from "@/lib/db-operations";
import { hipaaChecks, dpdpaChecks, calculateRiskScore } from "@/lib/compliance-engine";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const risks = await getPrivacyRisks(severity || undefined, status || undefined, limit);

    await logSystemEvent("info", "privacy-risks-api", `Fetched ${risks.length} privacy risks`, {
      userId: session.user?.email,
      severity,
      status,
    });

    return NextResponse.json(risks);
  } catch (error) {
    await logSystemEvent("error", "privacy-risks-api", `Error fetching risks: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      affectedSystems,
      affectedDataTypes,
      likelihood,
      impact,
      framework,
    } = body;

    const riskScore = calculateRiskScore(likelihood, impact);

    const risk = {
      riskId: `RISK-${Date.now()}`,
      title,
      description,
      category,
      severity: riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : "medium",
      affectedSystems: affectedSystems?.map((id: string) => new ObjectId(id)) || [],
      affectedDataTypes,
      rootCause: "",
      riskScore,
      likelihood,
      impact,
      detectionMethod: "manual" as const,
      detectedAt: new Date(),
      status: "open" as const,
      relatedFrameworks: [framework],
      evidence: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await createPrivacyRisk(risk);

    await logSystemEvent("info", "privacy-risks-api", "Created new privacy risk", {
      riskId: risk.riskId,
      userId: session.user?.email,
    });

    return NextResponse.json({ _id: result.insertedId, ...risk });
  } catch (error) {
    await logSystemEvent("error", "privacy-risks-api", `Error creating risk: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
