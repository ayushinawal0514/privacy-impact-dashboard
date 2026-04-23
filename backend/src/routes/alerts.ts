import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { logAccess } from '../services/accessLogger';

const router = Router();

function getAlertFilter(req: AuthRequest) {
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
 * Get all alerts
 * Supports filtering by:
 * - severity
 * - resolved
 * - datasetId
 * - datasetName
 * - type
 * ============================
 */
router.get('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const {
      severity,
      resolved,
      datasetId,
      datasetName,
      type,
      limit = 50,
      skip = 0
    } = req.query;

    const filter: any = {
      ...getAlertFilter(req)
    };

    if (severity && typeof severity === 'string' && severity !== 'all') {
      filter.severity = severity;
    }

    if (resolved !== undefined && resolved !== 'all') {
      filter.resolved = resolved === 'true';
    }

    if (type && typeof type === 'string' && type !== 'all') {
      filter.type = type;
    }

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      filter.datasetId = new ObjectId(datasetId);
    }

    if (datasetName && typeof datasetName === 'string') {
      filter.datasetName = datasetName.trim();
    }

    const alerts = await db.collection('alerts')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('alerts').countDocuments(filter);

    const summary = {
      critical: await db.collection('alerts').countDocuments({ ...filter, severity: 'critical' }),
      high: await db.collection('alerts').countDocuments({ ...filter, severity: 'high' }),
      medium: await db.collection('alerts').countDocuments({ ...filter, severity: 'medium' }),
      low: await db.collection('alerts').countDocuments({ ...filter, severity: 'low' }),
    };

    const datasets = await db.collection('alerts').aggregate([
      { $match: getAlertFilter(req) },
      {
        $group: {
          _id: '$datasetName',
          datasetId: { $first: '$datasetId' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // ✅ ACCESS LOG: read alerts list
    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: 'read',
      dataType: 'health',
      datasetId: typeof datasetId === 'string' ? datasetId : undefined,
      datasetName: typeof datasetName === 'string' ? datasetName.trim() : undefined,
      resourceId: 'alerts:list',
      status: 'success',
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.json({
      success: true,
      data: alerts,
      summary,
      datasets: datasets
        .filter((d: any) => d._id)
        .map((d: any) => ({
          datasetId: d.datasetId,
          datasetName: d._id,
          count: d.count
        })),
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

/**
 * ============================
 * Create alert
 * Manual create still supported, but now
 * aligns with dataset-linked rule-based flow
 * ============================
 */
router.post('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const {
      title,
      message,
      severity,
      type,
      affectedResources,
      datasetId,
      datasetName,
      triggeredByRule,
      riskId,
      recommendation
    } = req.body;

    const alert: any = {
      title,
      message,
      severity,
      type,
      affectedResources: Array.isArray(affectedResources) ? affectedResources : [],
      organizationId: req.user!.organizationId,
      createdAt: new Date(),
      createdBy: req.userId,
      resolved: false
    };

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      alert.datasetId = new ObjectId(datasetId);
    }

    if (datasetName) {
      alert.datasetName = String(datasetName).trim();
    }

    if (triggeredByRule) {
      alert.triggeredByRule = triggeredByRule;
    }

    if (recommendation) {
      alert.recommendation = recommendation;
    }

    if (riskId && typeof riskId === 'string' && ObjectId.isValid(riskId)) {
      alert.riskId = new ObjectId(riskId);
    }

    const result = await db.collection('alerts').insertOne(alert);

    // ✅ ACCESS LOG: create alert
    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: 'write',
      dataType: 'health',
      datasetId: typeof datasetId === 'string' ? datasetId : undefined,
      datasetName: typeof datasetName === 'string' ? datasetName.trim() : undefined,
      recordId: Array.isArray(affectedResources) && affectedResources.length > 0
        ? affectedResources[0]
        : undefined,
      resourceId: `alert:${result.insertedId.toString()}`,
      status: 'success',
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...alert }
    });
  } catch (error) {
    logger.error('Error creating alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create alert'
    });
  }
});

/**
 * ============================
 * Resolve alert
 * ============================
 */
router.put('/:id/resolve', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert id'
      });
    }

    const updated = await db.collection('alerts').findOneAndUpdate(
      {
        _id: new ObjectId(id),
        ...getAlertFilter(req)
      },
      {
        $set: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: req.userId,
          resolutionNotes: resolutionNotes || ''
        }
      },
      { returnDocument: 'after' }
    );

    const updatedDoc = (updated as any)?.value ?? updated;

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // ✅ ACCESS LOG: resolve/update alert
    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: 'update',
      dataType: 'health',
      datasetId: updatedDoc.datasetId?.toString?.(),
      datasetName: updatedDoc.datasetName,
      recordId: Array.isArray(updatedDoc.affectedResources) && updatedDoc.affectedResources.length > 0
        ? updatedDoc.affectedResources[0]
        : undefined,
      resourceId: `alert:${id}`,
      status: 'success',
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.json({
      success: true,
      data: updatedDoc
    });
  } catch (error) {
    logger.error('Error resolving alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve alert'
    });
  }
});

export default router;