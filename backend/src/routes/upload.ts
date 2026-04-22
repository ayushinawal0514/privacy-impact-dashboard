import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { analyzeHealthcareDataset } from '../services/privacyRuleEngine';
import { logAccess } from '../services/accessLogger';

const router = Router();

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

function normalizeRecords(input: any): any[] {
  if (Array.isArray(input?.records)) return input.records;
  if (Array.isArray(input?.patients)) return input.patients;
  if (Array.isArray(input?.users)) return input.users;
  if (Array.isArray(input)) return input;
  return [];
}

/**
 * ============================
 * 🚀 Upload Data + Rule-Based Analysis
 * ============================
 */
router.post(
  '/',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    let normalizedFileName = '';
    let normalizedDataType = 'health';

    try {
      const db = getDB();
      const { fileName, dataType, metadata } = req.body;

      normalizedFileName = String(fileName || '').trim();
      normalizedDataType = String(dataType || 'health').trim();

      const records = normalizeRecords(req.body);

      if (!normalizedFileName || !normalizedDataType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: fileName, dataType'
        });
      }

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid records provided. Expected records, patients, users, or raw array.'
        });
      }

      const organizationId = req.user!.organizationId;
      const userId = req.userId!;

      // 1. Save upload metadata
      const uploadResult = await db.collection('uploaded_data').insertOne({
        organizationId,
        fileName: normalizedFileName,
        dataType: normalizedDataType,
        recordCount: records.length,
        uploadedBy: userId,
        uploadedAt: new Date(),
        status: 'processing',
        metadata: metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const uploadId = uploadResult.insertedId;

      // 2. Save normalized raw records
      const processedRecords = records.map((record: any) => ({
        ...record,
        uploadId,
        datasetName: normalizedFileName,
        organizationId,
        uploadedBy: userId,
        processedAt: new Date()
      }));

      await db.collection(`records_${normalizedDataType}`).insertMany(processedRecords);

      // 3. Run rule-based analysis
      const analysisResult = analyzeHealthcareDataset(records);

      // 4. Store dataset analysis
      const analysisInsert = await db.collection('dataset_analysis').insertOne({
        organizationId,
        datasetId: uploadId,
        datasetName: normalizedFileName,
        uploadedDataId: uploadId,
        uploadedBy: userId,
        dataType: normalizedDataType,
        createdAt: new Date(),
        createdBy: userId,
        summary: analysisResult.summary,
        compliance: analysisResult.compliance
      });

      const analysisId = analysisInsert.insertedId;

      // Optional: backward-compatible analysis_results collection
      await db.collection('analysis_results').insertOne({
        organizationId,
        uploadedDataId: uploadId,
        datasetId: uploadId,
        datasetName: normalizedFileName,
        dataType: normalizedDataType,
        summary: analysisResult.summary,
        compliance: analysisResult.compliance,
        createdAt: new Date(),
        createdBy: userId
      });

      // 5. Store risks linked to dataset + record + rule
      if (analysisResult.risks.length > 0) {
        const risks = analysisResult.risks.map((risk) => ({
          organizationId,
          datasetId: uploadId,
          datasetName: normalizedFileName,
          analysisId,
          dataType: normalizedDataType,
          recordId: risk.recordId,
          severity: risk.severity,
          category: risk.category,
          riskCategory: risk.category,
          ruleId: risk.ruleId,
          description: risk.description,
          recommendation: risk.recommendation,
          createdBy: userId,
          detectedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'open'
        }));

        await db.collection('privacy_risks').insertMany(risks);
      }

      // 6. Auto-create alerts from critical/high risks
      const importantRisks = analysisResult.risks.filter(
        (risk) => risk.severity === 'critical' || risk.severity === 'high'
      );

      if (importantRisks.length > 0) {
        const alerts = importantRisks.map((risk) => ({
          organizationId,
          datasetId: uploadId,
          datasetName: normalizedFileName,
          title: `${risk.category} (Record: ${risk.recordId})`,
          message: risk.description,
          severity: risk.severity,
          type: 'privacy_risk',
          triggeredByRule: risk.ruleId,
          affectedResources: [risk.recordId],
          recommendation: risk.recommendation,
          createdAt: new Date(),
          resolved: false,
          createdBy: userId
        }));

        await db.collection('alerts').insertMany(alerts);
      }

      // 7. Mark upload completed
      await db.collection('uploaded_data').updateOne(
        { _id: uploadId },
        {
          $set: {
            status: 'completed',
            analysisId,
            updatedAt: new Date()
          }
        }
      );

      // 8. Log successful upload access event
      await logAccess({
        userId,
        organizationId,
        action: 'write',
        dataType: normalizedDataType,
        datasetId: uploadId.toString(),
        datasetName: normalizedFileName,
        resourceId: `upload:${uploadId.toString()}`,
        status: 'success',
        loggedBy: userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || undefined
      });

      logger.info(`Rule-based analysis completed for upload ${uploadId.toString()}`);

      return res.status(201).json({
        success: true,
        message: 'Data uploaded and analyzed successfully',
        uploadId,
        analysisId,
        recordCount: records.length,
        status: 'completed',
        summary: analysisResult.summary,
        compliance: analysisResult.compliance
      });
    } catch (error) {
      logger.error('Error uploading data:', error);

      try {
        if (req.userId && req.user?.organizationId) {
          await logAccess({
            userId: req.userId,
            organizationId: req.user.organizationId,
            action: 'write',
            dataType: normalizedDataType,
            datasetName: normalizedFileName,
            resourceId: 'upload:failed',
            status: 'failure',
            loggedBy: req.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent') || undefined
          });
        }
      } catch (logErr) {
        logger.error('Failed to write upload access log:', logErr);
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to upload and analyze data'
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

      const result = await db.collection('dataset_analysis').findOne({
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

export default router;