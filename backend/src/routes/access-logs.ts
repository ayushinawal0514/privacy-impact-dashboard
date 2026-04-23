import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

function getAccessFilter(req: AuthRequest) {
  const isAdmin = req.role === 'admin';

  return isAdmin
    ? { organizationId: req.user!.organizationId }
    : {
        organizationId: req.user!.organizationId,
        $or: [{ userId: req.userId }, { loggedBy: req.userId }]
      };
}

router.get('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const {
      userId,
      dataType,
      datasetId,
      datasetName,
      action,
      status,
      limit = 100,
      skip = 0
    } = req.query;

    const filter: any = { ...getAccessFilter(req) };

    if (userId) filter.userId = userId;
    if (dataType) filter.dataType = dataType;
    if (action) filter.action = String(action).toLowerCase();
    if (status) filter.status = String(status).toLowerCase();

    if (datasetName && typeof datasetName === 'string') {
      filter.datasetName = datasetName.trim();
    }

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      filter.datasetId = new ObjectId(datasetId);
    }

    const logs = await db.collection('access_logs')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('access_logs').countDocuments(filter);

    return res.json({
      success: true,
      data: logs,
      pagination: { total, limit: Number(limit), skip: Number(skip) }
    });
  } catch (error) {
    logger.error('Error fetching access logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch access logs'
    });
  }
});

router.post('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const {
      userId,
      action,
      dataType,
      resourceId,
      recordId,
      datasetId,
      datasetName,
      status,
      timestamp
    } = req.body;

    const accessLog: any = {
      userId: userId || req.userId,
      action: String(action || '').toLowerCase(),
      dataType,
      resourceId: resourceId || recordId || null,
      recordId: recordId || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: String(status || 'success').toLowerCase(),
      organizationId: req.user!.organizationId,
      loggedBy: req.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    if (datasetName) {
      accessLog.datasetName = String(datasetName).trim();
    }

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      accessLog.datasetId = new ObjectId(datasetId);
    }

    const result = await db.collection('access_logs').insertOne(accessLog);

    return res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...accessLog }
    });
  } catch (error) {
    logger.error('Error logging access:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log access'
    });
  }
});

router.get('/analytics', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const baseFilter = getAccessFilter(req);

    const totalAccesses = await db.collection('access_logs')
      .countDocuments(baseFilter);

    const uniqueUsersAgg = await db.collection('access_logs').aggregate([
      { $match: baseFilter },
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]).toArray();

    const uniqueUsers = uniqueUsersAgg[0]?.count || 0;

    const accessByType = await db.collection('access_logs').aggregate([
      { $match: baseFilter },
      { $group: { _id: '$dataType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const accessByAction = await db.collection('access_logs').aggregate([
      { $match: baseFilter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const accessByUser = await db.collection('access_logs').aggregate([
      { $match: baseFilter },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    const failedAccesses = await db.collection('access_logs')
      .countDocuments({ ...baseFilter, status: 'failure' });

    const datasetActivity = await db.collection('access_logs').aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$datasetName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    return res.json({
      success: true,
      data: {
        totalAccesses,
        uniqueUsers,
        failedAccesses,
        accessByType,
        accessByAction,
        topUsers: accessByUser,
        datasetActivity
      }
    });
  } catch (error) {
    logger.error('Error fetching access analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

export default router;