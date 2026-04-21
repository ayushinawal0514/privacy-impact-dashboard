import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

/**
 * Helper: Role-based filter
 */
function getRiskFilter(req: AuthRequest) {
  const isAdmin = req.role === 'admin';

  return isAdmin
    ? { organizationId: req.user!.organizationId }
    : {
        organizationId: req.user!.organizationId,
        createdBy: req.userId
      };
}

/**
 * ============================
 * Get all risks
 * ============================
 */
router.get('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const filter = getRiskFilter(req);

    const risks = await db.collection('privacy_risks')
      .find(filter)
      .sort({ severity: -1, createdAt: -1 })
      .toArray();

    return res.json({
      success: true,
      role: req.role,
      count: risks.length,
      data: risks
    });
  } catch (error) {
    logger.error('Error fetching risks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch risks'
    });
  }
});

/**
 * ============================
 * Get risk by ID
 * ============================
 */
router.get('/:id', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const filter = {
      _id: new ObjectId(id),
      ...getRiskFilter(req)
    };

    const risk = await db.collection('privacy_risks').findOne(filter);

    if (!risk) {
      return res.status(404).json({
        success: false,
        message: 'Risk not found or access denied'
      });
    }

    return res.json({ success: true, data: risk });
  } catch (error) {
    logger.error('Error fetching risk:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch risk'
    });
  }
});

/**
 * ============================
 * Create new risk
 * ============================
 */
router.post('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { dataType, severity, description, affectedUsers, mitigationPlan } = req.body;

    const newRisk = {
      dataType,
      severity,
      description,
      affectedUsers,
      mitigationPlan,
      organizationId: req.user!.organizationId,
      createdBy: req.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'open'
    };

    const result = await db.collection('privacy_risks').insertOne(newRisk);

    return res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...newRisk }
    });
  } catch (error) {
    logger.error('Error creating risk:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create risk'
    });
  }
});

/**
 * ============================
 * Update risk
 * ============================
 */
router.put('/:id', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const filter = {
      _id: new ObjectId(id),
      ...getRiskFilter(req)
    };

    const updated = await db.collection('privacy_risks').findOneAndUpdate(
      filter,
      {
        $set: {
          ...req.body,
          updatedAt: new Date(),
          updatedBy: req.userId
        }
      },
      { returnDocument: 'after' }
    );

    if (!updated || !updated.value) {
      return res.status(404).json({
        success: false,
        message: 'Risk not found or access denied'
      });
    }

    return res.json({
      success: true,
      data: updated.value
    });
  } catch (error) {
    logger.error('Error updating risk:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update risk'
    });
  }
});

/**
 * ============================
 * Delete risk (ADMIN ONLY)
 * ============================
 */
router.delete('/:id',
  roleMiddleware(['admin']),   // 🔥 only admin can delete
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const { id } = req.params;

      const result = await db.collection('privacy_risks').deleteOne({
        _id: new ObjectId(id),
        organizationId: req.user!.organizationId
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Risk not found'
        });
      }

      return res.json({
        success: true,
        message: 'Risk deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting risk:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete risk'
      });
    }
  }
);

export default router;