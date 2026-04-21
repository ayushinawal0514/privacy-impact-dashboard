import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get audit reports
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { limit = 50, skip = 0 } = req.query;
    
    const reports = await db.collection('audit_reports')
      .find({ organizationId: req.user.organizationId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();
    
    const total = await db.collection('audit_reports')
      .countDocuments({ organizationId: req.user.organizationId });
    
    return res.json({ 
      success: true, 
      data: reports,
      pagination: { total, limit: Number(limit), skip: Number(skip) }
    });
  } catch (error) {
    logger.error('Error fetching audit reports:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit reports' });
  }
});

// Get audit report by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const report = await db.collection('audit_reports')
      .findOne({ _id: new ObjectId(id), organizationId: req.user.organizationId });
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    return res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Error fetching audit report:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit report' });
  }
});

// Create audit report
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { title, type, findings, recommendations } = req.body;
    
    const report = {
      title,
      type,
      findings,
      recommendations,
      organizationId: req.user.organizationId,
      createdBy: req.userId,
      createdAt: new Date(),
      status: 'draft'
    };
    
    const result = await db.collection('audit_reports').insertOne(report);
    
    return res.status(201).json({ success: true, data: { _id: result.insertedId, ...report } });
  } catch (error) {
    logger.error('Error creating audit report:', error);
    return res.status(500).json({ success: false, message: 'Failed to create audit report' });
  }
});

export default router;
