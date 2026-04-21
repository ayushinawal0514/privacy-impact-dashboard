import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { privacyAnalyzer } from '../utils/privacyAnalyzer';

const router = Router();

// Upload data for analysis
router.post('/upload', async (req: AuthRequest, res: Response) => {
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

    // Insert upload record
    const uploadRecord = {
      organizationId: req.user.organizationId,
      fileName,
      fileSize: JSON.stringify(records).length,
      dataType,
      recordCount: records.length,
      uploadedBy: req.userId,
      uploadedAt: new Date(),
      status: 'processing',
      metadata: metadata || {},
      createdAt: new Date()
    };

    const uploadResult = await db.collection('uploaded_data').insertOne(uploadRecord);

    // Process records - analyze for privacy issues
    const processedRecords = records.map((record: any) => ({
      ...record,
      uploadId: uploadResult.insertedId,
      organizationId: req.user.organizationId,
      processedAt: new Date()
    }));

    // Store processed records
    if (processedRecords.length > 0) {
      await db.collection(`records_${dataType}`).insertMany(processedRecords);
    }

    // Trigger async analysis
    const analysisInput = {
      uploadedDataId: uploadResult.insertedId,
      records: processedRecords,
      dataType,
      metadata
    };

    // Queue for analysis (in real world, use message queue like RabbitMQ)
    setImmediate(() => {
      analyzeUploadedData(uploadResult.insertedId.toString(), analysisInput);
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
});

// Get upload history
router.get('/uploads', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { skip = 0, limit = 20 } = req.query;

    const uploads = await db.collection('uploaded_data')
      .find({ organizationId: req.user.organizationId })
      .sort({ uploadedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('uploaded_data').countDocuments({
      organizationId: req.user.organizationId
    });

    return res.json({
      success: true,
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
});

// Get upload details
router.get('/uploads/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const upload = await db.collection('uploaded_data').findOne({
      _id: new (require('mongodb').ObjectId)(id),
      organizationId: req.user.organizationId
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    return res.json({ success: true, data: upload });
  } catch (error) {
    logger.error('Error fetching upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch upload'
    });
  }
});

// Analyze uploaded data (trigger analysis)
router.post('/analyze/:uploadId', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { uploadId } = req.params;
    const { rules = [], options = {} } = req.body;

    const ObjectId = require('mongodb').ObjectId;

    // Get upload record
    const upload = await db.collection('uploaded_data').findOne({
      _id: new ObjectId(uploadId),
      organizationId: req.user.organizationId
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Get records for analysis
    const records = await db.collection(`records_${upload.dataType}`)
      .find({ uploadId: new ObjectId(uploadId) })
      .limit(options.sampleSize || 1000)
      .toArray();

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No records found for analysis'
      });
    }

    // Prepare analysis input
    const analysisData = prepareAnalysisData(records, upload);

    // Run analysis
    const analysisResult = privacyAnalyzer.analyze(analysisData);

    // Store analysis result
    const result = await db.collection('analysis_results').insertOne({
      organizationId: req.user.organizationId,
      uploadedDataId: new ObjectId(uploadId),
      ...analysisResult,
      createdAt: new Date(),
      createdBy: req.userId
    });

    // Update upload status
    await db.collection('uploaded_data').updateOne(
      { _id: new ObjectId(uploadId) },
      { $set: { status: 'completed', analysisId: result.insertedId } }
    );

    // Create risks from analysis results
    for (const failedRule of analysisResult.ruleResults.filter(r => !r.passed)) {
      await db.collection('privacy_risks').insertOne({
        organizationId: req.user.organizationId,
        dataType: upload.dataType,
        severity: failedRule.severity,
        riskCategory: failedRule.ruleName,
        description: failedRule.details,
        affectedUsers: records.length,
        mitigationPlan: '',
        detectedAt: new Date(),
        createdBy: req.userId,
        createdAt: new Date(),
        status: 'open'
      });
    }

    // Create anomaly risks
    for (const anomaly of analysisResult.anomalies) {
      await db.collection('anomalies').insertOne({
        organizationId: req.user.organizationId,
        eventType: anomaly.type,
        severity: anomaly.severity,
        description: anomaly.description,
        timestamp: anomaly.timestamp,
        metadata: anomaly.details,
        confirmed: false,
        createdAt: new Date()
      });
    }

    return res.json({
      success: true,
      message: 'Analysis completed',
      analysisId: result.insertedId,
      ...analysisResult
    });
  } catch (error) {
    logger.error('Error analyzing data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze data'
    });
  }
});

// Get analysis results
router.get('/results/:analysisId', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { analysisId } = req.params;

    const ObjectId = require('mongodb').ObjectId;

    const result = await db.collection('analysis_results').findOne({
      _id: new ObjectId(analysisId),
      organizationId: req.user.organizationId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Analysis result not found'
      });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error fetching analysis result:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analysis result'
    });
  }
});

// Helper function to prepare analysis data
function prepareAnalysisData(records: any[], upload: any): any {
  // Group by field patterns to detect sensitive data
  const permissions: any[] = [];
  const dataItems: any[] = [];
  const accessLogs: any[] = [];
  const users: any[] = [];

  // Analyze records for privacy patterns
  for (const record of records.slice(0, 100)) {
    // Look for common sensitive fields
    for (const [key, value] of Object.entries(record)) {
      const lowerKey = key.toLowerCase();

      // Detect permission fields
      if (lowerKey.includes('permission') || lowerKey.includes('role') || lowerKey.includes('access')) {
        permissions.push({ level: value, userId: record.userId || 'unknown' });
      }

      // Detect encryption status
      if (lowerKey.includes('encrypted') || lowerKey.includes('encryption')) {
        dataItems.push({
          isSensitive: true,
          dataType: 'PHI',
          encrypted: value === true || value === 'true',
          encryptionType: value === true ? 'AES-256' : 'none'
        });
      }

      // Detect access logs
      if (lowerKey.includes('access') || lowerKey.includes('login') || lowerKey.includes('timestamp')) {
        accessLogs.push({
          userId: record.userId || 'unknown',
          timestamp: record.timestamp || new Date(),
          actionType: 'read'
        });
      }

      // Detect sensitive PHI fields
      const sensitiveFields = ['ssn', 'phone', 'email', 'address', 'medicalrecord', 'diagnosis', 'treatment'];
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        dataItems.push({
          isSensitive: true,
          dataType: 'PHI',
          encrypted: false,
          encryptionType: 'none'
        });
      }
    }

    // Extract user info
    if (record.userId || record.email) {
      users.push({
        userId: record.userId || 'unknown',
        email: record.email,
        consentGiven: record.consentGiven !== false,
        consentDate: record.consentDate || new Date()
      });
    }
  }

  return {
    permissions,
    dataItems: dataItems.length > 0 ? dataItems : [{ isSensitive: true, dataType: 'PHI', encrypted: false, encryptionType: 'none' }],
    accessControl: {
      enabled: true,
      rolesCount: new Set(permissions.map(p => p.level)).size || 3,
      hasAuditLog: true
    },
    accessLogs,
    users: users.length > 0 ? users : [{ consentGiven: true }],
    auditLogging: true,
    logRetention: 180,
    retentionPolicy: {
      enabled: true,
      maxRetentionDays: 365
    },
    breachResponsePlan: true,
    notificationProcedure: true,
    maxNotificationDays: 72
  };
}

// Helper function for async analysis
async function analyzeUploadedData(uploadId: string, analysisInput: any) {
  try {
    logger.info(`Starting async analysis for upload: ${uploadId}`);
    // This would be a separate service in production
    // For now, we just log it
  } catch (error) {
    logger.error(`Error in async analysis for upload ${uploadId}:`, error);
  }
}

export default router;
