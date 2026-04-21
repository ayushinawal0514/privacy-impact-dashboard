import { Router, Response } from 'express';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

/**
 * Build role-aware Mongo filters
 */
function getRoleBasedFilters(req: AuthRequest) {
  const orgId = req.user?.organizationId;
  const userId = req.userId;

  const isAdmin = req.role === 'admin';

  return {
    isAdmin,
    orgId,
    userId,

    usersFilter: isAdmin
      ? { organizationId: orgId }
      : { organizationId: orgId, _id: { $exists: true } },

    risksFilter: isAdmin
      ? { organizationId: orgId }
      : { organizationId: orgId, createdBy: userId },

    alertsFilter: isAdmin
      ? { organizationId: orgId }
      : { organizationId: orgId, createdBy: userId },

    uploadsFilter: isAdmin
      ? { organizationId: orgId }
      : { organizationId: orgId, uploadedBy: userId },

    analysisFilter: isAdmin
      ? { organizationId: orgId }
      : { organizationId: orgId, createdBy: userId },

    accessLogsFilter: isAdmin
      ? { organizationId: orgId }
      : {
          organizationId: orgId,
          $or: [
            { userId: userId },
            { createdBy: userId }
          ]
        },

    complianceFilter: isAdmin
      ? { organizationId: orgId }
      : {
          organizationId: orgId,
          $or: [
            { createdBy: userId },
            { uploadedBy: userId }
          ]
        }
  };
}

/**
 * ============================
 * Dashboard Metrics
 * ============================
 */
router.get(
  '/metrics',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const filters = getRoleBasedFilters(req);

      const totalUsers = filters.isAdmin
        ? await db.collection('users').countDocuments({ organizationId: filters.orgId })
        : 1;

      const activeRisks = await db.collection('privacy_risks').countDocuments({
        ...filters.risksFilter,
        status: 'open'
      });

      const pendingAlerts = await db.collection('alerts').countDocuments({
        ...filters.alertsFilter,
        resolved: false
      });

      const latestAnalysis = await db.collection('analysis_results')
        .find(filters.analysisFilter)
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      const latest = latestAnalysis[0];

      return res.json({
        success: true,
        data: {
          totalUsers,
          activeRisks,
          complianceScore: latest?.complianceScore || 0,
          hipaaCompliance: latest?.hipaaCompliance || 0,
          dpdpaCompliance: latest?.dpdpaCompliance || 0,
          pendingAlerts,
          role: req.role
        }
      });
    } catch (error) {
      logger.error('Error fetching dashboard metrics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch metrics'
      });
    }
  }
);

/**
 * ============================
 * Recent Activity
 * ============================
 */
router.get(
  '/activity',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const filters = getRoleBasedFilters(req);
      const { limit = 10 } = req.query;

      const recentLogs = await db.collection('access_logs')
        .find(filters.accessLogsFilter)
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .toArray();

      const recentAlerts = await db.collection('alerts')
        .find({ ...filters.alertsFilter, resolved: false })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .toArray();

      const recentUploads = await db.collection('uploaded_data')
        .find(filters.uploadsFilter)
        .sort({ uploadedAt: -1 })
        .limit(Number(limit))
        .toArray();

      return res.json({
        success: true,
        data: {
          recentLogs,
          recentAlerts,
          recentUploads,
          role: req.role
        }
      });
    } catch (error) {
      logger.error('Error fetching dashboard activity:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch activity'
      });
    }
  }
);

/**
 * ============================
 * Compliance Timeline
 * ============================
 */
router.get(
  '/compliance-timeline',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const filters = getRoleBasedFilters(req);
      const { limit = 12 } = req.query;

      const timeline = await db.collection('analysis_results')
        .find(filters.analysisFilter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .toArray();

      return res.json({
        success: true,
        data: timeline,
        role: req.role
      });
    } catch (error) {
      logger.error('Error fetching compliance timeline:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline'
      });
    }
  }
);

/**
 * ============================
 * Role-aware Dashboard Summary
 * ============================
 */
router.get(
  '/summary',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const filters = getRoleBasedFilters(req);

      const latestUpload = await db.collection('uploaded_data')
        .find(filters.uploadsFilter)
        .sort({ uploadedAt: -1 })
        .limit(1)
        .toArray();

      const latestAnalysis = await db.collection('analysis_results')
        .find(filters.analysisFilter)
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      const riskCounts = {
        critical: await db.collection('privacy_risks').countDocuments({
          ...filters.risksFilter,
          severity: 'critical'
        }),
        high: await db.collection('privacy_risks').countDocuments({
          ...filters.risksFilter,
          severity: 'high'
        }),
        medium: await db.collection('privacy_risks').countDocuments({
          ...filters.risksFilter,
          severity: 'medium'
        }),
        low: await db.collection('privacy_risks').countDocuments({
          ...filters.risksFilter,
          severity: 'low'
        })
      };

      return res.json({
        success: true,
        data: {
          role: req.role,
          latestUpload: latestUpload[0] || null,
          latestAnalysis: latestAnalysis[0] || null,
          risks: riskCounts
        }
      });
    } catch (error) {
      logger.error('Error fetching dashboard summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard summary'
      });
    }
  }
);

export default router;