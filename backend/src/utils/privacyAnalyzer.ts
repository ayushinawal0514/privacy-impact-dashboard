// Privacy Analyzer Utility
// Orchestrates rule engine and anomaly detection to produce analysis results

import { ruleEngine, RuleCheckResult } from '../engines/ruleEngine';
import { anomalyDetector, AnomalyDetectionResult } from '../engines/anomalyDetector';

export interface PrivacyAnalysisInput {
  permissions?: any[];
  dataItems?: any[];
  accessControl?: any;
  dataCollection?: any;
  users?: any[];
  retentionPolicy?: any;
  dataSharing?: any[];
  thirdParties?: any[];
  auditLogging?: boolean;
  logRetention?: number;
  accessAttempts?: any;
  breachResponsePlan?: boolean;
  notificationProcedure?: boolean;
  maxNotificationDays?: number;
  accessLogs?: any[];
  dataExports?: any[];
  authLogs?: any[];
  sessions?: any[];
  privilegeChanges?: any[];
  dataAccess?: any[];
  geoLocationData?: any[];
  userHistoryMap?: Record<string, { avgAccess: number; stdDev: number }>;
}

export interface PrivacyAnalysisReport {
  ruleResults: RuleCheckResult[];
  anomalies: AnomalyDetectionResult[];
  complianceScore: number;
  hipaaCompliance: number;
  dpdpaCompliance: number;
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  summary: string;
}

export class PrivacyAnalyzer {
  analyze(data: PrivacyAnalysisInput): PrivacyAnalysisReport {
    // Run rule checks
    const ruleResults = ruleEngine.checkRules(data);

    // Detect anomalies
    const anomalies = anomalyDetector.detectAnomalies(data);

    // Calculate compliance scores
    const { hipaaScore, dpdpaScore } = this.calculateComplianceScores(ruleResults, anomalies);
    const overallScore = Math.max(0, Math.min(100, (hipaaScore + dpdpaScore) / 2));

    // Summarize risks
    const riskSummary = this.summarizeRisks(ruleResults, anomalies);

    // Generate recommendations
    const recommendations = this.generateRecommendations(ruleResults, anomalies, riskSummary);

    // Generate summary
    const summary = this.generateSummary(hipaaScore, dpdpaScore, riskSummary, anomalies);

    return {
      ruleResults,
      anomalies,
      complianceScore: Math.round(overallScore),
      hipaaCompliance: Math.round(hipaaScore),
      dpdpaCompliance: Math.round(dpdpaScore),
      riskSummary,
      recommendations,
      summary
    };
  }

  private calculateComplianceScores(
    ruleResults: RuleCheckResult[],
    anomalies: AnomalyDetectionResult[]
  ): { hipaaScore: number; dpdpaScore: number } {
    const hipaaRules = ruleResults.filter((r) => this.isHipaaRule(r));
    const dpdpaRules = ruleResults.filter((r) => this.isDpdpaRule(r));

    let hipaaScore = this.calculateScore(hipaaRules);
    let dpdpaScore = this.calculateScore(dpdpaRules);

    // Anomaly penalty so suspicious access / exports also affect compliance
    const criticalAnomalies = anomalies.filter((a) => a.severity === 'critical').length;
    const highAnomalies = anomalies.filter((a) => a.severity === 'high').length;
    const mediumAnomalies = anomalies.filter((a) => a.severity === 'medium').length;

    const anomalyPenalty = criticalAnomalies * 12 + highAnomalies * 7 + mediumAnomalies * 3;

    hipaaScore = Math.max(0, hipaaScore - anomalyPenalty);
    dpdpaScore = Math.max(0, dpdpaScore - Math.round(anomalyPenalty * 0.6));

    return { hipaaScore, dpdpaScore };
  }

  private isHipaaRule(rule: RuleCheckResult): boolean {
    const id = rule.ruleId.toLowerCase();
    const name = rule.ruleName.toLowerCase();

    return (
      id.startsWith('hipaa_') ||
      id.startsWith('audit_') ||
      id.startsWith('breach_') ||
      name.includes('encryption') ||
      name.includes('access control') ||
      name.includes('permissions') ||
      name.includes('audit') ||
      name.includes('breach')
    );
  }

  private isDpdpaRule(rule: RuleCheckResult): boolean {
    const id = rule.ruleId.toLowerCase();
    const name = rule.ruleName.toLowerCase();

    return (
      id.startsWith('dpdp_') ||
      id.startsWith('sharing_') ||
      name.includes('consent') ||
      name.includes('retention') ||
      name.includes('minimization') ||
      name.includes('sharing') ||
      name.includes('third-party') ||
      name.includes('third party')
    );
  }

  private calculateScore(rules: RuleCheckResult[]): number {
    if (rules.length === 0) return 100;

    const severityWeight: Record<string, number> = {
      critical: 45,
      high: 28,
      medium: 15,
      low: 8
    };

    let totalWeight = 0;
    let failedWeight = 0;

    for (const rule of rules) {
      const baseWeight = severityWeight[rule.severity] || 10;
      const countMultiplier = Math.max(1, rule.riskCount || 1);

      totalWeight += baseWeight;

      if (rule.passed === false) {
        failedWeight += baseWeight * countMultiplier;
      } else if (rule.passed === null) {
        // Partial / uncertain failures still reduce score a bit
        failedWeight += baseWeight * 0.5;
      }
    }

    const penaltyRatio = failedWeight / Math.max(totalWeight, 1);
    return Math.max(0, 100 - penaltyRatio * 100);
  }

  private summarizeRisks(
    ruleResults: RuleCheckResult[],
    anomalies: AnomalyDetectionResult[]
  ): { critical: number; high: number; medium: number; low: number } {
    const summary = { critical: 0, high: 0, medium: 0, low: 0 };

    // Count failed rules by severity, weighted by riskCount
    for (const rule of ruleResults) {
      if (rule.passed === false) {
        const severity = rule.severity as keyof typeof summary;
        summary[severity] += Math.max(1, rule.riskCount || 1);
      } else if (rule.passed === null) {
        const severity = rule.severity as keyof typeof summary;
        summary[severity] += 1;
      }
    }

    // Count anomalies by severity
    for (const anomaly of anomalies) {
      const severity = anomaly.severity as keyof typeof summary;
      summary[severity] += 1;
    }

    return summary;
  }

  private generateRecommendations(
    ruleResults: RuleCheckResult[],
    anomalies: AnomalyDetectionResult[],
    riskSummary: { critical: number; high: number; medium: number; low: number }
  ): string[] {
    const recommendations: string[] = [];

    const failedRules = ruleResults.filter((r) => r.passed === false);

    for (const rule of failedRules.slice(0, 6)) {
      switch (rule.ruleId) {
        case 'hipaa_001':
          recommendations.push('Implement principle of least privilege - reduce excessive user permissions');
          break;
        case 'hipaa_002':
          recommendations.push('Encrypt all sensitive PHI data - both at rest and in transit (AES-256 recommended)');
          break;
        case 'hipaa_003':
          recommendations.push('Implement comprehensive role-based access control (RBAC) system');
          break;
        case 'dpdp_001':
          recommendations.push('Review and minimize personal data collection - collect only necessary data');
          break;
        case 'dpdp_002':
          recommendations.push('Establish explicit consent tracking system for all data collection');
          break;
        case 'dpdp_003':
          recommendations.push('Implement automated data deletion process based on retention policies');
          break;
        case 'sharing_001':
          recommendations.push('Audit all third-party data sharing - require explicit consent and approval');
          break;
        case 'sharing_002':
          recommendations.push('Conduct security assessments of all third-party vendors');
          break;
        case 'audit_001':
          recommendations.push('Enable comprehensive audit logging with at least 90-day retention');
          break;
        case 'audit_002':
          recommendations.push('Track failed access attempts and investigate repeated suspicious behavior');
          break;
        case 'breach_001':
          recommendations.push('Develop and document breach response plan with notification procedures');
          break;
      }
    }

    const criticalAnomalies = anomalies.filter((a) => a.severity === 'critical');
    for (const anomaly of criticalAnomalies.slice(0, 3)) {
      switch (anomaly.type) {
        case 'bulk_data_export':
          recommendations.push('Investigate bulk data exports - implement DLP (Data Loss Prevention) controls');
          break;
        case 'privilege_escalation':
          recommendations.push('Review unauthorized privilege escalations - strengthen access control policies');
          break;
        case 'excessive_failed_logins':
          recommendations.push('Implement MFA (Multi-Factor Authentication) and account lockout policies');
          break;
        default:
          recommendations.push(`Investigate critical anomaly: ${anomaly.description}`);
          break;
      }
    }

    if (riskSummary.critical > 0) {
      recommendations.unshift('URGENT: Address critical-severity risks immediately');
    }

    if (riskSummary.high > 5) {
      recommendations.push('Conduct comprehensive security audit to identify systemic control gaps');
    }

    if (recommendations.length < 5) {
      recommendations.push('Schedule regular compliance training for IT and security staff');
      recommendations.push('Implement continuous compliance monitoring');
    }

    return Array.from(new Set(recommendations)).slice(0, 10);
  }

  private generateSummary(
    hipaaScore: number,
    dpdpaScore: number,
    riskSummary: { critical: number; high: number; medium: number; low: number },
    anomalies: AnomalyDetectionResult[]
  ): string {
    let summary = '';

    const overallScore = (hipaaScore + dpdpaScore) / 2;

    if (overallScore >= 80) {
      summary = '✓ Strong privacy compliance posture. ';
    } else if (overallScore >= 60) {
      summary = '⚠ Moderate privacy concerns detected. ';
    } else {
      summary = '✗ Significant privacy and compliance risks identified. ';
    }

    summary += `HIPAA compliance: ${Math.round(hipaaScore)}%, DPDP compliance: ${Math.round(dpdpaScore)}%. `;
    summary += `Risks detected: ${riskSummary.critical} critical, ${riskSummary.high} high. `;

    if (anomalies.length > 0) {
      const criticalAnomalyCount = anomalies.filter((a) => a.severity === 'critical').length;
      summary += `${criticalAnomalyCount} critical anomalies detected. `;
    }

    summary += 'Review recommendations and take immediate action on critical items.';

    return summary;
  }
}

export const privacyAnalyzer = new PrivacyAnalyzer();