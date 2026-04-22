import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { privacyAnalyzer } from '../utils/privacyAnalyzer';

const router = Router();

/**
 * Helper: role-aware filters
 */
function getUploadFilter(req: AuthRequest) {
  const orgId = req.user!.organizationId;
  const userId = req.userId!;
  const isAdmin = req.role === 'admin';

  return isAdmin
    ? { organizationId: orgId }
    : { organizationId: orgId, uploadedBy: userId };
}

function getAnalysisFilter(req: AuthRequest) {
  const orgId = req.user!.organizationId;
  const userId = req.userId!;
  const isAdmin = req.role === 'admin';

  return isAdmin
    ? { organizationId: orgId }
    : { organizationId: orgId, createdBy: userId };
}

/**
 * ============================
 * 🚀 Upload Data + Auto Analyze
 * ============================
 */
router.post(
  '/',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const { fileName, dataType, records, metadata } = req.body;

      if (!fileName || !dataType || !Array.isArray(records)) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: fileName, dataType, records'
        });
      }

      if (records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data records provided'
        });
      }

      const organizationId = req.user!.organizationId;
      const userId = req.userId!;

      const uploadResult = await db.collection('uploaded_data').insertOne({
        organizationId,
        fileName,
        dataType,
        recordCount: records.length,
        uploadedBy: userId,
        uploadedAt: new Date(),
        status: 'processing',
        metadata: metadata || {},
        createdAt: new Date()
      });

      const processedRecords = records.map((record: any) => ({
        ...record,
        uploadId: uploadResult.insertedId,
        organizationId,
        uploadedBy: userId,
        processedAt: new Date()
      }));

      await db.collection(`records_${dataType}`).insertMany(processedRecords);

      setImmediate(async () => {
        try {
          const db = getDB();

          const storedRecords = await db.collection(`records_${dataType}`)
            .find({ uploadId: uploadResult.insertedId })
            .limit(1000)
            .toArray();

          const analysisData = prepareAnalysisData(storedRecords, dataType);
          const analysisResult = privacyAnalyzer.analyze(analysisData);

          const result = await db.collection('analysis_results').insertOne({
            organizationId,
            uploadedDataId: uploadResult.insertedId,
            ...analysisResult,
            createdAt: new Date(),
            createdBy: userId
          });

          await db.collection('uploaded_data').updateOne(
            { _id: uploadResult.insertedId },
            {
              $set: {
                status: 'completed',
                analysisId: result.insertedId,
                updatedAt: new Date()
              }
            }
          );

          if (analysisResult.ruleResults?.length) {
            const risks = analysisResult.ruleResults
              .filter((r: any) => r.passed === false)
              .map((r: any) => ({
                organizationId,
                dataType,
                severity: r.severity,
                riskCategory: r.ruleName,
                description: r.details,
                riskCount: r.riskCount || 1,
                uploadId: uploadResult.insertedId,
                analysisId: result.insertedId,
                createdBy: userId,
                detectedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'open'
              }));

            if (risks.length > 0) {
              await db.collection('privacy_risks').insertMany(risks);
            }
          }

          if (analysisResult.anomalies?.length) {
            const anomalies = analysisResult.anomalies.map((a: any) => ({
              organizationId,
              uploadId: uploadResult.insertedId,
              analysisId: result.insertedId,
              createdBy: userId,
              eventType: a.type,
              severity: a.severity,
              description: a.description,
              timestamp: a.timestamp,
              metadata: a.details,
              confirmed: false,
              createdAt: new Date()
            }));

            await db.collection('anomalies').insertMany(anomalies);
          }

          logger.info(`Analysis completed for upload ${uploadResult.insertedId.toString()}`);
        } catch (err) {
          logger.error('Auto analysis failed:', err);
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Data uploaded successfully',
        uploadId: uploadResult.insertedId,
        recordCount: records.length,
        status: 'processing'
      });
    } catch (error) {
      logger.error('Error uploading data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload data'
      });
    }
  }
);

/**
 * ============================
 * 📊 Get Upload History
 * ============================
 */
router.get(
  '/uploads',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const { skip = 0, limit = 20 } = req.query;

      const filter = getUploadFilter(req);

      const uploads = await db.collection('uploaded_data')
        .find(filter)
        .sort({ uploadedAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .toArray();

      const total = await db.collection('uploaded_data').countDocuments(filter);

      return res.json({
        success: true,
        role: req.role,
        data: uploads,
        pagination: { total, skip: Number(skip), limit: Number(limit) }
      });
    } catch (error) {
      logger.error('Error fetching uploads:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch uploads'
      });
    }
  }
);

/**
 * ============================
 * 📄 Get Single Upload Details
 * ============================
 */
router.get(
  '/uploads/:id',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid upload id'
        });
      }

      const upload = await db.collection('uploaded_data').findOne({
        _id: new ObjectId(id),
        ...getUploadFilter(req)
      });

      if (!upload) {
        return res.status(404).json({
          success: false,
          message: 'Upload not found or access denied'
        });
      }

      return res.json({
        success: true,
        data: upload
      });
    } catch (error) {
      logger.error('Error fetching upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch upload'
      });
    }
  }
);

/**
 * ============================
 * 📈 Get Analysis Result by analysisId
 * ============================
 */
router.get(
  '/results/:analysisId',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const { analysisId } = req.params;

      if (!ObjectId.isValid(analysisId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis id'
        });
      }

      const result = await db.collection('analysis_results').findOne({
        _id: new ObjectId(analysisId),
        ...getAnalysisFilter(req)
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Analysis result not found or access denied'
        });
      }

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error fetching analysis result:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch analysis result'
      });
    }
  }
);

/**
 * ============================
 * 🧠 Helper: Prepare Data Dynamically
 * ============================
 */
function prepareAnalysisData(records: any[], dataType?: string): any {
  const permissions: any[] = [];
  const dataItems: any[] = [];
  const accessLogs: any[] = [];
  const users: any[] = [];

  const sensitiveFields = [
    'ssn',
    'phone',
    'email',
    'address',
    'medicalrecord',
    'medical_record',
    'diagnosis',
    'treatment',
    'prescription',
    'insurance',
    'dob',
    'aadhaar'
  ];

  const trueValues = new Set(['true', 'yes', '1', 'encrypted', 'enabled']);
  const falseValues = new Set(['false', 'no', '0', 'unencrypted', 'disabled']);

  let hasConsentField = false;
  let hasRetentionField = false;
  let retentionDeclared = false;
  let hasAuditField = false;
  let auditEnabled = false;
  let hasBreachPlanField = false;
  let breachPlanEnabled = false;
  let hasNotificationField = false;
  let notificationEnabled = false;
  let maxNotificationDays = 72;

  let hasAccessControlField = false;
  let accessControlEnabled = false;

  for (const record of records.slice(0, 1000)) {
    let recordHasSensitiveField = false;
    let recordEncrypted = false;
    let recordEncryptionKnown = false;
    let recordConsentGiven = true;
    let recordConsentKnown = false;
    let recordHasAccessEvent = false;

    for (const [key, rawValue] of Object.entries(record)) {
      const k = key.toLowerCase();
      const v = rawValue as any;
      const vStr = String(v).toLowerCase();

      // Permissions / roles
      if (
        k.includes('role') ||
        k.includes('permission') ||
        k.includes('accesslevel') ||
        k.includes('access_level')
      ) {
        permissions.push({
          level: v,
          userId: (record as any).userId || (record as any).email || 'unknown'
        });

        hasAccessControlField = true;

        if (
          ['doctor', 'nurse', 'staff', 'user', 'limited', 'read', 'viewer'].includes(vStr)
        ) {
          accessControlEnabled = true;
        }
      }

      // Explicit access control style fields
      if (k.includes('acl') || k.includes('rbac') || k.includes('accesscontrol') || k.includes('access_control')) {
        hasAccessControlField = true;
        if (v === true || trueValues.has(vStr)) {
          accessControlEnabled = true;
        }
      }

      // Consent tracking
      if (k.includes('consent')) {
        hasConsentField = true;
        recordConsentKnown = true;
        recordConsentGiven = v === true || trueValues.has(vStr);
      }

      // Encryption
      if (k.includes('encrypt')) {
        recordEncryptionKnown = true;
        recordEncrypted = v === true || trueValues.has(vStr);
      }

      // Sensitive fields
      if (sensitiveFields.some((field) => k.includes(field))) {
        recordHasSensitiveField = true;
      }

      // Access logs
      if (
        k.includes('timestamp') ||
        k.includes('login') ||
        k.includes('action') ||
        k.includes('resource') ||
        k.includes('access')
      ) {
        recordHasAccessEvent = true;
      }

      // Audit logging flags
      if (k.includes('audit')) {
        hasAuditField = true;
        if (v === true || trueValues.has(vStr)) {
          auditEnabled = true;
        }
      }

      // Retention
      if (k.includes('retention')) {
        hasRetentionField = true;
        if (
          (typeof v === 'number' && v > 0) ||
          trueValues.has(vStr)
        ) {
          retentionDeclared = true;
        }
      }

      // Breach response
      if (k.includes('breachresponse') || k.includes('breach_response') || k.includes('incidentplan') || k.includes('incident_plan')) {
        hasBreachPlanField = true;
        if (v === true || trueValues.has(vStr)) {
          breachPlanEnabled = true;
        }
      }

      // Notification procedure / days
      if (k.includes('notification')) {
        hasNotificationField = true;
        if (typeof v === 'number') {
          maxNotificationDays = v;
          notificationEnabled = v <= 72;
        } else if (v === true || trueValues.has(vStr)) {
          notificationEnabled = true;
        } else if (falseValues.has(vStr)) {
          notificationEnabled = false;
        }
      }

      if (k.includes('maxnotificationdays') || k.includes('notificationdays') || k.includes('notification_days')) {
        hasNotificationField = true;
        if (typeof v === 'number') {
          maxNotificationDays = v;
          notificationEnabled = v <= 72;
        }
      }
    }

    if (recordHasSensitiveField) {
      dataItems.push({
        isSensitive: true,
        dataType: 'PHI',
        encrypted: recordEncryptionKnown ? recordEncrypted : false,
        encryptionType: recordEncryptionKnown && recordEncrypted ? 'AES-256' : 'none'
      });
    }

    if (recordHasAccessEvent || dataType === 'healthcare_access_logs') {
      accessLogs.push({
        userId: (record as any).userId || 'unknown',
        timestamp: (record as any).timestamp || new Date(),
        actionType: (record as any).action || 'read',
        resource: (record as any).resource || 'unknown'
      });
    }

    if ((record as any).email || (record as any).userId) {
      users.push({
        userId: (record as any).userId || 'unknown',
        email: (record as any).email,
        consentGiven: recordConsentKnown ? recordConsentGiven : true,
        consentDate: new Date()
      });
    }
  }

  const rolesCount = new Set(permissions.map((p) => String(p.level).toLowerCase())).size;

  return {
  permissions,

  dataItems: dataItems.length
    ? dataItems
    : [{ isSensitive: false, dataType: 'general', encrypted: true, encryptionType: 'AES-256' }],

  accessControl: {
    enabled: hasAccessControlField ? accessControlEnabled : rolesCount > 0,
    rolesCount: rolesCount || 0,
    hasAuditLog: hasAuditField ? auditEnabled : accessLogs.length > 0
  },

  accessLogs,

  users: users.length
    ? users
    : [{ consentGiven: true }],

  // ✅ FIX: USE hasConsentField here
  dataCollection: {
    consentTrackingEnabled: hasConsentField,
    totalUsers: users.length
  },

  auditLogging: hasAuditField ? auditEnabled : accessLogs.length > 0,

  logRetention: hasRetentionField ? 180 : 0,

  retentionPolicy: {
    enabled: hasRetentionField ? retentionDeclared : false,
    maxRetentionDays: hasRetentionField ? 365 : 0
  },

  breachResponsePlan: hasBreachPlanField ? breachPlanEnabled : false,

  notificationProcedure: hasNotificationField ? notificationEnabled : false,

  maxNotificationDays
};
}

export default router;