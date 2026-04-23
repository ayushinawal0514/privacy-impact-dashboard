// Rule Engine for Privacy Impact Assessment
// Implements HIPAA and DPDP (India) compliance rules

export interface PrivacyRule {
  id: string;
  name: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  check: (data: any) => boolean;
}

export interface RuleCheckResult {
  ruleId: string;
  ruleName: string;
  severity: string;
  passed: boolean;
  details: string;
  riskCount: number;
}

class RuleEngine {
  private rules: PrivacyRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // HIPAA Rules
    this.addRule({
      id: 'hipaa_001',
      name: 'Excessive Permissions Detection',
      category: 'HIPAA',
      severity: 'high',
      description: 'Check for users with excessive admin/read permissions on PHI',
      check: (data: any) => {
        if (!data.permissions || data.permissions.length === 0) return true;
        const adminCount = data.permissions.filter((p: any) => 
          p.level === 'admin' || p.level === 'write'
        ).length;
        // Flag if > 30% of users have admin/write access
        return (adminCount / data.permissions.length) <= 0.3;
      }
    });

    this.addRule({
      id: 'hipaa_002',
      name: 'Encryption Status Check',
      category: 'HIPAA',
      severity: 'critical',
      description: 'Verify all sensitive data is encrypted at rest and in transit',
      check: (data: any) => {
        if (!data.dataItems || data.dataItems.length === 0) return true;
        const unencrypted = data.dataItems.filter((item: any) => 
          (item.isSensitive || item.dataType === 'PHI') && 
          (!item.encrypted || item.encryptionType === 'none')
        );
        return unencrypted.length === 0;
      }
    });

    this.addRule({
      id: 'hipaa_003',
      name: 'Access Control List (ACL) Verification',
      category: 'HIPAA',
      severity: 'high',
      description: 'Ensure proper role-based access controls are in place',
      check: (data: any) => {
        if (!data.accessControl) return false;
        return (
          data.accessControl.enabled === true &&
          data.accessControl.rolesCount >= 3 &&
          data.accessControl.hasAuditLog === true
        );
      }
    });

    // DPDP (India's Digital Personal Data Protection) Rules
    this.addRule({
      id: 'dpdp_001',
      name: 'Data Minimization',
      category: 'DPDP',
      severity: 'high',
      description: 'Collect only necessary personal data',
      check: (data: any) => {
        if (!data.dataCollection) return true;
        // Check if data collection is justified
        return data.dataCollection.minimized === true;
      }
    });

    this.addRule({
      id: 'dpdp_002',
      name: 'Consent Tracking',
      category: 'DPDP',
      severity: 'high',
      description: 'Verify explicit consent is collected and tracked',
      check: (data: any) => {
        if (!data.users || data.users.length === 0) return true;
        const withConsent = data.users.filter((u: any) => 
          u.consentGiven === true && u.consentDate
        ).length;
        // At least 95% should have explicit consent
        return (withConsent / data.users.length) >= 0.95;
      }
    });

    this.addRule({
      id: 'dpdp_003',
      name: 'Data Retention Policy',
      category: 'DPDP',
      severity: 'medium',
      description: 'Ensure data is deleted after retention period expires',
      check: (data: any) => {
        if (!data.retentionPolicy) return false;
        return (
          data.retentionPolicy.enabled === true &&
          data.retentionPolicy.maxRetentionDays &&
          data.retentionPolicy.maxRetentionDays <= 2190 // 6 years max
        );
      }
    });

    // Data Sharing & Third-Party Rules
    this.addRule({
      id: 'sharing_001',
      name: 'Unauthorized Data Sharing Detection',
      category: 'Data Sharing',
      severity: 'critical',
      description: 'Detect any unauthorized third-party data sharing',
      check: (data: any) => {
        if (!data.dataSharing || data.dataSharing.length === 0) return true;
        const unauthorized = data.dataSharing.filter((share: any) => 
          !share.approved || share.consentProvided !== true
        );
        return unauthorized.length === 0;
      }
    });

    this.addRule({
      id: 'sharing_002',
      name: 'Third-Party Risk Assessment',
      category: 'Data Sharing',
      severity: 'high',
      description: 'Verify third-party vendors have proper security measures',
      check: (data: any) => {
        if (!data.thirdParties || data.thirdParties.length === 0) return true;
        const riskAssessed = data.thirdParties.filter((vendor: any) =>
          vendor.securityAssessmentDone === true &&
          vendor.complianceCertified === true
        ).length;
        return (riskAssessed / data.thirdParties.length) >= 0.9;
      }
    });

    // Audit & Logging Rules
    this.addRule({
      id: 'audit_001',
      name: 'Audit Logging Enabled',
      category: 'Audit',
      severity: 'high',
      description: 'Ensure comprehensive audit logging of data access',
      check: (data: any) => {
        return (
          data.auditLogging === true &&
          data.logRetention >= 90 // At least 90 days
        );
      }
    });

    this.addRule({
      id: 'audit_002',
      name: 'Failed Access Attempt Monitoring',
      category: 'Audit',
      severity: 'medium',
      description: 'Track and monitor failed access attempts',
      check: (data: any) => {
        if (!data.accessAttempts) return false;
        return (
          data.accessAttempts.failedAttemptTracking === true &&
          data.accessAttempts.alertThreshold >= 3
        );
      }
    });

    // Data Breach Response Rules
    this.addRule({
      id: 'breach_001',
      name: 'Breach Incident Response Plan',
      category: 'Breach Response',
      severity: 'critical',
      description: 'Have documented breach response and notification procedures',
      check: (data: any) => {
        return (
          data.breachResponsePlan === true &&
          data.notificationProcedure === true &&
          data.maxNotificationDays &&
          data.maxNotificationDays <= 72 // GDPR/DPDP requirement
        );
      }
    });
  }

  addRule(rule: PrivacyRule) {
    this.rules.push(rule);
  }

  checkRules(data: any): RuleCheckResult[] {
    const results: RuleCheckResult[] = [];

    for (const rule of this.rules) {
      try {
        const passed = rule.check(data);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          passed,
          details: passed 
            ? `✓ ${rule.description}` 
            : `✗ ${rule.description}`,
          riskCount: passed ? 0 : 1
        });
      } catch (error) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          passed: false,
          details: `Error checking rule: ${(error as Error).message}`,
          riskCount: 1
        });
      }
    }

    return results;
  }

  getRulesByCategory(category: string): PrivacyRule[] {
    return this.rules.filter(r => r.category === category);
  }

  getAllRules(): PrivacyRule[] {
    return this.rules;
  }
}

export const ruleEngine = new RuleEngine();
