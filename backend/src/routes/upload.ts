import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { privacyAnalyzer } from '../utils/privacyAnalyzer';

const router = Router();

/**
 * ============================
 * 🚀 Upload Data + Auto Analyze
 * ============================
 */
router.post('/', async (req: AuthRequest, res: Response) => {
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

    const uploadResult = await db.collection('uploaded_data').insertOne({
      organizationId: req.user.organizationId,
      fileName,
      dataType,
      recordCount: records.length,
      uploadedBy: req.userId,
      uploadedAt: new Date(),
      status: 'processing',
      metadata: metadata || {},
      createdAt: new Date()
    });

    const processedRecords = records.map((record: any) => ({
      ...record,
      uploadId: uploadResult.insertedId,
      organizationId: req.user.organizationId,
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

        const analysisData = prepareAnalysisData(storedRecords);
        const analysisResult = privacyAnalyzer.analyze(analysisData);

        const result = await db.collection('analysis_results').insertOne({
          organizationId: req.user.organizationId,
          uploadedDataId: uploadResult.insertedId,
          ...analysisResult,
          createdAt: new Date(),
          createdBy: req.userId
        });

        await db.collection('uploaded_data').updateOne(
          { _id: uploadResult.insertedId },
          {
            $set: {
              status: 'completed',
              analysisId: result.insertedId
            }
          }
        );

        if (analysisResult.ruleResults?.length) {
          const risks = analysisResult.ruleResults
            .filter((r: any) => !r.passed)
            .map((r: any) => ({
              organizationId: req.user.organizationId,
              dataType,
              severity: r.severity,
              riskCategory: r.ruleName,
              description: r.details,
              detectedAt: new Date(),
              createdAt: new Date(),
              status: 'open'
            }));

          if (risks.length > 0) {
            await db.collection('privacy_risks').insertMany(risks);
          }
        }

        if (analysisResult.anomalies?.length) {
          const anomalies = analysisResult.anomalies.map((a: any) => ({
            organizationId: req.user.organizationId,
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
});

/**
 * ============================
 * 📊 Get Upload History
 * ============================
 */
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

/**
 * ============================
 * 📄 Get Single Upload Details
 * ============================
 */
router.get('/uploads/:id', async (req: AuthRequest, res: Response) => {
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
      organizationId: req.user.organizationId
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
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
});

/**
 * ============================
 * 📈 Get Analysis Result by analysisId
 * ============================
 */
router.get('/results/:analysisId', async (req: AuthRequest, res: Response) => {
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
      organizationId: req.user.organizationId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Analysis result not found'
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
});

/**
 * ============================
 * 🧠 Helper: Prepare Data
 * ============================
 */
function prepareAnalysisData(records: any[]): any {
  const permissions: any[] = [];
  const dataItems: any[] = [];
  const accessLogs: any[] = [];
  const users: any[] = [];

  for (const record of records.slice(0, 100)) {
    for (const [key, value] of Object.entries(record)) {
      const k = key.toLowerCase();

      if (k.includes('role') || k.includes('permission')) {
        permissions.push({ level: value });
      }

      if (k.includes('email') || k.includes('ssn') || k.includes('phone')) {
        dataItems.push({
          isSensitive: true,
          dataType: 'PHI',
          encrypted: false
        });
      }

      if (k.includes('timestamp') || k.includes('access')) {
        accessLogs.push({
          timestamp: new Date(),
          actionType: 'read'
        });
      }
    }

    if ((record as any).email) {
      users.push({ email: (record as any).email, consentGiven: true });
    }
  }

  return {
    permissions,
    dataItems: dataItems.length ? dataItems : [{ isSensitive: true, encrypted: false }],
    accessControl: { enabled: true },
    accessLogs,
    users: users.length ? users : [{ consentGiven: true }],
    auditLogging: true,
    retentionPolicy: { enabled: true }
  };
}

export default router;