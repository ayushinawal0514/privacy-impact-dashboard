// Initialize MongoDB with default data and indexes
db.createUser({
  user: "admin",
  pwd: "securepassword",
  roles: [{ role: "root", db: "admin" }],
});

db = db.getSiblingDB("healthcare_compliance");

// Create collections
db.createCollection("users");
db.createCollection("healthcare_systems");
db.createCollection("data_flows");
db.createCollection("access_logs");
db.createCollection("privacy_risks");
db.createCollection("compliance_violations");
db.createCollection("compliance_scores");
db.createCollection("audit_reports");
db.createCollection("alerts");
db.createCollection("anomaly_records");
db.createCollection("system_logs");
db.createCollection("rbac_policies");

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ organization: 1 });
db.users.createIndex({ role: 1 });

db.healthcare_systems.createIndex({ owner: 1 });
db.healthcare_systems.createIndex({ type: 1 });

db.data_flows.createIndex({ sourceSystem: 1, destinationSystem: 1 });
db.data_flows.createIndex({ approvalStatus: 1 });
db.data_flows.createIndex({ createdAt: -1 });

db.access_logs.createIndex({ userId: 1, timestamp: -1 });
db.access_logs.createIndex({ systemId: 1, timestamp: -1 });
db.access_logs.createIndex({ timestamp: -1 });
db.access_logs.createIndex({ anomalyDetected: 1 });

db.privacy_risks.createIndex({ affectedSystems: 1 });
db.privacy_risks.createIndex({ severity: 1, status: 1 });
db.privacy_risks.createIndex({ createdAt: -1 });
db.privacy_risks.createIndex({ riskScore: -1 });

db.compliance_scores.createIndex({ organizationId: 1, framework: 1 });
db.compliance_scores.createIndex({ lastComputedAt: -1 });

db.system_logs.createIndex({ timestamp: -1 });
db.system_logs.createIndex({ level: 1 });
db.system_logs.createIndex({ service: 1 });

db.alerts.createIndex({ timestamp: -1 });
db.alerts.createIndex({ acknowledged: 1 });
db.alerts.createIndex({ severity: 1 });

// Insert default RBAC policies
db.rbac_policies.insertMany([
  {
    role: "admin",
    permissions: [
      "read:all",
      "write:all",
      "delete:all",
      "manage:users",
      "manage:systems",
      "generate:reports",
      "configure:alerts",
    ],
    resources: ["*"],
    actions: ["*"],
    description: "System administrator with full access",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    role: "compliance_officer",
    permissions: [
      "read:systems",
      "read:risks",
      "read:compliance",
      "write:compliance",
      "generate:reports",
      "manage:alerts",
    ],
    resources: ["systems", "risks", "compliance", "alerts"],
    actions: ["read", "write", "analyze"],
    description: "Compliance officer with compliance oversight",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    role: "auditor",
    permissions: [
      "read:systems",
      "read:risks",
      "read:logs",
      "read:audit_reports",
      "generate:reports",
    ],
    resources: ["systems", "risks", "logs", "reports"],
    actions: ["read", "analyze"],
    description: "Auditor with read-only access",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    role: "data_owner",
    permissions: [
      "read:systems",
      "write:data_flows",
      "read:risks",
      "manage:data_flows",
    ],
    resources: ["systems", "data_flows", "risks"],
    actions: ["read", "write"],
    description: "Data owner managing data flows",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    role: "viewer",
    permissions: ["read:systems", "read:risks", "read:compliance"],
    resources: ["systems", "risks", "compliance"],
    actions: ["read"],
    description: "Viewer with read-only dashboard access",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

// Insert sample healthcare system
db.healthcare_systems.insertOne({
  name: "EHR System - Primary",
  type: "ehr",
  owner: ObjectId("000000000000000000000001"),
  location: "Data Center A",
  dataClassification: ["PHI", "PII"],
  encryptionStatus: true,
  storageCapacity: 1000000,
  currentUsage: 450000,
  complianceScore: 88,
  lastAuditDate: new Date("2024-01-15"),
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Insert sample compliance policies
db.insertMany([
  {
    table: "compliance_policies",
    data: {
      name: "HIPAA Data Encryption",
      framework: "HIPAA",
      category: "Data Protection",
      requirement: "All PHI must be encrypted at rest (AES-256) and in transit (TLS 1.2+)",
      implementationSteps: [
        "Enable disk-level encryption",
        "Configure TLS for all services",
        "Rotate encryption keys quarterly",
      ],
      acceptanceCriteria: [
        "100% of PHI encrypted",
        "TLS 1.2 or higher enabled",
        "Key rotation log available",
      ],
      validationMethod: "Automated security scan",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
]);

print("MongoDB initialization completed successfully!");
print("Collections created:");
print("- users, healthcare_systems, data_flows, access_logs");
print("- privacy_risks, compliance_violations, compliance_scores");
print("- audit_reports, alerts, anomaly_records, system_logs, rbac_policies");
print("\nIndexes created for optimal performance");
print("Default RBAC policies initialized");
print("\nYou can now connect with: mongodb://admin:securepassword@localhost:27017/healthcare_compliance");
