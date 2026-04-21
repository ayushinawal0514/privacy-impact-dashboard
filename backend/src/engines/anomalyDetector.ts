// Anomaly Detection Engine
// Detects unusual patterns and behaviors in access logs and data

export interface AnomalyDetectionResult {
  anomalyId: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  confidence: number;
  affectedRecords: number;
  timestamp: Date;
  details: Record<string, any>;
}

class AnomalyDetector {
  // Thresholds
  private readonly UNUSUAL_ACCESS_THRESHOLD = 5; // 5x normal activity
  private readonly BULK_EXPORT_THRESHOLD = 1000; // records
  private readonly OFF_HOURS_THRESHOLD = 2; // 2AM - 5AM
  private readonly FAILED_LOGIN_THRESHOLD = 5; // attempts
  private readonly CONCURRENT_SESSION_THRESHOLD = 3;

  detectAnomalies(data: any): AnomalyDetectionResult[] {
    const anomalies: AnomalyDetectionResult[] = [];

    // Run all anomaly detectors
    anomalies.push(...this.detectUnusualAccessPatterns(data));
    anomalies.push(...this.detectBulkDataExport(data));
    anomalies.push(...this.detectOffHoursAccess(data));
    anomalies.push(...this.detectFailedLoginAttempts(data));
    anomalies.push(...this.detectConcurrentSessions(data));
    anomalies.push(...this.detectPrivilegeEscalation(data));
    anomalies.push(...this.detectDataAccessAnomalies(data));
    anomalies.push(...this.detectGeographicAnomalies(data));

    return anomalies;
  }

  private detectUnusualAccessPatterns(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.accessLogs || data.accessLogs.length === 0) return results;

    // Calculate access frequency per user
    const userAccessCount: Record<string, number> = {};
    const userNormalBehavior: Record<string, { avgAccess: number; stdDev: number }> = {};

    // Group by user
    for (const log of data.accessLogs) {
      userAccessCount[log.userId] = (userAccessCount[log.userId] || 0) + 1;
    }

    // Calculate baseline (normal behavior from historical data)
    for (const userId in userAccessCount) {
      const historicalData = data.userHistoryMap?.[userId] || { avgAccess: 10, stdDev: 3 };
      userNormalBehavior[userId] = historicalData;
    }

    // Detect anomalies
    for (const userId in userAccessCount) {
      const currentAccess = userAccessCount[userId];
      const baseline = userNormalBehavior[userId];
      const expectedMax = baseline.avgAccess + (3 * baseline.stdDev);

      if (currentAccess > expectedMax * this.UNUSUAL_ACCESS_THRESHOLD) {
        results.push({
          anomalyId: `unusual_access_${userId}_${Date.now()}`,
          type: 'unusual_access_frequency',
          severity: 'high',
          description: `User ${userId} accessing data at ${currentAccess}x normal frequency`,
          confidence: Math.min(95, 60 + (currentAccess / expectedMax) * 30),
          affectedRecords: currentAccess,
          timestamp: new Date(),
          details: {
            userId,
            currentAccess,
            expectedBaseline: expectedMax,
            ratio: (currentAccess / expectedMax).toFixed(2)
          }
        });
      }
    }

    return results;
  }

  private detectBulkDataExport(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.dataExports || data.dataExports.length === 0) return results;

    for (const exportRecord of data.dataExports) {
      // Detect bulk exports
      if (exportRecord.recordCount > this.BULK_EXPORT_THRESHOLD) {
        const severity = exportRecord.recordCount > (this.BULK_EXPORT_THRESHOLD * 5) 
          ? 'critical' 
          : 'high';

        results.push({
          anomalyId: `bulk_export_${exportRecord.userId}_${Date.now()}`,
          type: 'bulk_data_export',
          severity,
          description: `Large data export detected: ${exportRecord.recordCount} records exported by ${exportRecord.userId}`,
          confidence: Math.min(95, 70 + (exportRecord.recordCount / (this.BULK_EXPORT_THRESHOLD * 2)) * 25),
          affectedRecords: exportRecord.recordCount,
          timestamp: new Date(exportRecord.timestamp),
          details: {
            userId: exportRecord.userId,
            recordCount: exportRecord.recordCount,
            exportType: exportRecord.type,
            destination: exportRecord.destination || 'unknown'
          }
        });
      }
    }

    return results;
  }

  private detectOffHoursAccess(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.accessLogs || data.accessLogs.length === 0) return results;

    const offHoursAccess: Record<string, number> = {};

    for (const log of data.accessLogs) {
      const hour = new Date(log.timestamp).getHours();
      
      // Off-hours: 2 AM to 5 AM
      if (hour >= this.OFF_HOURS_THRESHOLD && hour <= 5) {
        offHoursAccess[log.userId] = (offHoursAccess[log.userId] || 0) + 1;
      }
    }

    // Flag unusual off-hours activity
    for (const userId in offHoursAccess) {
      if (offHoursAccess[userId] >= 3) {
        results.push({
          anomalyId: `offhours_access_${userId}_${Date.now()}`,
          type: 'off_hours_access',
          severity: 'medium',
          description: `${offHoursAccess[userId]} off-hours access attempts by ${userId}`,
          confidence: Math.min(90, 50 + offHoursAccess[userId] * 10),
          affectedRecords: offHoursAccess[userId],
          timestamp: new Date(),
          details: {
            userId,
            offHoursCount: offHoursAccess[userId],
            offHourRange: '2:00 AM - 5:00 AM'
          }
        });
      }
    }

    return results;
  }

  private detectFailedLoginAttempts(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.authLogs || data.authLogs.length === 0) return results;

    const failedAttempts: Record<string, { count: number; userId: string; ipAddresses: string[] }> = {};

    for (const authLog of data.authLogs) {
      if (authLog.status === 'failure') {
        if (!failedAttempts[authLog.userId]) {
          failedAttempts[authLog.userId] = { count: 0, userId: authLog.userId, ipAddresses: [] };
        }
        failedAttempts[authLog.userId].count++;
        if (!failedAttempts[authLog.userId].ipAddresses.includes(authLog.ipAddress)) {
          failedAttempts[authLog.userId].ipAddresses.push(authLog.ipAddress);
        }
      }
    }

    // Flag excessive failed attempts
    for (const userId in failedAttempts) {
      const attempts = failedAttempts[userId];
      if (attempts.count >= this.FAILED_LOGIN_THRESHOLD) {
        results.push({
          anomalyId: `failed_login_${userId}_${Date.now()}`,
          type: 'excessive_failed_logins',
          severity: attempts.count > 10 ? 'critical' : 'high',
          description: `${attempts.count} failed login attempts for user ${userId}`,
          confidence: Math.min(95, 60 + attempts.count * 5),
          affectedRecords: attempts.count,
          timestamp: new Date(),
          details: {
            userId,
            failedAttempts: attempts.count,
            ipAddresses: attempts.ipAddresses,
            possibleBruteForce: attempts.count > 10
          }
        });
      }
    }

    return results;
  }

  private detectConcurrentSessions(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.sessions || data.sessions.length === 0) return results;

    // Group active sessions by user
    const activeSessions: Record<string, any[]> = {};
    
    for (const session of data.sessions) {
      if (session.active === true) {
        if (!activeSessions[session.userId]) {
          activeSessions[session.userId] = [];
        }
        activeSessions[session.userId].push(session);
      }
    }

    // Detect excessive concurrent sessions
    for (const userId in activeSessions) {
      const sessionCount = activeSessions[userId].length;
      if (sessionCount > this.CONCURRENT_SESSION_THRESHOLD) {
        const ipAddresses = [...new Set(activeSessions[userId].map(s => s.ipAddress))];
        
        results.push({
          anomalyId: `concurrent_sessions_${userId}_${Date.now()}`,
          type: 'concurrent_sessions',
          severity: ipAddresses.length > 2 ? 'high' : 'medium',
          description: `User ${userId} has ${sessionCount} concurrent active sessions`,
          confidence: Math.min(90, 50 + sessionCount * 10),
          affectedRecords: sessionCount,
          timestamp: new Date(),
          details: {
            userId,
            sessionCount,
            ipAddresses,
            multipleIPs: ipAddresses.length > 1
          }
        });
      }
    }

    return results;
  }

  private detectPrivilegeEscalation(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.privilegeChanges || data.privilegeChanges.length === 0) return results;

    for (const change of data.privilegeChanges) {
      // Detect unauthorized or suspicious privilege escalation
      if (!change.approved || change.approvedBy === 'system') {
        results.push({
          anomalyId: `privilege_escalation_${change.userId}_${Date.now()}`,
          type: 'privilege_escalation',
          severity: 'critical',
          description: `Unauthorized privilege escalation for user ${change.userId}`,
          confidence: 90,
          affectedRecords: 1,
          timestamp: new Date(change.timestamp),
          details: {
            userId: change.userId,
            fromRole: change.fromRole,
            toRole: change.toRole,
            approved: change.approved,
            approvedBy: change.approvedBy
          }
        });
      }
    }

    return results;
  }

  private detectDataAccessAnomalies(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.dataAccess || data.dataAccess.length === 0) return results;

    // Detect access to sensitive data by low-privilege users
    for (const access of data.dataAccess) {
      if (access.dataSensitivity === 'high' && 
          access.userRole === 'user' && 
          access.accessType === 'read') {
        
        results.push({
          anomalyId: `sensitive_data_access_${access.userId}_${Date.now()}`,
          type: 'sensitive_data_access',
          severity: 'medium',
          description: `User with low privileges accessed sensitive data: ${access.dataCategory}`,
          confidence: 75,
          affectedRecords: 1,
          timestamp: new Date(access.timestamp),
          details: {
            userId: access.userId,
            userRole: access.userRole,
            dataCategory: access.dataCategory,
            dataSensitivity: access.dataSensitivity
          }
        });
      }
    }

    return results;
  }

  private detectGeographicAnomalies(data: any): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    if (!data.geoLocationData || data.geoLocationData.length === 0) return results;

    // Detect impossible travel (user in two locations in very short time)
    const userLocations: Record<string, any[]> = {};

    for (const location of data.geoLocationData) {
      if (!userLocations[location.userId]) {
        userLocations[location.userId] = [];
      }
      userLocations[location.userId].push(location);
    }

    for (const userId in userLocations) {
      const locations = userLocations[userId].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      for (let i = 0; i < locations.length - 1; i++) {
        const current = locations[i];
        const next = locations[i + 1];
        const timeDiff = (new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()) / 1000 / 60; // minutes

        // Rough calculation: 900 km/h is typical flight speed
        const distance = this.calculateDistance(current.latitude, current.longitude, next.latitude, next.longitude);
        const requiredTime = (distance / 900) * 60; // minutes

        if (timeDiff < requiredTime * 0.7 && distance > 1000) {
          results.push({
            anomalyId: `impossible_travel_${userId}_${Date.now()}`,
            type: 'impossible_travel',
            severity: 'high',
            description: `Impossible travel detected for user ${userId}`,
            confidence: 85,
            affectedRecords: 2,
            timestamp: new Date(),
            details: {
              userId,
              location1: `${current.latitude}, ${current.longitude}`,
              location2: `${next.latitude}, ${next.longitude}`,
              distanceKm: distance.toFixed(2),
              timeMinutes: timeDiff.toFixed(2),
              requiredTimeMinutes: requiredTime.toFixed(2)
            }
          });
        }
      }
    }

    return results;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const anomalyDetector = new AnomalyDetector();
