export type RiskSeverity = "critical" | "high" | "medium" | "low";

export interface RuleRisk {
  recordId: string;
  severity: RiskSeverity;
  category: string;
  ruleId: string;
  description: string;
  recommendation: string;
}

export interface RequirementScore {
  passed: number;
  failed: number;
  score: number;
}

export interface ComplianceResult {
  hipaaScore: number;
  dpdpaScore: number;
  overallScore: number;
  passedRules: number;
  failedRules: number;
  requirements: {
    encryption: RequirementScore;
    consent: RequirementScore;
    accessControl: RequirementScore;
    auditLogging: RequirementScore;
    retention: RequirementScore;
  };
}

export interface AnalysisResult {
  risks: RuleRisk[];
  compliance: ComplianceResult;
  summary: {
    totalRecords: number;
    totalRisks: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

function toScore(passed: number, failed: number): number {
  return Math.round((passed / Math.max(1, passed + failed)) * 100);
}

function normalizeRecords(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.patients)) return input.patients;
  if (Array.isArray(input?.records)) return input.records;
  if (Array.isArray(input?.users)) return input.users;
  return [];
}

export function analyzeHealthcareDataset(input: any): AnalysisResult {
  const records = normalizeRecords(input);
  const risks: RuleRisk[] = [];

  let encryptionPassed = 0;
  let encryptionFailed = 0;
  let consentPassed = 0;
  let consentFailed = 0;
  let accessPassed = 0;
  let accessFailed = 0;
  let auditPassed = 0;
  let auditFailed = 0;
  let retentionPassed = 0;
  let retentionFailed = 0;

  for (const record of records) {
    const recordId =
      record.patient_id ||
      record.userId ||
      record.email ||
      "unknown-record";

    // 1. Encryption
    if (record.encrypted === true) {
      encryptionPassed++;
    } else {
      encryptionFailed++;
      risks.push({
        recordId,
        severity: "critical",
        category: "Encryption Status Check",
        ruleId: "encryption_required",
        description: "Sensitive healthcare data is not encrypted at rest.",
        recommendation: "Enable encryption for stored healthcare records.",
      });
    }

    // 2. Consent
    if (record.consent_obtained === true) {
      consentPassed++;
    } else {
      consentFailed++;
      risks.push({
        recordId,
        severity: "high",
        category: "Consent Management",
        ruleId: "consent_required",
        description: "Patient consent is missing for this healthcare record.",
        recommendation: "Obtain and record explicit patient consent.",
      });
    }

    // 3. Access control
    const validRoles = ["doctor", "nurse", "admin"];
    if (validRoles.includes(String(record.access_role || "").toLowerCase())) {
      accessPassed++;
    } else {
      accessFailed++;
      risks.push({
        recordId,
        severity: "high",
        category: "Access Control",
        ruleId: "valid_access_role",
        description: "Invalid or unauthorized access role detected.",
        recommendation: "Restrict access to approved healthcare roles only.",
      });
    }

    // 4. Audit logging
    if (record.audit_log_enabled === true) {
      auditPassed++;
    } else {
      auditFailed++;
      risks.push({
        recordId,
        severity: "critical",
        category: "Audit Logging",
        ruleId: "audit_logging_required",
        description: "Audit logging is disabled for this record.",
        recommendation: "Enable audit logging to maintain traceability.",
      });
    }

    // 5. Retention
    const retentionDays = Number(record.retention_policy_days || 0);
    if (retentionDays > 0 && retentionDays <= 365) {
      retentionPassed++;
    } else {
      retentionFailed++;
      risks.push({
        recordId,
        severity: "medium",
        category: "Data Retention",
        ruleId: "retention_policy_valid",
        description: "Retention period exceeds acceptable compliance limits.",
        recommendation: "Reduce retention period according to policy.",
      });
    }
  }

  const totalChecks =
    encryptionPassed + encryptionFailed +
    consentPassed + consentFailed +
    accessPassed + accessFailed +
    auditPassed + auditFailed +
    retentionPassed + retentionFailed;

  const totalPassed =
    encryptionPassed +
    consentPassed +
    accessPassed +
    auditPassed +
    retentionPassed;

  const overallScore = Math.round((totalPassed / Math.max(1, totalChecks)) * 100);

  const hipaaDenominator =
    encryptionPassed + encryptionFailed +
    accessPassed + accessFailed +
    auditPassed + auditFailed;

  const dpdpaDenominator =
    consentPassed + consentFailed +
    retentionPassed + retentionFailed;

  const hipaaScore = Math.round(
    ((encryptionPassed + accessPassed + auditPassed) / Math.max(1, hipaaDenominator)) * 100
  );

  const dpdpaScore = Math.round(
    ((consentPassed + retentionPassed) / Math.max(1, dpdpaDenominator)) * 100
  );

  return {
    risks,
    compliance: {
      hipaaScore,
      dpdpaScore,
      overallScore,
      passedRules: totalPassed,
      failedRules: totalChecks - totalPassed,
      requirements: {
        encryption: {
          passed: encryptionPassed,
          failed: encryptionFailed,
          score: toScore(encryptionPassed, encryptionFailed),
        },
        consent: {
          passed: consentPassed,
          failed: consentFailed,
          score: toScore(consentPassed, consentFailed),
        },
        accessControl: {
          passed: accessPassed,
          failed: accessFailed,
          score: toScore(accessPassed, accessFailed),
        },
        auditLogging: {
          passed: auditPassed,
          failed: auditFailed,
          score: toScore(auditPassed, auditFailed),
        },
        retention: {
          passed: retentionPassed,
          failed: retentionFailed,
          score: toScore(retentionPassed, retentionFailed),
        },
      },
    },
    summary: {
      totalRecords: records.length,
      totalRisks: risks.length,
      critical: risks.filter((r) => r.severity === "critical").length,
      high: risks.filter((r) => r.severity === "high").length,
      medium: risks.filter((r) => r.severity === "medium").length,
      low: risks.filter((r) => r.severity === "low").length,
    },
  };
}