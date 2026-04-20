import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  saveComplianceScore,
  getComplianceScore,
  getPrivacyRisks,
  logSystemEvent,
  getDatabase,
} from "@/lib/db-operations";
import { hipaaChecks, dpdpaChecks, calculateComplianceScore, determineSeverity, calculateRiskScore } from "@/lib/compliance-engine";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const framework = searchParams.get("framework") || "overall";

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId required" }, { status: 400 });
    }

    const score = await getComplianceScore(new ObjectId(organizationId), framework);

    if (!score) {
      return NextResponse.json(
        { message: "No compliance score computed yet" },
        { status: 404 },
      );
    }

    return NextResponse.json(score);
  } catch (error) {
    await logSystemEvent("error", "compliance-api", `Error fetching score: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "compliance_officer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      organizationId,
      systemId,
      framework,
      checksData,
    } = body;

    const db = await getDatabase();
    let risks = [];
    let detectedIssues = 0;

    // Run compliance checks based on framework
    if (framework === "HIPAA" || framework === "all") {
      if (checksData.encryptionEnabled === false) {
        const risk = hipaaChecks.checkDataEncryption(false, checksData.storageLocation);
        if (risk) {
          risks.push(risk);
          detectedIssues++;
        }
      }

      if (!checksData.accessControlsEnabled || checksData.unusualAccessCount > 10) {
        const risk = hipaaChecks.checkAccessControls(
          checksData.accessControlsEnabled,
          checksData.unusualAccessCount,
        );
        if (risk) {
          risks.push(risk);
          detectedIssues++;
        }
      }

      if (!checksData.auditEnabled || checksData.auditRetentionDays < 365) {
        const risk = hipaaChecks.checkAuditLogging(
          checksData.auditEnabled,
          checksData.auditRetentionDays,
        );
        if (risk) {
          risks.push(risk);
          detectedIssues++;
        }
      }
    }

    if (framework === "DPDPA" || framework === "all") {
      if (!checksData.consentRecorded) {
        const risk = dpdpaChecks.checkConsentManagement(false);
        if (risk) {
          risks.push(risk);
          detectedIssues++;
        }
      }

      if (checksData.unnecessaryDataTypes?.length > 0) {
        const risk = dpdpaChecks.checkDataMinimization(
          checksData.accessibleDataTypes,
          checksData.necessaryDataTypes,
        );
        if (risk) {
          risks.push(risk);
          detectedIssues++;
        }
      }

      if (checksData.retentionPeriodDays > checksData.legalRetentionDays) {
        const risk = dpdpaChecks.checkDataRetention(
          checksData.retentionPeriodDays,
          checksData.legalRetentionDays,
        );
        if (risk) {
          risks.push(risk);
          detectedIssues++;
        }
      }
    }

    // Save detected risks
    for (const risk of risks) {
      await db.collection("privacy_risks").insertOne(risk);
    }

    // Calculate compliance score
    const totalRequirements = checksData.totalRequirements || 10;
    const metRequirements = totalRequirements - detectedIssues;
    const criticalsMet = Math.max(0, checksData.criticalRequirements - (detectedIssues > checksData.criticalRequirements ? checksData.criticalRequirements : detectedIssues));
    const score = calculateComplianceScore(
      totalRequirements,
      metRequirements,
      criticalsMet,
      checksData.criticalRequirements || 3,
    );

    const complianceScore = {
      organizationId: organizationId ? new ObjectId(organizationId) : undefined,
      systemId: systemId ? new ObjectId(systemId) : undefined,
      framework,
      overallScore: score,
      categoryScores: {
        dataProtection: checksData.encryptionEnabled ? 85 : 20,
        accessControl: checksData.accessControlsEnabled ? 90 : 30,
        encryption: checksData.encryptionEnabled ? 95 : 10,
        auditTrail: checksData.auditEnabled ? 80 : 25,
        policyCompliance: score,
      },
      riskLevel: score >= 80 ? "low" : score >= 60 ? "medium" : "high",
      lastComputedAt: new Date(),
      nextComputedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      recommendations: generateRecommendations(detectedIssues, framework),
      trends: [],
    };

    await saveComplianceScore(complianceScore);

    await logSystemEvent("info", "compliance-api", "Compliance check completed", {
      framework,
      score,
      risksDetected: detectedIssues,
      userId: session.user?.email,
    });

    return NextResponse.json({
      score: complianceScore,
      risksDetected: risks,
      detectedIssues,
    });
  } catch (error) {
    await logSystemEvent("error", "compliance-api", `Error running compliance check: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateRecommendations(detectedIssues: number, framework: string): string[] {
  const recommendations: string[] = [];

  if (detectedIssues > 0) {
    if (framework === "HIPAA" || framework === "all") {
      recommendations.push("Enable encryption for all PHI storage locations");
      recommendations.push("Implement role-based access controls for healthcare systems");
      recommendations.push("Enable comprehensive audit logging for at least 6 years");
      recommendations.push("Conduct regular security awareness training");
    }

    if (framework === "DPDPA" || framework === "all") {
      recommendations.push("Implement structured consent management system");
      recommendations.push("Review and minimize data collection to necessary fields only");
      recommendations.push("Establish automated data retention and deletion policies");
      recommendations.push("Maintain audit trail of all data processing activities");
    }
  }

  recommendations.push("Schedule regular compliance audits");
  recommendations.push("Update security policies according to latest standards");

  return recommendations.slice(0, 5);
}
