import { Router, Response } from 'express';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();
function getRoleBasedFilters(req: AuthRequest) {
  const orgId = req.user!.organizationId;
  const userId = req.userId!;
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
          $or: [{ userId }, { createdBy: userId }]
        },
    complianceFilter: isAdmin
      ? { organizationId: orgId }
      : {
          organizationId: orgId,
          $or: [{ createdBy: userId }, { uploadedBy: userId }]
        }
  };
}

async function getLatestUploadWithUser(req: AuthRequest) {
  const db = getDB();
  const filters = getRoleBasedFilters(req);

  const pipeline: any[] = [
    { $match: filters.uploadsFilter },
    { $sort: { uploadedAt: -1 } },
    { $limit: 1 }
  ];

  if (filters.isAdmin) {
    pipeline.push(
      {
        $addFields: {
          uploadedByObjectId: {
            $convert: {
              input: '$uploadedBy',
              to: 'objectId',
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedByObjectId',
          foreignField: '_id',
          as: 'uploader'
        }
      },
      {
        $addFields: {
          uploadedByUser: {
            $cond: [
              { $gt: [{ $size: '$uploader' }, 0] },
              {
                id: { $arrayElemAt: ['$uploader._id', 0] },
                email: { $arrayElemAt: ['$uploader.email', 0] },
                name: { $arrayElemAt: ['$uploader.name', 0] },
                role: { $arrayElemAt: ['$uploader.role', 0] }
              },
              null
            ]
          }
        }
      },
      {
        $project: {
          uploader: 0,
          uploadedByObjectId: 0
        }
      }
    );
  }

  const result = await db.collection('uploaded_data').aggregate(pipeline).toArray();
  return result[0] || null;
}

async function getRecentUploadsWithUser(req: AuthRequest, limit = 5) {
  const db = getDB();
  const filters = getRoleBasedFilters(req);

  const pipeline: any[] = [
    { $match: filters.uploadsFilter },
    { $sort: { uploadedAt: -1 } },
    { $limit: limit }
  ];

  if (filters.isAdmin) {
    pipeline.push(
      {
        $addFields: {
          uploadedByObjectId: {
            $convert: {
              input: '$uploadedBy',
              to: 'objectId',
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedByObjectId',
          foreignField: '_id',
          as: 'uploader'
        }
      },
      {
        $addFields: {
          uploadedByUser: {
            $cond: [
              { $gt: [{ $size: '$uploader' }, 0] },
              {
                id: { $arrayElemAt: ['$uploader._id', 0] },
                email: { $arrayElemAt: ['$uploader.email', 0] },
                name: { $arrayElemAt: ['$uploader.name', 0] },
                role: { $arrayElemAt: ['$uploader.role', 0] }
              },
              null
            ]
          }
        }
      },
      {
        $project: {
          uploader: 0,
          uploadedByObjectId: 0
        }
      }
    );
  }

  return db.collection('uploaded_data').aggregate(pipeline).toArray();
}

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

      const totalUploads = await db.collection('uploaded_data').countDocuments(filters.uploadsFilter);

      const activeRisks = await db.collection('privacy_risks').countDocuments({
        ...filters.risksFilter,
        status: 'open'
      });

      const pendingAlerts = await db.collection('alerts').countDocuments({
        ...filters.alertsFilter,
        resolved: false
      });

      const latestAnalysisArr = await db.collection('dataset_analysis')
        .find(filters.analysisFilter)
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      const latest = latestAnalysisArr[0] || null;

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalUploads,
          activeRisks,
          complianceScore: latest?.compliance?.overallScore || 0,
          hipaaCompliance: latest?.compliance?.hipaaScore || 0,
          dpdpaCompliance: latest?.compliance?.dpdpaScore || 0,
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

      const recentUploads = filters.isAdmin
        ? await getRecentUploadsWithUser(req, Number(limit))
        : await db.collection('uploaded_data')
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

router.get(
  '/compliance-timeline',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const filters = getRoleBasedFilters(req);
      const { limit = 12 } = req.query;

      const timeline = await db.collection('dataset_analysis')
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
router.get(
  '/summary',
  roleMiddleware(['admin', 'user']),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const filters = getRoleBasedFilters(req);

      const latestUpload = await getLatestUploadWithUser(req);

      const latestAnalysisArr = await db.collection('dataset_analysis')
        .find(filters.analysisFilter)
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();
      const latestAnalysis = latestAnalysisArr[0] || null;

      const totalUploads = await db.collection('uploaded_data').countDocuments(filters.uploadsFilter);
      const recentUploads = filters.isAdmin
        ? await getRecentUploadsWithUser(req, 5)
        : await db.collection('uploaded_data')
            .find(filters.uploadsFilter)
            .sort({ uploadedAt: -1 })
            .limit(5)
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
          totalUploads,
          latestUpload,
          latestAnalysis,
          recentUploads,
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