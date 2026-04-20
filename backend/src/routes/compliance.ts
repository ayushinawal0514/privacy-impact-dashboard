import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get compliance status
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    
    const complianceData = await db.collection('compliance_reports')
      .findOne({ organizationId: req.user.organizationId }, { sort: { createdAt: -1 } });
    
    if (!complianceData) {
      return res.json({ 
        success: true, 
        data: {
          hipaaCompliance: 0,
          dpdpaCompliance: 0,
          overallScore: 0,
          lastUpdated: null
        }
      });
    }
    
    res.json({ success: true, data: complianceData });
  } catch (error) {
    logger.error('Error fetching compliance status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch compliance status' });
  }
});

// Generate compliance report
router.post('/generate-report', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    
    // Collect risk data
    const risks = await db.collection('privacy_risks')
      .find({ organizationId: req.user.organizationId })
      .toArray();
    
    // Calculate HIPAA compliance
    const hipaaRisks = risks.filter((r: any) => r.dataType === 'PHI');
    const hipaaScore = Math.max(0, 100 - (hipaaRisks.length * 15));
    
    // Calculate DPDPA compliance
    const dpdpaRisks = risks.filter((r: any) => r.dataType === 'PPI');
    const dpdpaScore = Math.max(0, 100 - (dpdpaRisks.length * 15));
    
    const report = {
      organizationId: req.user.organizationId,
      hipaaCompliance: hipaaScore,
      dpdpaCompliance: dpdpaScore,
      overallScore: (hipaaScore + dpdpaScore) / 2,
      riskCount: risks.length,
      createdAt: new Date(),
      createdBy: req.userId,
      status: 'completed'
    };
    
    const result = await db.collection('compliance_reports').insertOne(report);
    
    res.status(201).json({ 
      success: true, 
      data: { _id: result.insertedId, ...report }
    });
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// Get compliance history
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { limit = 12 } = req.query;
    
    const history = await db.collection('compliance_reports')
      .find({ organizationId: req.user.organizationId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();
    
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('Error fetching compliance history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch compliance history' });
  }
});

export default router;
