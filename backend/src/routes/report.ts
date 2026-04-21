import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { ObjectId } from 'mongodb';

const router = Router();

// Generate compliance report
router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { reportName, reportType = 'custom', startDate, endDate } = req.body;

    if (!reportName) {
      return res.status(400).json({
        success: false,
        message: 'Report name is required'
      });
    }

    const start = new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = new Date(endDate || Date.now());

    // Fetch data for report
    const risks = await db.collection('privacy_risks')
      .find({
        organizationId: req.user.organizationId,
        createdAt: { $gte: start, $lte: end }
      })
      .toArray();

    const anomalies = await db.collection('anomalies')
      .find({
        organizationId: req.user.organizationId,
        timestamp: { $gte: start, $lte: end }
      })
      .toArray();

    const accessLogs = await db.collection('access_logs')
      .find({
        organizationId: req.user.organizationId,
        timestamp: { $gte: start, $lte: end }
      })
      .toArray();

    const analysisResults = await db.collection('analysis_results')
      .find({
        organizationId: req.user.organizationId,
        createdAt: { $gte: start, $lte: end }
      })
      .toArray();

    // Calculate metrics
    const riskSummary = {
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length
    };

    const anomalySummary = {
      critical: anomalies.filter(a => a.severity === 'critical').length,
      high: anomalies.filter(a => a.severity === 'high').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      low: anomalies.filter(a => a.severity === 'low').length
    };

    // Calculate compliance scores
    const avgComplianceScore = analysisResults.length > 0
      ? Math.round(analysisResults.reduce((sum, r) => sum + r.complianceScore, 0) / analysisResults.length)
      : 0;

    const avgHipaaScore = analysisResults.length > 0
      ? Math.round(analysisResults.reduce((sum, r) => sum + r.hipaaCompliance, 0) / analysisResults.length)
      : 0;

    const avgDpdpaScore = analysisResults.length > 0
      ? Math.round(analysisResults.reduce((sum, r) => sum + r.dpdpaCompliance, 0) / analysisResults.length)
      : 0;

    // Calculate access metrics
    const uniqueUsers = new Set(accessLogs.map(log => log.userId)).size;
    const failedAccess = accessLogs.filter(log => log.status === 'failure').length;

    // Create report document
    const report = {
      organizationId: req.user.organizationId,
      reportName,
      reportType,
      reportPeriod: {
        startDate: start,
        endDate: end
      },
      summary: {
        totalEvents: accessLogs.length,
        risksIdentified: risks.length,
        complianceScore: avgComplianceScore,
        hipaaCompliance: avgHipaaScore,
        dpdpaCompliance: avgDpdpaScore,
        anomaliesDetected: anomalies.length,
        uniqueUsers
      },
      details: {
        risks: riskSummary,
        anomalies: anomalySummary,
        accessMetrics: {
          totalAccess: accessLogs.length,
          failedAccess,
          uniqueUsers,
          readOperations: accessLogs.filter(l => l.actionType === 'read').length,
          writeOperations: accessLogs.filter(l => l.actionType === 'write').length,
          deleteOperations: accessLogs.filter(l => l.actionType === 'delete').length,
          exportOperations: accessLogs.filter(l => l.actionType === 'export').length
        }
      },
      topRisks: risks
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                 (severityOrder[a.severity as keyof typeof severityOrder] || 0);
        })
        .slice(0, 10),
      topAnomalies: anomalies
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10),
      recommendations: generateRecommendations(riskSummary, anomalySummary, avgComplianceScore),
      generatedBy: req.userId,
      generatedAt: new Date(),
      createdAt: new Date()
    };

    // Store report
    const result = await db.collection('audit_reports').insertOne(report);

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

// Get all reports
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { skip = 0, limit = 20, type } = req.query;

    const query: any = { organizationId: req.user.organizationId };
    if (type) query.reportType = type;

    const reports = await db.collection('audit_reports')
      .find(query)
      .sort({ generatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('audit_reports').countDocuments(query);

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

// Get report by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const report = await db.collection('audit_reports').findOne({
      _id: new ObjectId(id),
      organizationId: req.user.organizationId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Error fetching report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
});

// Delete report
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection('audit_reports').deleteOne({
      _id: new ObjectId(id),
      organizationId: req.user.organizationId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

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

// Generate recommendations based on findings
function generateRecommendations(
  riskSummary: any,
  anomalySummary: any,
  complianceScore: number
): string[] {
  const recommendations: string[] = [];

  // Severity-based recommendations
  if (riskSummary.critical > 0) {
    recommendations.push('URGENT: Immediately address all critical-severity risks.');
    recommendations.push('Conduct emergency security audit and implement remediation.');
  }

  if (riskSummary.high > 3) {
    recommendations.push('Review and prioritize high-severity risks for immediate resolution.');
  }

  // Anomaly-based recommendations
  if (anomalySummary.critical > 0) {
    recommendations.push('Investigate critical anomalies - potential security breach detected.');
  }

  // Compliance score recommendations
  if (complianceScore < 60) {
    recommendations.push('Significant compliance gaps identified. Implement comprehensive remediation plan.');
    recommendations.push('Consider third-party security assessment to identify root causes.');
  } else if (complianceScore < 80) {
    recommendations.push('Compliance score needs improvement. Focus on medium and high-severity issues.');
  } else {
    recommendations.push('Good compliance posture. Maintain current controls and continue monitoring.');
  }

  // General recommendations
  recommendations.push('Schedule regular compliance training for all staff members.');
  recommendations.push('Implement continuous monitoring and automated alerting.');
  recommendations.push('Review and update security policies quarterly.');
  recommendations.push('Conduct regular penetration testing and vulnerability assessments.');

  return recommendations.slice(0, 10);
}

export default router;
