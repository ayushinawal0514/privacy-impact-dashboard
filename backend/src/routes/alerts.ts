import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
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
    
    return res.json({ 
      success: true, 
      data: alerts,
      pagination: { total, limit: Number(limit), skip: Number(skip) }
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
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
    
    return res.status(201).json({ success: true, data: { _id: result.insertedId, ...alert } });
  } catch (error) {
    logger.error('Error creating alert:', error);
    return res.status(500).json({ success: false, message: 'Failed to create alert' });
  }
});

// Resolve alert
router.put('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    
    const updated = await db.collection('alerts').findOneAndUpdate(
      { _id: new ObjectId(id), organizationId: req.user.organizationId },
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
    
    if (!updated || !updated.value) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    
    return res.json({ success: true, data: updated.value });
  } catch (error) {
    logger.error('Error resolving alert:', error);
    return res.status(500).json({ success: false, message: 'Failed to resolve alert' });
  }
});

export default router;
