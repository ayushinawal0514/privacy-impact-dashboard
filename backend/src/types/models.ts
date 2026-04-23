import { ObjectId } from 'mongodb';
export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  organizationId: string;
  role: 'admin' | 'auditor' | 'user';
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}
export interface PrivacyRisk {
  _id?: ObjectId;
  organizationId: string;
  dataType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  riskCategory: string;
  description: string;
  affectedUsers: number;
  mitigationPlan: string;
  detectedAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'open' | 'mitigated' | 'closed';
}

export interface AccessLog {
  _id?: ObjectId;
  organizationId: string;
  userId: string;
  userName: string;
  dataType: string;
  actionType: 'read' | 'write' | 'delete' | 'export';
  resourceId: string;
  resourceName: string;
  ipAddress: string;
  timestamp: Date;
  status: 'success' | 'failure';
  details?: string;
  createdAt: Date;
}

export interface ComplianceReport {
  _id?: ObjectId;
  organizationId: string;
  hipaaCompliance: number;
  dpdpaCompliance: number;
  overallScore: number;
  riskCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
}

export interface AnomalyEvent {
  _id?: ObjectId;
  organizationId: string;
  eventType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  userId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
  confirmed: boolean;
  createdAt: Date;
}

export interface UploadedData {
  _id?: ObjectId;
  organizationId: string;
  fileName: string;
  fileSize: number;
  dataType: string;
  recordCount: number;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'failed';
  analysisId?: ObjectId;
  createdAt: Date;
}

export interface AnalysisResult {
  _id?: ObjectId;
  organizationId: string;
  uploadedDataId: ObjectId;
  ruleResults: {
    ruleId: string;
    ruleName: string;
    severity: string;
    passed: boolean;
    details: string;
  }[];
  anomalies: {
    type: string;
    confidence: number;
    description: string;
    affectedRecords: number;
  }[];
  complianceScore: number;
  riskCount: number;
  summary: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditReport {
  _id?: ObjectId;
  organizationId: string;
  reportName: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalEvents: number;
    risksIdentified: number;
    complianceScore: number;
  };
  details: Record<string, any>;
  generatedBy: string;
  createdAt: Date;
}

export interface Alert {
  _id?: ObjectId;
  organizationId: string;
  alertType: 'risk_detected' | 'compliance_drop' | 'anomaly' | 'access_violation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  relatedRiskId?: ObjectId;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}
