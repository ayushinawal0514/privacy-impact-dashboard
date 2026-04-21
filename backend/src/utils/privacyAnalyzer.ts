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
    const { hipaaScore, dpdpaScore } = this.calculateComplianceScores(ruleResults);
    const overallScore = (hipaaScore + dpdpaScore) / 2;

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

  private calculateComplianceScores(ruleResults: RuleCheckResult[]): { hipaaScore: number; dpdpaScore: number } {
    const hipaaRules = ruleResults.filter(r => r.ruleName.includes('HIPAA') || 
      r.ruleName.includes('Access') || 
      r.ruleName.includes('Encryption') ||
      r.ruleName.includes('Audit'));
    
    const dpdpaRules = ruleResults.filter(r => r.ruleName.includes('DPDP') ||
      r.ruleName.includes('Consent') ||
      r.ruleName.includes('Minimization') ||
      r.ruleName.includes('Retention'));

    const hipaaScore = this.calculateScore(hipaaRules);
    const dpdpaScore = this.calculateScore(dpdpaRules);

    return { hipaaScore, dpdpaScore };
  }

  private calculateScore(rules: RuleCheckResult[]): number {
    if (rules.length === 0) return 100;

    const severityWeight: Record<string, number> = {
      'critical': 40,
      'high': 25,
      'medium': 15,
      'low': 10
    };

    let totalWeight = 0;
    let failedWeight = 0;

    for (const rule of rules) {
      const weight = severityWeight[rule.severity] || 10;
      totalWeight += weight;

      if (!rule.passed) {
        failedWeight += weight;
      }
    }

    return Math.max(0, 100 - (failedWeight / totalWeight) * 100);
  }

  private summarizeRisks(ruleResults: RuleCheckResult[], anomalies: AnomalyDetectionResult[]): 
    { critical: number; high: number; medium: number; low: number } {
    const summary = { critical: 0, high: 0, medium: 0, low: 0 };

    // Count failed rules by severity
    for (const rule of ruleResults) {
      if (!rule.passed) {
        const severity = rule.severity as keyof typeof summary;
        summary[severity]++;
      }
    }

    // Count anomalies by severity
    for (const anomaly of anomalies) {
      const severity = anomaly.severity as keyof typeof summary;
      summary[severity]++;
    }

    return summary;
  }

  private generateRecommendations(
    ruleResults: RuleCheckResult[],
    anomalies: AnomalyDetectionResult[],
    riskSummary: { critical: number; high: number; medium: number; low: number }
  ): string[] {
    const recommendations: string[] = [];

    // Add recommendations for failed rules
    const failedRules = ruleResults.filter(r => !r.passed);
    for (const rule of failedRules.slice(0, 5)) {
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
        case 'breach_001':
          recommendations.push('Develop and document breach response plan with notification procedures');
          break;
      }
    }

    // Add recommendations for high-severity anomalies
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
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
      }
    }

    // General recommendations based on risk summary
    if (riskSummary.critical > 0) {
      recommendations.unshift('URGENT: Address critical-severity risks immediately');
    }

    if (riskSummary.high > 3) {
      recommendations.push('Conduct comprehensive security audit to identify root causes');
    }

    // Add compliance recommendations
    if (recommendations.length < 5) {
      recommendations.push('Schedule regular compliance training for IT and security staff');
      recommendations.push('Implement continuous compliance monitoring');
    }

    return recommendations.slice(0, 10);
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
      const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
      summary += `${criticalAnomalies} critical anomalies detected. `;
    }

    summary += 'Review recommendations and take immediate action on critical items.';

    return summary;
  }
}

export const privacyAnalyzer = new PrivacyAnalyzer();
