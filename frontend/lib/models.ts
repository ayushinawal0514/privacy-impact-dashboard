import { ObjectId } from "mongodb";

// ============== User & RBAC ==============
export type UserRole = "admin" | "compliance_officer" | "data_owner" | "auditor" | "viewer";

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  permissions: string[];
  organization: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface RBACPolicy {
  _id?: ObjectId;
  role: UserRole;
  permissions: string[];
  resources: string[];
  actions: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============== Healthcare Systems & Data Flows ==============
export interface DataFlow {
  _id?: ObjectId;
  name: string;
  sourceSystem: string;
  destinationSystem: string;
  dataClassification: "public" | "internal" | "confidential" | "restricted";
  sensitiveDataTypes: string[]; // PII, PHI, genetic data, etc.
  frequency: string; // e.g., "daily", "real-time"
  volume: number; // records per period
  encryption: "none" | "in-transit" | "at-rest" | "end-to-end";
  accessControl: string[]; // list of access rules
  approvalStatus: "pending" | "approved" | "rejected";
  approverComments?: string;
  complianceFrameworks: string[]; // HIPAA, DPDPA, etc.
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;
}

export interface HealthcareSystem {
  _id?: ObjectId;
  name: string;
  type: "ehr" | "laboratory" | "pharmacy" | "imaging" | "storage" | "analytics";
  owner: ObjectId;
  location: string;
  dataClassification: string[];
  encryptionStatus: boolean;
  accessLogs: AccessLog[];
  storageCapacity: number;
  currentUsage: number;
  complianceScore: number;
  lastAuditDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessLog {
  _id?: ObjectId;
  userId: ObjectId;
  systemId: ObjectId;
  action: "read" | "write" | "delete" | "modify" | "export";
  dataAccessed: string[];
  ipAddress: string;
  timestamp: Date;
  duration: number; // minutes
  status: "success" | "failed" | "denied";
  riskScore?: number;
  anomalyDetected?: boolean;
  anomalyType?: string; // e.g., "unusual_time", "bulk_access", "new_location"
}

// ============== Privacy Risks & Compliance ==============
export type RiskSeverity = "critical" | "high" | "medium" | "low" | "info";
export type RiskCategory =
  | "excessive_permissions"
  | "unauthorized_access"
  | "insecure_storage"
  | "abnormal_movement"
  | "encryption_failure"
  | "access_anomaly"
  | "policy_violation"
  | "data_leakage";

export interface PrivacyRisk {
  _id?: ObjectId;
  riskId: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  affectedSystems: ObjectId[];
  affectedDataTypes: string[];
  rootCause: string;
  riskScore: number; // 0-100
  likelihood: number; // 0-100
  impact: number; // 0-100
  detectionMethod: "rule-based" | "ml-anomaly" | "manual";
  detectedAt: Date;
  status: "open" | "in-progress" | "mitigated" | "resolved" | "accepted";
  mitigationPlan?: string;
  remediationDeadline?: Date;
  remediedAt?: Date;
  relatedFrameworks: string[]; // HIPAA, DPDPA violations
  evidence: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceViolation {
  _id?: ObjectId;
  framework: "HIPAA" | "DPDPA" | "GDPR" | "other";
  violationType: string;
  description: string;
  affectedSystems: ObjectId[];
  severity: RiskSeverity;
  requirementsViolated: string[];
  remediationRequired: string;
  remediationDeadline: Date;
  status: "open" | "remediated" | "waived";
  evidenceLinks: string[];
  assignedTo?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceScore {
  _id?: ObjectId;
  organizationId?: ObjectId;
  systemId?: ObjectId;
  framework: "HIPAA" | "DPDPA" | "overall";
  overallScore: number; // 0-100
  categoryScores: {
    dataProtection: number;
    accessControl: number;
    encryption: number;
    auditTrail: number;
    policyCompliance: number;
  };
  riskLevel: "critical" | "high" | "medium" | "low";
  lastComputedAt: Date;
  nextComputedAt: Date;
  recommendations: string[];
  trends: {
    date: Date;
    score: number;
  }[];
}

// ============== Audit & Reporting ==============
export interface AuditReport {
  _id?: ObjectId;
  reportId: string;
  title: string;
  scope: string;
  framework: string;
  startDate: Date;
  endDate: Date;
  status: "draft" | "in-progress" | "completed" | "published";
  findings: {
    category: string;
    count: number;
    severity: RiskSeverity;
  }[];
  executiveSummary: string;
  detailedFindings: string;
  recommendations: string[];
  generatedBy: ObjectId;
  generatedAt: Date;
  expiresAt?: Date;
  attachments: string[];
}

export interface AlertConfiguration {
  _id?: ObjectId;
  userId: ObjectId;
  type: "risk" | "compliance" | "anomaly" | "system" | "all";
  severity: RiskSeverity[];
  channels: ("email" | "sms" | "push" | "in-app")[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeAlert {
  _id?: ObjectId;
  alertId: string;
  type: "risk_detected" | "violation" | "anomaly" | "threshold_exceeded";
  severity: RiskSeverity;
  title: string;
  description: string;
  sourceSystem?: ObjectId;
  relatedRisk?: ObjectId;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: ObjectId;
  acknowledgedAt?: Date;
  expiresAt?: Date;
}

// ============== ML Model & Anomaly Detection ==============
export interface AnomalyDetectionModel {
  _id?: ObjectId;
  modelId: string;
  modelType: "isolation_forest" | "auto_encoder" | "lstm" | "ensemble";
  version: string;
  trainingDataPoints: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrainedAt: Date;
  lastValidatedAt: Date;
  status: "active" | "inactive" | "retraining";
  hyperparameters: Record<string, any>;
  anomalyThreshold: number;
}

export interface AnomalyRecord {
  _id?: ObjectId;
  detectionId: string;
  modelId: ObjectId;
  accessLogId: ObjectId;
  anomalyScore: number; // 0-1
  anomalyType: string;
  features: {
    timeOfDay: number;
    accessFrequency: number;
    dataVolume: number;
    unusualLocation: boolean;
    deviationFromBaseline: number;
  };
  isPredicted: boolean;
  isConfirmed?: boolean;
  confirmedAt?: Date;
  severity: RiskSeverity;
  createdAt: Date;
}

// ============== Configuration & Policies ==============
export interface CompliancePolicy {
  _id?: ObjectId;
  name: string;
  framework: string;
  category: string;
  requirement: string;
  implementationSteps: string[];
  acceptanceCriteria: string[];
  validationMethod: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptionConfig {
  _id?: ObjectId;
  systemId: ObjectId;
  algorithmAtRest: string; // AES-256, etc.
  algorithmInTransit: string; // TLS, etc.
  keyManagement: string;
  keyRotationFrequency: string;
  certified: boolean;
  certificationBody?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============== Logging ==============
export interface SystemLog {
  _id?: ObjectId;
  level: "debug" | "info" | "warn" | "error" | "critical";
  service: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  userId?: ObjectId;
  actionType?: string;
  relatedEntity?: {
    type: string;
    id: ObjectId;
  };
}

// ============== Dashboard & Analytics ==============
export interface DashboardMetrics {
  _id?: ObjectId;
  organizationId?: ObjectId;
  timestamp: Date;
  totalRecords: number;
  risksDetected: number;
  complianceScore: number;
  dataFlowCount: number;
  activeAlerts: number;
  systemsMonitored: number;
  recordsProcessedToday: number;
}
