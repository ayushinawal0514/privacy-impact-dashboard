import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { logAccess } from '../services/accessLogger'; // ✅ ADD

const router = Router();

function getRiskFilter(req: AuthRequest) {
  const isAdmin = req.role === 'admin';

  return isAdmin
    ? { organizationId: req.user!.organizationId }
    : {
        organizationId: req.user!.organizationId,
        createdBy: req.userId
      };
}

router.get('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const baseFilter = getRiskFilter(req);

    const {
      severity,
      status,
      datasetId,
      datasetName,
      dataType,
      skip = 0,
      limit = 200
    } = req.query;

    const filter: any = { ...baseFilter };

    if (severity && typeof severity === 'string' && severity !== 'all') {
      filter.severity = severity;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    if (dataType && typeof dataType === 'string' && dataType !== 'all') {
      filter.dataType = dataType;
    }

    if (datasetName && typeof datasetName === 'string') {
      filter.datasetName = datasetName.trim();
    }

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      filter.datasetId = new ObjectId(datasetId);
    }

    const risks = await db.collection('privacy_risks')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('privacy_risks').countDocuments(filter);

    const summary = {
      critical: await db.collection('privacy_risks').countDocuments({ ...filter, severity: 'critical' }),
      high: await db.collection('privacy_risks').countDocuments({ ...filter, severity: 'high' }),
      medium: await db.collection('privacy_risks').countDocuments({ ...filter, severity: 'medium' }),
      low: await db.collection('privacy_risks').countDocuments({ ...filter, severity: 'low' }),
    };

    const datasetOptions = await db.collection('privacy_risks').aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$datasetName',
          datasetId: { $first: '$datasetId' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: "read",
      dataType: typeof dataType === 'string' ? dataType : 'health',
      datasetId: typeof datasetId === 'string' ? datasetId : undefined,
      datasetName: typeof datasetName === 'string' ? datasetName.trim() : undefined,
      resourceId: "risks:list",
      status: "success",
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.json({
      success: true,
      role: req.role,
      count: total,
      summary,
      datasets: datasetOptions.map((d: any) => ({
        datasetId: d.datasetId,
        datasetName: d._id,
        count: d.count
      })),
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

router.get('/:id', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid risk id'
      });
    }

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

    // ✅ LOG ACCESS (READ SINGLE)
    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: "read",
      dataType: risk.dataType || 'health',
      datasetId: risk.datasetId?.toString?.(),
      datasetName: risk.datasetName,
      recordId: risk.recordId,
      resourceId: `risk:${id}`,
      status: "success",
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

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
    const {
      dataType,
      severity,
      description,
      datasetId,
      datasetName,
      recordId
    } = req.body;

    const newRisk: any = {
      dataType,
      severity,
      description,
      organizationId: req.user!.organizationId,
      createdBy: req.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'open'
    };

    if (datasetId && ObjectId.isValid(datasetId)) {
      newRisk.datasetId = new ObjectId(datasetId);
    }

    if (datasetName) newRisk.datasetName = datasetName.trim();
    if (recordId) newRisk.recordId = recordId;

    const result = await db.collection('privacy_risks').insertOne(newRisk);

    // ✅ LOG CREATE
    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: "write",
      dataType,
      datasetId,
      datasetName,
      recordId,
      resourceId: `risk:${result.insertedId}`,
      status: "success",
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

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
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const updatedDoc = (updated as any)?.value ?? updated;

    if (!updatedDoc) {
      return res.status(404).json({ success: false });
    }

    // ✅ LOG UPDATE
    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: "update",
      dataType: updatedDoc.dataType,
      datasetId: updatedDoc.datasetId?.toString?.(),
      datasetName: updatedDoc.datasetName,
      recordId: updatedDoc.recordId,
      resourceId: `risk:${id}`,
      status: "success"
    });

    return res.json({ success: true, data: updatedDoc });

  } catch (error) {
    logger.error('Error updating risk:', error);
    return res.status(500).json({ success: false });
  }
});

/**
 * ============================
 * Delete risk
 * ============================
 */
router.delete('/:id', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection('privacy_risks').deleteOne({
      _id: new ObjectId(id),
      organizationId: req.user!.organizationId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false });
    }

    // ✅ LOG DELETE
    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: "delete",
      resourceId: `risk:${id}`,
      status: "success"
    });

    return res.json({ success: true });

  } catch (error) {
    logger.error('Error deleting risk:', error);
    return res.status(500).json({ success: false });
  }
});

export default router;