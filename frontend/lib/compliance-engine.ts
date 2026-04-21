import { PrivacyRisk, RiskSeverity, ComplianceViolation } from "@/types/models";

// ============== HIPAA Compliance Checks ==============
export const hipaaChecks = {
  checkDataEncryption: (encrypted: boolean, location: string): PrivacyRisk | null => {
    if (!encrypted) {
      return {
        title: "HIPAA: Unencrypted PHI Storage",
        description: `Protected Health Information (PHI) is stored unencrypted at ${location}`,
        category: "insecure_storage",
        severity: "critical",
        affectedSystems: [],
        affectedDataTypes: ["PHI"],
        rootCause: "Encryption not enabled for storage location",
        riskScore: 95,
        likelihood: 90,
        impact: 100,
        detectionMethod: "rule-based",
        detectedAt: new Date(),
        status: "open",
        relatedFrameworks: ["HIPAA"],
        evidence: [`Storage location: ${location}`],
        createdAt: new Date(),
        updatedAt: new Date(),
        riskId: `HIPAA-ENC-${Date.now()}`,
      };
    }
    return null;
  },

  checkAccessControls: (hasAccessControls: boolean, unusualAccessCount: number): PrivacyRisk | null => {
    if (!hasAccessControls || unusualAccessCount > 10) {
      return {
        title: "HIPAA: Inadequate Access Controls",
        description: `Insufficient access controls detected with ${unusualAccessCount} unusual access attempts`,
        category: "excessive_permissions",
        severity: "high",
        affectedSystems: [],
        affectedDataTypes: ["PHI"],
        rootCause: "Access control policies not properly implemented",
        riskScore: 85,
        likelihood: 80,
        impact: 90,
        detectionMethod: "rule-based",
        detectedAt: new Date(),
        status: "open",
        relatedFrameworks: ["HIPAA"],
        evidence: [`Unusual accesses: ${unusualAccessCount}`],
        createdAt: new Date(),
        updatedAt: new Date(),
        riskId: `HIPAA-AC-${Date.now()}`,
      };
    }
    return null;
  },

  checkAuditLogging: (auditEnabled: boolean, logsRetainedDays: number): PrivacyRisk | null => {
    if (!auditEnabled || logsRetainedDays < 365) {
      return {
        title: "HIPAA: Inadequate Audit Logging",
        description: `Audit logging is ${!auditEnabled ? "disabled" : `only retaining logs for ${logsRetainedDays} days`}`,
        category: "policy_violation",
        severity: "high",
        affectedSystems: [],
        affectedDataTypes: ["audit_logs"],
        rootCause: "Audit logging configuration does not meet HIPAA requirements",
        riskScore: 80,
        likelihood: 75,
        impact: 85,
        detectionMethod: "rule-based",
        detectedAt: new Date(),
        status: "open",
        relatedFrameworks: ["HIPAA"],
        evidence: [`Audit enabled: ${auditEnabled}`, `Retention days: ${logsRetainedDays}`],
        createdAt: new Date(),
        updatedAt: new Date(),
        riskId: `HIPAA-AUDIT-${Date.now()}`,
      };
    }
    return null;
  },
};

// ============== DPDPA Compliance Checks ==============
export const dpdpaChecks = {
  checkConsentManagement: (consentRecorded: boolean): PrivacyRisk | null => {
    if (!consentRecorded) {
      return {
        title: "DPDPA: Missing Consent Documentation",
        description: "Personal data processing without documented user consent",
        category: "policy_violation",
        severity: "critical",
        affectedSystems: [],
        affectedDataTypes: ["PII", "personal_data"],
        rootCause: "Consent management system not implemented",
        riskScore: 90,
        likelihood: 85,
        impact: 95,
        detectionMethod: "rule-based",
        detectedAt: new Date(),
        status: "open",
        relatedFrameworks: ["DPDPA"],
        evidence: ["No consent records found"],
        createdAt: new Date(),
        updatedAt: new Date(),
        riskId: `DPDPA-CONSENT-${Date.now()}`,
      };
    }
    return null;
  },

  checkDataMinimization: (accessibleDataTypes: string[], necessaryDataTypes: string[]): PrivacyRisk | null => {
    const unnecessaryAccess = accessibleDataTypes.filter((d) => !necessaryDataTypes.includes(d));
    if (unnecessaryAccess.length > 0) {
      return {
        title: "DPDPA: Excessive Data Access",
        description: `Access to unnecessary data types: ${unnecessaryAccess.join(", ")}`,
        category: "excessive_permissions",
        severity: "high",
        affectedSystems: [],
        affectedDataTypes: unnecessaryAccess,
        rootCause: "Data minimization principle not followed",
        riskScore: 75,
        likelihood: 70,
        impact: 80,
        detectionMethod: "rule-based",
        detectedAt: new Date(),
        status: "open",
        relatedFrameworks: ["DPDPA"],
        evidence: [`Unnecessary data types: ${unnecessaryAccess.join(", ")}`],
        createdAt: new Date(),
        updatedAt: new Date(),
        riskId: `DPDPA-MINIM-${Date.now()}`,
      };
    }
    return null;
  },

  checkDataRetention: (retentionPeriodDays: number, legalRetentionDays: number): PrivacyRisk | null => {
    if (retentionPeriodDays > legalRetentionDays) {
      return {
        title: "DPDPA: Excessive Data Retention",
        description: `Data retained for ${retentionPeriodDays} days, exceeds legal limit of ${legalRetentionDays} days`,
        category: "policy_violation",
        severity: "high",
        affectedSystems: [],
        affectedDataTypes: ["personal_data"],
        rootCause: "Data retention policy not compliant",
        riskScore: 70,
        likelihood: 65,
        impact: 75,
        detectionMethod: "rule-based",
        detectedAt: new Date(),
        status: "open",
        relatedFrameworks: ["DPDPA"],
        evidence: [`Retention: ${retentionPeriodDays}d`, `Legal limit: ${legalRetentionDays}d`],
        createdAt: new Date(),
        updatedAt: new Date(),
        riskId: `DPDPA-RETENTION-${Date.now()}`,
      };
    }
    return null;
  },
};

// ============== Risk Calculations ==============
export function calculateRiskScore(
  likelihood: number, // 0-100
  impact: number, // 0-100
  remediationDays?: number,
): number {
  let baseScore = (likelihood * impact) / 100;

  // Add temporal factor - recent risks score higher
  if (remediationDays) {
    const timeDecay = Math.min(remediationDays / 30, 1); // Max 30 day decay
    baseScore = baseScore * (1 + timeDecay * 0.3);
  }

  return Math.min(Math.round(baseScore), 100);
}

export function determineSeverity(riskScore: number): RiskSeverity {
  if (riskScore >= 80) return "critical";
  if (riskScore >= 60) return "high";
  if (riskScore >= 40) return "medium";
  if (riskScore >= 20) return "low";
  return "info";
}

export function calculateComplianceScore(
  totalRequirements: number,
  metRequirements: number,
  criticalsMetRequirements: number,
  totalCriticals: number,
): number {
  if (totalRequirements === 0) return 100;

  const basicCompliance = (metRequirements / totalRequirements) * 100;
  const criticalWeight = totalCriticals > 0 ? (criticalsMetRequirements / totalCriticals) * 40 : 0;
  const score = basicCompliance * 0.6 + criticalWeight;

  return Math.round(Math.min(Math.max(score, 0), 100));
}

// ============== Access Pattern Analysis ==============
export interface AccessPattern {
  avgAccessesPerDay: number;
  avgDataVolume: number;
  commonAccessTimes: number[];
  commonAccessLocations: string[];
  frequentAccessors: string[];
}

export function analyzeAccessPattern(accessLogs: any[]): AccessPattern {
  const timeDistribution = new Map<number, number>();
  const locationDistribution = new Map<string, number>();
  const userAccessCount = new Map<string, number>();
  let totalVolume = 0;

  accessLogs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours();
    timeDistribution.set(hour, (timeDistribution.get(hour) || 0) + 1);

    locationDistribution.set(log.ipAddress, (locationDistribution.get(log.ipAddress) || 0) + 1);

    userAccessCount.set(log.userId.toString(), (userAccessCount.get(log.userId.toString()) || 0) + 1);

    totalVolume += log.dataAccessed?.length || 0;
  });

  const commonAccessTimes = Array.from(timeDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => hour);

  const commonAccessLocations = Array.from(locationDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([location]) => location);

  const frequentAccessors = Array.from(userAccessCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([user]) => user);

  return {
    avgAccessesPerDay: accessLogs.length,
    avgDataVolume: totalVolume / Math.max(accessLogs.length, 1),
    commonAccessTimes,
    commonAccessLocations,
    frequentAccessors,
  };
}

// ============== Anomaly Detection Helpers ==============
export function calculateBaseline(accessLogs: any[], timeWindow = 30): Record<string, number> {
  const recentLogs = accessLogs.filter((log) => {
    const daysDiff = (Date.now() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= timeWindow;
  });

  if (recentLogs.length === 0) {
    return {
      avgFrequency: 0,
      avgVolume: 0,
      variability: 0,
    };
  }

  const frequencies = new Map<string, number>();
  let totalVolume = 0;

  recentLogs.forEach((log) => {
    const day = new Date(log.timestamp).toDateString();
    frequencies.set(day, (frequencies.get(day) || 0) + 1);
    totalVolume += log.dataAccessed?.length || 0;
  });

  const freqValues = Array.from(frequencies.values());
  const avgFrequency = freqValues.reduce((a, b) => a + b, 0) / freqValues.length;
  const avgVolume = totalVolume / freqValues.length;
  const variance =
    freqValues.reduce((sum, f) => sum + Math.pow(f - avgFrequency, 2), 0) / freqValues.length;
  const variability = Math.sqrt(variance);

  return {
    avgFrequency,
    avgVolume,
    variability,
  };
}

export function detectAnomalies(
  currentAccess: any,
  baseline: Record<string, number>,
  threshold = 2.5,
): { isAnomaly: boolean; anomalyType?: string; score: number } {
  const volumeDeviation = Math.abs(currentAccess.volume - baseline.avgVolume);
  const volumeZScore = volumeDeviation / Math.max(baseline.variability, 1);

  let anomalyScore = volumeZScore / 10;
  let anomalyType = "";

  if (volumeZScore > threshold) {
    anomalyScore = Math.max(anomalyScore, volumeZScore / 10);
    anomalyType = "unusual_volume";
  }

  const hour = new Date(currentAccess.timestamp).getHours();
  if (!baseline.commonAccessTimes?.includes(hour)) {
    anomalyScore += 0.2;
    anomalyType = anomalyType ? `${anomalyType},unusual_time` : "unusual_time";
  }

  return {
    isAnomaly: anomalyScore > 0.5,
    anomalyType,
    score: Math.min(anomalyScore, 1),
  };
}
