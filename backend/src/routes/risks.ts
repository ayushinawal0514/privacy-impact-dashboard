import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get all privacy risks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const risks = await db.collection('privacy_risks')
      .find({ organizationId: req.user.organizationId })
      .sort({ severity: -1, createdAt: -1 })
      .toArray();
    
    res.json({ success: true, data: risks });
  } catch (error) {
    logger.error('Error fetching risks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch risks' });
  }
});

// Get risk by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const risk = await db.collection('privacy_risks')
      .findOne({ _id: id, organizationId: req.user.organizationId });
    
    if (!risk) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }
    
    res.json({ success: true, data: risk });
  } catch (error) {
    logger.error('Error fetching risk:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch risk' });
  }
});

// Create new privacy risk
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { dataType, severity, description, affectedUsers, mitigationPlan } = req.body;
    
    const newRisk = {
      dataType,
      severity,
      description,
      affectedUsers,
      mitigationPlan,
      organizationId: req.user.organizationId,
      createdBy: req.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'open'
    };
    
    const result = await db.collection('privacy_risks').insertOne(newRisk);
    
    res.status(201).json({ success: true, data: { _id: result.insertedId, ...newRisk } });
  } catch (error) {
    logger.error('Error creating risk:', error);
    res.status(500).json({ success: false, message: 'Failed to create risk' });
  }
});

// Update privacy risk
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const updated = await db.collection('privacy_risks').findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      { 
        $set: {
          ...req.body,
          updatedAt: new Date(),
          updatedBy: req.userId
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!updated.value) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }
    
    res.json({ success: true, data: updated.value });
  } catch (error) {
    logger.error('Error updating risk:', error);
    res.status(500).json({ success: false, message: 'Failed to update risk' });
  }
});

// Delete privacy risk
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const result = await db.collection('privacy_risks').deleteOne({
      _id: id,
      organizationId: req.user.organizationId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }
    
    res.json({ success: true, message: 'Risk deleted successfully' });
  } catch (error) {
    logger.error('Error deleting risk:', error);
    res.status(500).json({ success: false, message: 'Failed to delete risk' });
  }
});

export default router;
