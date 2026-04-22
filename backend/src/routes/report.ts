import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, roleMiddleware } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { logAccess } from '../services/accessLogger';

const router = Router();

function getReportFilter(req: AuthRequest) {
  const isAdmin = req.role === 'admin';

  return isAdmin
    ? { organizationId: req.user!.organizationId }
    : {
        organizationId: req.user!.organizationId,
        generatedBy: req.userId
      };
}

function severityValue(severity?: string) {
  const map: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };
  return map[String(severity || '').toLowerCase()] || 0;
}

/**
 * Generate recommendations based on actual dataset results
 */
function generateRecommendationsFromAnalysis(
  requirements: any,
  totalRisks: number,
  overallScore: number
): string[] {
  const recommendations: string[] = [];

  if ((requirements?.encryption?.score ?? 0) < 100) {
    recommendations.push('Enable encryption for all stored healthcare records.');
  }

  if ((requirements?.consent?.score ?? 0) < 100) {
    recommendations.push('Obtain and track explicit consent for all patient records.');
  }

  if ((requirements?.accessControl?.score ?? 0) < 100) {
    recommendations.push('Restrict access to approved healthcare roles only.');
  }

  if ((requirements?.auditLogging?.score ?? 0) < 100) {
    recommendations.push('Enable audit logging to maintain traceability.');
  }

  if ((requirements?.retention?.score ?? 0) < 100) {
    recommendations.push('Review and reduce retention periods according to policy.');
  }

  if (totalRisks > 0 && overallScore < 40) {
    recommendations.push('Immediate remediation is required due to significant compliance violations.');
  } else if (totalRisks > 0 && overallScore < 70) {
    recommendations.push('Prioritize remediation of critical and high-severity findings.');
  } else if (totalRisks === 0) {
    recommendations.push('Current dataset satisfies all monitored compliance checks.');
  }

  recommendations.push('Continue continuous monitoring and periodic compliance reviews.');

  return recommendations.slice(0, 10);
}

/**
 * ============================
 * Generate audit report from real dataset analysis
 * ============================
 */
router.post('/generate', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const {
      reportName,
      reportType = 'dataset',
      datasetId,
      datasetName,
      startDate,
      endDate
    } = req.body;

    if (!reportName) {
      return res.status(400).json({
        success: false,
        message: 'Report name is required'
      });
    }

    const analysisFilter: any = {
      organizationId: req.user!.organizationId
    };

    if (req.role !== 'admin') {
      analysisFilter.createdBy = req.userId;
    }

    if (datasetId && typeof datasetId === 'string' && ObjectId.isValid(datasetId)) {
      analysisFilter.datasetId = new ObjectId(datasetId);
    }

    if (datasetName && typeof datasetName === 'string') {
      analysisFilter.datasetName = datasetName.trim();
    }

    if (startDate || endDate) {
      analysisFilter.createdAt = {};
      if (startDate) analysisFilter.createdAt.$gte = new Date(startDate);
      if (endDate) analysisFilter.createdAt.$lte = new Date(endDate);
    }

    const latestAnalysisArr = await db.collection('dataset_analysis')
      .find(analysisFilter)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const latestAnalysis = latestAnalysisArr[0];

    if (!latestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'No dataset analysis found to generate report'
      });
    }

    const commonFilter: any = {
      organizationId: req.user!.organizationId,
      datasetId: latestAnalysis.datasetId
    };

    const risks = await db.collection('privacy_risks')
      .find(commonFilter)
      .sort({ createdAt: -1 })
      .toArray();

    const alerts = await db.collection('alerts')
      .find(commonFilter)
      .sort({ createdAt: -1 })
      .toArray();

    const accessLogs = await db.collection('access_logs')
      .find({
        organizationId: req.user!.organizationId,
        ...(latestAnalysis.datasetName ? { datasetName: latestAnalysis.datasetName } : {})
      })
      .sort({ timestamp: -1 })
      .toArray();

    const riskSummary = {
      critical: risks.filter((r: any) => r.severity === 'critical').length,
      high: risks.filter((r: any) => r.severity === 'high').length,
      medium: risks.filter((r: any) => r.severity === 'medium').length,
      low: risks.filter((r: any) => r.severity === 'low').length
    };

    const alertSummary = {
      critical: alerts.filter((a: any) => a.severity === 'critical').length,
      high: alerts.filter((a: any) => a.severity === 'high').length,
      medium: alerts.filter((a: any) => a.severity === 'medium').length,
      low: alerts.filter((a: any) => a.severity === 'low').length,
      resolved: alerts.filter((a: any) => a.resolved === true).length,
      open: alerts.filter((a: any) => a.resolved !== true).length
    };

    const normalizedAccessLogs = accessLogs.map((log: any) => ({
      ...log,
      normalizedAction: String(log.action || log.actionType || '').toLowerCase(),
      normalizedStatus: String(log.status || '').toLowerCase()
    }));

    const uniqueUsers = new Set(
      normalizedAccessLogs.map((log: any) => log.userId).filter(Boolean)
    ).size;

    const accessMetrics = {
      totalAccess: accessLogs.length,
      failedAccess: normalizedAccessLogs.filter((log: any) => log.normalizedStatus === 'failure').length,
      uniqueUsers,
      readOperations: normalizedAccessLogs.filter((log: any) => log.normalizedAction === 'read').length,
      writeOperations: normalizedAccessLogs.filter((log: any) => log.normalizedAction === 'write').length,
      updateOperations: normalizedAccessLogs.filter((log: any) => log.normalizedAction === 'update').length,
      deleteOperations: normalizedAccessLogs.filter((log: any) => log.normalizedAction === 'delete').length,
      exportOperations: normalizedAccessLogs.filter((log: any) => log.normalizedAction === 'export').length
    };

    const recommendations = generateRecommendationsFromAnalysis(
      latestAnalysis.compliance?.requirements || {},
      latestAnalysis.summary?.totalRisks || 0,
      latestAnalysis.compliance?.overallScore || 0
    );

    const report = {
      organizationId: req.user!.organizationId,
      datasetId: latestAnalysis.datasetId || null,
      datasetName: latestAnalysis.datasetName || null,
      reportName: String(reportName).trim(),
      reportType,
      reportPeriod: {
        startDate: startDate ? new Date(startDate) : latestAnalysis.createdAt,
        endDate: endDate ? new Date(endDate) : new Date()
      },
      summary: {
        totalRecords: latestAnalysis.summary?.totalRecords || 0,
        totalRisks: latestAnalysis.summary?.totalRisks || 0,
        complianceScore: latestAnalysis.compliance?.overallScore || 0,
        hipaaCompliance: latestAnalysis.compliance?.hipaaScore || 0,
        dpdpaCompliance: latestAnalysis.compliance?.dpdpaScore || 0,
        totalAlerts: alerts.length,
        totalAccessEvents: accessLogs.length,
        uniqueUsers
      },
      details: {
        risks: riskSummary,
        alerts: alertSummary,
        complianceRequirements: latestAnalysis.compliance?.requirements || {},
        accessMetrics
      },
      topRisks: risks
        .sort((a: any, b: any) => severityValue(b.severity) - severityValue(a.severity))
        .slice(0, 10),
      topAlerts: alerts
        .sort((a: any, b: any) => severityValue(b.severity) - severityValue(a.severity))
        .slice(0, 10),
      recommendations,
      source: 'dataset_analysis',
      generatedBy: req.userId,
      generatedAt: new Date(),
      createdAt: new Date()
    };

    const result = await db.collection('audit_reports').insertOne(report);

    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: 'export',
      dataType: 'health',
      datasetId: latestAnalysis.datasetId?.toString?.(),
      datasetName: latestAnalysis.datasetName,
      resourceId: `report:${result.insertedId.toString()}`,
      status: 'success',
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      reportId: result.insertedId,
      report
    });
  } catch (error) {
    logger.error('Error generating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

/**
 * ============================
 * Get all reports
 * ============================
 */
router.get('/', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { skip = 0, limit = 20, type, datasetName } = req.query;

    const query: any = {
      ...getReportFilter(req)
    };

    if (type && typeof type === 'string') {
      query.reportType = type;
    }

    if (datasetName && typeof datasetName === 'string') {
      query.datasetName = datasetName.trim();
    }

    const reports = await db.collection('audit_reports')
      .find(query)
      .sort({ generatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('audit_reports').countDocuments(query);

    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: 'read',
      dataType: 'health',
      datasetName: typeof datasetName === 'string' ? datasetName.trim() : undefined,
      resourceId: 'reports:list',
      status: 'success',
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.json({
      success: true,
      data: reports,
      pagination: { total, skip: Number(skip), limit: Number(limit) }
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

/**
 * ============================
 * Get report by ID
 * ============================
 */
router.get('/:id', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report id'
      });
    }

    const report = await db.collection('audit_reports').findOne({
      _id: new ObjectId(id),
      ...getReportFilter(req)
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: 'read',
      dataType: 'health',
      datasetId: report.datasetId?.toString?.(),
      datasetName: report.datasetName,
      resourceId: `report:${id}`,
      status: 'success',
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Error fetching report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
});

/**
 * ============================
 * Delete report
 * ============================
 */
router.delete('/:id', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report id'
      });
    }

    const report = await db.collection('audit_reports').findOne({
      _id: new ObjectId(id),
      ...getReportFilter(req)
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const result = await db.collection('audit_reports').deleteOne({
      _id: new ObjectId(id),
      ...getReportFilter(req)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await logAccess({
      userId: req.userId!,
      organizationId: req.user!.organizationId,
      action: 'delete',
      dataType: 'health',
      datasetId: report.datasetId?.toString?.(),
      datasetName: report.datasetName,
      resourceId: `report:${id}`,
      status: 'success',
      loggedBy: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined
    });

    return res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    });
  }
});

export default router;