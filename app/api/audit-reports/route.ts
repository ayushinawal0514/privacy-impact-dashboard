import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAuditReports,
  createAuditReport,
  getPrivacyRisks,
  getDatabase,
  logSystemEvent,
} from "@/lib/db-operations";
import { determineSeverity } from "@/lib/compliance-engine";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const reportId = searchParams.get("reportId");

    if (reportId) {
      // Get specific report
      const db = await getDatabase();
      const report = await db
        .collection("audit_reports")
        .findOne({ _id: new ObjectId(reportId) });
      return NextResponse.json(report);
    }

    const reports = await getAuditReports(
      organizationId ? new ObjectId(organizationId) : undefined,
      20,
    );

    await logSystemEvent("info", "audit-api", `Retrieved ${reports.length} audit reports`, {
      userId: session.user?.email,
    });

    return NextResponse.json(reports);
  } catch (error) {
    await logSystemEvent("error", "audit-api", `Error fetching reports: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "auditor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      scope,
      framework,
      startDate,
      endDate,
      organizationId,
    } = body;

    // Get risks within date range
    const db = await getDatabase();
    const risks = await db
      .collection("privacy_risks")
      .find({
        detectedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .toArray();

    // Categorize findings
    const findings = categorizeFindings(risks);

    const report = {
      reportId: `AUDIT-${Date.now()}`,
      title,
      scope,
      framework,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "draft",
      findings,
      executiveSummary: generateExecutiveSummary(findings),
      detailedFindings: generateDetailedFindings(risks),
      recommendations: generateAuditRecommendations(risks),
      generatedBy: new ObjectId((session.user as any)?.id || "000000000000000000000000"),
      generatedAt: new Date(),
      attachments: [],
    };

    const result = await createAuditReport(report);

    await logSystemEvent("info", "audit-api", "Audit report created", {
      reportId: report.reportId,
      userId: session.user?.email,
    });

    return NextResponse.json({
      _id: result.insertedId,
      ...report,
    });
  } catch (error) {
    await logSystemEvent("error", "audit-api", `Error creating report: ${error}`, {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function categorizeFindings(risks: any[]) {
  const categories = new Map<string, number>();
  const severities = new Map<string, number>();

  risks.forEach((risk) => {
    categories.set(risk.category, (categories.get(risk.category) || 0) + 1);
    severities.set(risk.severity, (severities.get(risk.severity) || 0) + 1);
  });

  const findings = [];

  categories.forEach((count, category) => {
    const sev = severities.get(
      ["critical", "high", "medium", "low"].find(
        (s) =>
          risks.filter((r: any) => r.category === category && r.severity === s).length > 0,
      ) || "low",
    ) || 1;

    findings.push({
      category,
      count,
      severity: determineSeverity(count * 10),
    });
  });

  return findings;
}

function generateExecutiveSummary(findings: any[]): string {
  const totalIssues = findings.reduce((sum: number, f: any) => sum + f.count, 0);
  const criticalCount = findings.filter((f: any) => f.severity === "critical").length;

  return `This audit report documents ${totalIssues} compliance findings across ${findings.length} categories. 
${criticalCount > 0 ? `${criticalCount} critical issues require immediate attention.` : "No critical issues identified at this time."} 
Detailed recommendations are provided below for remediation.`;
}

function generateDetailedFindings(risks: any[]): string {
  return risks.map((r: any) => `[${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join("\n");
}

function generateAuditRecommendations(risks: any[]): string[] {
  const recommendations: string[] = [];
  const categories = new Set(risks.map((r: any) => r.category));

  if (categories.has("encryption_failure")) {
    recommendations.push(
      "Implement AES-256 encryption for all data at rest and TLS 1.3 for data in transit",
    );
  }

  if (categories.has("excessive_permissions")) {
    recommendations.push("Implement principle of least privilege with regular access reviews");
  }

  if (categories.has("unauthorized_access")) {
    recommendations.push("Strengthen authentication and implement MFA for privileged accounts");
  }

  if (categories.has("abnormal_movement")) {
    recommendations.push("Deploy DLP solutions and anomaly detection systems");
  }

  if (recommendations.length === 0) {
    recommendations.push("Maintain current security posture with regular audits");
  }

  return recommendations;
}
