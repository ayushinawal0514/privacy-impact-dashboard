import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get dashboard metrics
router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const orgId = req.user.organizationId;
    
    const totalUsers = await db.collection('users')
      .countDocuments({ organizationId: orgId });
    
    const activeRisks = await db.collection('privacy_risks')
      .countDocuments({ organizationId: orgId, status: 'open' });
    
    const complianceScore = await db.collection('compliance_reports')
      .findOne({ organizationId: orgId }, { sort: { createdAt: -1 } });
    
    const recentAlerts = await db.collection('alerts')
      .countDocuments({ organizationId: orgId, resolved: false });
    
    return res.json({
      success: true,
      data: {
        totalUsers,
        activeRisks,
        complianceScore: complianceScore?.overallScore || 0,
        pendingAlerts: recentAlerts
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
  }
});

// Get recent activity
router.get('/activity', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const orgId = req.user.organizationId;
    const { limit = 10 } = req.query;
    
    const recentLogs = await db.collection('access_logs')
      .find({ organizationId: orgId })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .toArray();
    
    const recentAlerts = await db.collection('alerts')
      .find({ organizationId: orgId, resolved: false })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();
    
    return res.json({
      success: true,
      data: {
        recentLogs,
        recentAlerts
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard activity:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
});

// Get compliance timeline
router.get('/compliance-timeline', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { limit = 12 } = req.query;
    
    const timeline = await db.collection('compliance_reports')
      .find({ organizationId: req.user.organizationId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();
    
    return res.json({ success: true, data: timeline });
  } catch (error) {
    logger.error('Error fetching compliance timeline:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
});

export default router;
