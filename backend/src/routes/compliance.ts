import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

function getComplianceFilter(req: AuthRequest) {
  const isAdmin = req.role === 'admin';

  return isAdmin
    ? { organizationId: req.user!.organizationId }
    : {
        organizationId: req.user!.organizationId,
        createdBy: req.userId
      };
}

/**
 * ============================
 * Get compliance status
 * Supports:
 * - latest overall
 * - by datasetId
 * - by datasetName
 * ============================
 */
router.get('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const baseFilter = getComplianceFilter(req);
    const { datasetId, datasetName } = req.query;

    const filter: any = { ...baseFilter };

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      filter.datasetId = new ObjectId(datasetId);
    }

    if (datasetName && typeof datasetName === 'string') {
      filter.datasetName = datasetName;
    }

    const complianceData = await db.collection('dataset_analysis')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const latest = complianceData[0];

    if (!latest) {
      return res.json({
        success: true,
        data: {
          datasetId: null,
          datasetName: null,
          hipaaCompliance: 0,
          dpdpaCompliance: 0,
          overallScore: 0,
          passedRules: 0,
          failedRules: 0,
          totalRisks: 0,
          requirements: {
            encryption: { passed: 0, failed: 0, score: 0 },
            consent: { passed: 0, failed: 0, score: 0 },
            accessControl: { passed: 0, failed: 0, score: 0 },
            auditLogging: { passed: 0, failed: 0, score: 0 },
            retention: { passed: 0, failed: 0, score: 0 }
          },
          lastUpdated: null
        }
      });
    }

    return res.json({
      success: true,
      data: {
        datasetId: latest.datasetId || null,
        datasetName: latest.datasetName || null,
        hipaaCompliance: latest.compliance?.hipaaScore || 0,
        dpdpaCompliance: latest.compliance?.dpdpaScore || 0,
        overallScore: latest.compliance?.overallScore || 0,
        passedRules: latest.compliance?.passedRules || 0,
        failedRules: latest.compliance?.failedRules || 0,
        totalRisks: latest.summary?.totalRisks || 0,
        requirements: latest.compliance?.requirements || {
          encryption: { passed: 0, failed: 0, score: 0 },
          consent: { passed: 0, failed: 0, score: 0 },
          accessControl: { passed: 0, failed: 0, score: 0 },
          auditLogging: { passed: 0, failed: 0, score: 0 },
          retention: { passed: 0, failed: 0, score: 0 }
        },
        lastUpdated: latest.createdAt || null
      }
    });
  } catch (error) {
    logger.error('Error fetching compliance status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance status'
    });
  }
});

/**
 * ============================
 * Generate compliance report
 * Creates snapshot from latest dataset_analysis
 * ============================
 */
router.post('/generate-report', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const baseFilter = getComplianceFilter(req);
    const { datasetId, datasetName } = req.body || {};

    const filter: any = { ...baseFilter };

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      filter.datasetId = new ObjectId(datasetId);
    }

    if (datasetName && typeof datasetName === 'string') {
      filter.datasetName = datasetName.trim();
    }

    const latestAnalysisArr = await db.collection('dataset_analysis')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const latestAnalysis = latestAnalysisArr[0];

    if (!latestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'No dataset analysis found to generate report'
      });
    }

    const report = {
      organizationId: req.user!.organizationId,
      datasetId: latestAnalysis.datasetId || null,
      datasetName: latestAnalysis.datasetName || null,
      hipaaCompliance: latestAnalysis.compliance?.hipaaScore || 0,
      dpdpaCompliance: latestAnalysis.compliance?.dpdpaScore || 0,
      overallScore: latestAnalysis.compliance?.overallScore || 0,
      passedRules: latestAnalysis.compliance?.passedRules || 0,
      failedRules: latestAnalysis.compliance?.failedRules || 0,
      totalRisks: latestAnalysis.summary?.totalRisks || 0,
      requirements: latestAnalysis.compliance?.requirements || {},
      createdAt: new Date(),
      createdBy: req.userId,
      status: 'completed',
      source: 'dataset_analysis'
    };

    const result = await db.collection('compliance_reports').insertOne(report);

    return res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...report }
    });
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

/**
 * ============================
 * Get compliance history
 * ============================
 */
router.get('/history', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const baseFilter = getComplianceFilter(req);
    const { limit = 12 } = req.query;

    const history = await db.collection('compliance_reports')
      .find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Error fetching compliance history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance history'
    });
  }
});

export default router;