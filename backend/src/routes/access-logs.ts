import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get access logs with optional filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { userId, dataType, limit = 100, skip = 0 } = req.query;
    
    const filter: any = { organizationId: req.user.organizationId };
    if (userId) filter.userId = userId;
    if (dataType) filter.dataType = dataType;
    
    const logs = await db.collection('access_logs')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();
    
    const total = await db.collection('access_logs').countDocuments(filter);
    
    res.json({ 
      success: true, 
      data: logs,
      pagination: { total, limit: Number(limit), skip: Number(skip) }
    });
  } catch (error) {
    logger.error('Error fetching access logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch access logs' });
  }
});

// Log access event
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { userId, action, dataType, resourceId, timestamp } = req.body;
    
    const accessLog = {
      userId,
      action,
      dataType,
      resourceId,
      timestamp: timestamp || new Date(),
      organizationId: req.user.organizationId,
      loggedBy: req.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };
    
    const result = await db.collection('access_logs').insertOne(accessLog);
    
    res.status(201).json({ success: true, data: { _id: result.insertedId, ...accessLog } });
  } catch (error) {
    logger.error('Error logging access:', error);
    res.status(500).json({ success: false, message: 'Failed to log access' });
  }
});

// Get access analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    
    const totalAccesses = await db.collection('access_logs')
      .countDocuments({ organizationId: req.user.organizationId });
    
    const accessByType = await db.collection('access_logs').aggregate([
      { $match: { organizationId: req.user.organizationId } },
      { $group: { _id: '$dataType', count: { $sum: 1 } } }
    ]).toArray();
    
    const accessByUser = await db.collection('access_logs').aggregate([
      { $match: { organizationId: req.user.organizationId } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    res.json({ 
      success: true, 
      data: {
        totalAccesses,
        accessByType,
        topUsers: accessByUser
      }
    });
  } catch (error) {
    logger.error('Error fetching access analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

export default router;
