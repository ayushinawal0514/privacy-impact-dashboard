import clientPromise from "./mongodb";
import { User, PrivacyRisk, AccessLog, ComplianceScore, AuditReport } from "@/types/models";
import { ObjectId } from "mongodb";

const DB_NAME = "healthcare_compliance";

export async function getDatabase() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// ============== Collection Initialization ==============
export async function initializeCollections() {
  const db = await getDatabase();

  const collections = [
    "users",
    "healthcare_systems",
    "data_flows",
    "access_logs",
    "privacy_risks",
    "compliance_violations",
    "compliance_scores",
    "audit_reports",
    "alerts",
    "anomaly_records",
    "system_logs",
    "rbac_policies",
    "audit_trails",
  ];

  for (const collectionName of collections) {
    const exists = await db.listCollections({ name: collectionName }).hasNext();
    if (!exists) {
      await db.createCollection(collectionName);
    }
  }

  // Create indexes for performance
  await createIndexes();
}

async function createIndexes() {
  const db = await getDatabase();

  // Users
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ organization: 1 });

  // Access Logs
  await db.collection("access_logs").createIndex({ userId: 1, timestamp: -1 });
  await db.collection("access_logs").createIndex({ systemId: 1, timestamp: -1 });
  await db.collection("access_logs").createIndex({ timestamp: -1 });
  await db.collection("access_logs").createIndex({ anomalyDetected: 1 });

  // Privacy Risks
  await db.collection("privacy_risks").createIndex({ affectedSystems: 1 });
  await db.collection("privacy_risks").createIndex({ severity: 1, status: 1 });
  await db.collection("privacy_risks").createIndex({ createdAt: -1 });
  await db.collection("privacy_risks").createIndex({ riskScore: -1 });

  // Compliance Scores
  await db.collection("compliance_scores").createIndex({ organizationId: 1, framework: 1 });
  await db.collection("compliance_scores").createIndex({ lastComputedAt: -1 });

  // System Logs
  await db.collection("system_logs").createIndex({ timestamp: -1 });
  await db.collection("system_logs").createIndex({ level: 1 });
  await db.collection("system_logs").createIndex({ service: 1 });

  // Data Flows
  await db.collection("data_flows").createIndex({ sourceSystem: 1, destinationSystem: 1 });
  await db.collection("data_flows").createIndex({ approvalStatus: 1 });
}

// ============== User Operations ==============
export async function createUser(user: Omit<User, "_id">) {
  const db = await getDatabase();
  const result = await db.collection("users").insertOne({
    ...user,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function getUserByEmail(email: string) {
  const db = await getDatabase();
  return db.collection("users").findOne({ email });
}

export async function getUserById(id: string | ObjectId) {
  const db = await getDatabase();
  return db.collection("users").findOne({ _id: new ObjectId(id) });
}

export async function updateUserRole(userId: string, role: string, permissions: string[]) {
  const db = await getDatabase();
  return db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        role,
        permissions,
        updatedAt: new Date(),
      },
    },
  );
}

// ============== Access Log Operations ==============
export async function logAccess(log: Omit<AccessLog, "_id">) {
  const db = await getDatabase();
  return db.collection("access_logs").insertOne(log);
}

export async function getAccessLogs(
  systemId?: ObjectId,
  userId?: ObjectId,
  limit = 100,
  days = 30,
) {
  const db = await getDatabase();
  const query: any = {};

  if (systemId) query.systemId = systemId;
  if (userId) query.userId = userId;

  // Logs from last N days
  query.timestamp = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };

  return db
    .collection("access_logs")
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

export async function getAnomalousAccessLogs(limit = 50, days = 7) {
  const db = await getDatabase();
  return db
    .collection("access_logs")
    .find({
      anomalyDetected: true,
      timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

// ============== Privacy Risk Operations ==============
export async function createPrivacyRisk(risk: Omit<PrivacyRisk, "_id">) {
  const db = await getDatabase();
  return db.collection("privacy_risks").insertOne(risk);
}

export async function getPrivacyRisks(
  severity?: string,
  status?: string,
  limit = 50,
) {
  const db = await getDatabase();
  const query: any = {};

  if (severity) query.severity = severity;
  if (status) query.status = status;

  return db
    .collection("privacy_risks")
    .find(query)
    .sort({ riskScore: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function updateRiskStatus(riskId: string, status: string, mitigation?: string) {
  const db = await getDatabase();
  return db.collection("privacy_risks").updateOne(
    { _id: new ObjectId(riskId) },
    {
      $set: {
        status,
        mitigationPlan: mitigation,
        updatedAt: new Date(),
      },
    },
  );
}

// ============== Compliance Score Operations ==============
export async function saveComplianceScore(score: Omit<ComplianceScore, "_id">) {
  const db = await getDatabase();

  // Update if exists, otherwise insert
  return db.collection("compliance_scores").updateOne(
    {
      organizationId: score.organizationId,
      framework: score.framework,
    },
    {
      $set: score,
    },
    { upsert: true },
  );
}

export async function getComplianceScore(organizationId: ObjectId, framework: string) {
  const db = await getDatabase();
  return db.collection("compliance_scores").findOne({ organizationId, framework });
}

export async function getLatestComplianceScores(organizationId: ObjectId, limit = 10) {
  const db = await getDatabase();
  return db
    .collection("compliance_scores")
    .find({ organizationId })
    .sort({ lastComputedAt: -1 })
    .limit(limit)
    .toArray();
}

// ============== Audit Report Operations ==============
export async function createAuditReport(report: Omit<AuditReport, "_id">) {
  const db = await getDatabase();
  return db.collection("audit_reports").insertOne(report);
}

export async function getAuditReports(organizationId?: ObjectId, limit = 20) {
  const db = await getDatabase();
  const query = organizationId ? { organizationId } : {};

  return db
    .collection("audit_reports")
    .find(query)
    .sort({ generatedAt: -1 })
    .limit(limit)
    .toArray();
}

// ============== System Logging ==============
export async function logSystemEvent(
  level: "debug" | "info" | "warn" | "error" | "critical",
  service: string,
  message: string,
  metadata?: Record<string, any>,
) {
  const db = await getDatabase();
  return db.collection("system_logs").insertOne({
    level,
    service,
    message,
    metadata,
    timestamp: new Date(),
  });
}

// ============== Data Flow Operations ==============
export async function getDataFlows(status?: string) {
  const db = await getDatabase();
  const query = status ? { approvalStatus: status } : {};

  return db.collection("data_flows").find(query).toArray();
}

export async function updateDataFlowStatus(
  flowId: string,
  status: string,
  comments?: string,
  approver?: ObjectId,
) {
  const db = await getDatabase();
  return db.collection("data_flows").updateOne(
    { _id: new ObjectId(flowId) },
    {
      $set: {
        approvalStatus: status,
        approverComments: comments,
        updatedAt: new Date(),
      },
    },
  );
}

// ============== Healthcare System Operations ==============
export async function getHealthcareSystems() {
  const db = await getDatabase();
  return db.collection("healthcare_systems").find({}).toArray();
}

export async function getSystemById(systemId: string) {
  const db = await getDatabase();
  return db.collection("healthcare_systems").findOne({ _id: new ObjectId(systemId) });
}

export async function updateSystemComplianceScore(systemId: string, score: number) {
  const db = await getDatabase();
  return db.collection("healthcare_systems").updateOne(
    { _id: new ObjectId(systemId) },
    {
      $set: {
        complianceScore: score,
        updatedAt: new Date(),
      },
    },
  );
}

// ============== Dashboard Metrics ==============
export async function getDashboardMetrics(organizationId?: ObjectId) {
  const db = await getDatabase();

  // Get recent metrics
  const query = organizationId ? { organizationId } : {};

  const [
    totalRecords,
    activeRisks,
    systemsMonitored,
    activeAlerts,
    complianceScore,
  ] = await Promise.all([
    db.collection("access_logs").countDocuments({}),
    db
      .collection("privacy_risks")
      .countDocuments({ status: { $in: ["open", "in-progress"] } }),
    db.collection("healthcare_systems").countDocuments({}),
    db.collection("alerts").countDocuments({ acknowledged: false }),
    db
      .collection("compliance_scores")
      .findOne(query, { sort: { lastComputedAt: -1 } }),
  ]);

  return {
    totalRecords,
    activeRisks,
    systemsMonitored,
    activeAlerts,
    complianceScore: complianceScore?.overallScore || 0,
    timestamp: new Date(),
  };
}
