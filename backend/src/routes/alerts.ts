import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get all alerts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { severity, resolved, limit = 50, skip = 0 } = req.query;
    
    const filter: any = { organizationId: req.user.organizationId };
    if (severity) filter.severity = severity;
    if (resolved !== undefined) filter.resolved = resolved === 'true';
    
    const alerts = await db.collection('alerts')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();
    
    const total = await db.collection('alerts').countDocuments(filter);
    
    res.json({ 
      success: true, 
      data: alerts,
      pagination: { total, limit: Number(limit), skip: Number(skip) }
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
});

// Create alert
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { title, message, severity, type, affectedResources } = req.body;
    
    const alert = {
      title,
      message,
      severity,
      type,
      affectedResources,
      organizationId: req.user.organizationId,
      createdAt: new Date(),
      resolved: false
    };
    
    const result = await db.collection('alerts').insertOne(alert);
    
    res.status(201).json({ success: true, data: { _id: result.insertedId, ...alert } });
  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({ success: false, message: 'Failed to create alert' });
  }
});

// Resolve alert
router.put('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    
    const updated = await db.collection('alerts').findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        $set: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: req.userId,
          resolutionNotes
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!updated.value) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    
    res.json({ success: true, data: updated.value });
  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve alert' });
  }
});

export default router;
