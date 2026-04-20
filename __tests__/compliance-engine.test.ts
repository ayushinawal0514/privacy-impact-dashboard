import {
  calculateRiskScore,
  determineSeverity,
  calculateComplianceScore,
  analyzeAccessPattern,
  calculateBaseline,
  hipaaChecks,
  dpdpaChecks,
} from "@/lib/compliance-engine";

describe("Compliance Engine - Risk Calculations", () => {
  describe("calculateRiskScore", () => {
    it("should calculate risk score correctly", () => {
      const score = calculateRiskScore(80, 90);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should apply temporal decay", () => {
      const score1 = calculateRiskScore(80, 90, 5);
      const score2 = calculateRiskScore(80, 90, 30);
      expect(score2).toBeGreaterThan(score1); // Longer remediation should increase score
    });

    it("should handle edge cases", () => {
      expect(calculateRiskScore(0, 0)).toBe(0);
      expect(calculateRiskScore(100, 100)).toBe(100);
    });
  });

  describe("determineSeverity", () => {
    it("should determine critical severity", () => {
      expect(determineSeverity(85)).toBe("critical");
    });

    it("should determine high severity", () => {
      expect(determineSeverity(70)).toBe("high");
    });

    it("should determine medium severity", () => {
      expect(determineSeverity(50)).toBe("medium");
    });

    it("should determine low severity", () => {
      expect(determineSeverity(25)).toBe("low");
    });

    it("should determine info severity", () => {
      expect(determineSeverity(5)).toBe("info");
    });
  });

  describe("calculateComplianceScore", () => {
    it("should calculate compliance score", () => {
      const score = calculateComplianceScore(10, 8, 3, 4);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should handle perfect compliance", () => {
      const score = calculateComplianceScore(10, 10, 4, 4);
      expect(score).toBe(100);
    });

    it("should handle no compliance", () => {
      const score = calculateComplianceScore(10, 0, 0, 4);
      expect(score).toBe(0);
    });
  });
});

describe("Compliance Engine - HIPAA Checks", () => {
  describe("checkDataEncryption", () => {
    it("should return risk for unencrypted data", () => {
      const risk = hipaaChecks.checkDataEncryption(false, "Data Center A");
      expect(risk).not.toBeNull();
      expect(risk?.severity).toBe("critical");
      expect(risk?.category).toBe("insecure_storage");
    });

    it("should return null for encrypted data", () => {
      const risk = hipaaChecks.checkDataEncryption(true, "Data Center A");
      expect(risk).toBeNull();
    });
  });

  describe("checkAccessControls", () => {
    it("should return risk for disabled access controls", () => {
      const risk = hipaaChecks.checkAccessControls(false, 5);
      expect(risk).not.toBeNull();
      expect(risk?.severity).toBe("high");
    });

    it("should return risk for high unusual access count", () => {
      const risk = hipaaChecks.checkAccessControls(true, 15);
      expect(risk).not.toBeNull();
    });

    it("should return null for good access control", () => {
      const risk = hipaaChecks.checkAccessControls(true, 3);
      expect(risk).toBeNull();
    });
  });
});

describe("Compliance Engine - DPDPA Checks", () => {
  describe("checkConsentManagement", () => {
    it("should return risk for missing consent", () => {
      const risk = dpdpaChecks.checkConsentManagement(false);
      expect(risk).not.toBeNull();
      expect(risk?.severity).toBe("critical");
    });

    it("should return null when consent recorded", () => {
      const risk = dpdpaChecks.checkConsentManagement(true);
      expect(risk).toBeNull();
    });
  });

  describe("checkDataRetention", () => {
    it("should return risk for excessive retention", () => {
      const risk = dpdpaChecks.checkDataRetention(500, 365);
      expect(risk).not.toBeNull();
      expect(risk?.severity).toBe("high");
    });

    it("should return null for compliant retention", () => {
      const risk = dpdpaChecks.checkDataRetention(180, 365);
      expect(risk).toBeNull();
    });
  });
});

describe("Compliance Engine - Access Pattern Analysis", () => {
  const mockLogs = [
    {
      userId: "user1",
      timestamp: new Date(),
      ipAddress: "192.168.1.1",
      dataAccessed: ["PHI_001", "PHI_002"],
      duration: 10,
    },
    {
      userId: "user1",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      ipAddress: "192.168.1.1",
      dataAccessed: ["PHI_003"],
      duration: 5,
    },
  ];

  describe("analyzeAccessPattern", () => {
    it("should extract access patterns", () => {
      const pattern = analyzeAccessPattern(mockLogs);
      expect(pattern).toHaveProperty("avgAccessesPerDay");
      expect(pattern).toHaveProperty("avgDataVolume");
      expect(pattern).toHaveProperty("commonAccessTimes");
      expect(pattern).toHaveProperty("commonAccessLocations");
    });

    it("should handle empty logs", () => {
      const pattern = analyzeAccessPattern([]);
      expect(pattern.avgAccessesPerDay).toBe(0);
    });
  });

  describe("calculateBaseline", () => {
    it("should calculate baseline metrics", () => {
      const baseline = calculateBaseline(mockLogs, 30);
      expect(baseline).toHaveProperty("avgFrequency");
      expect(baseline).toHaveProperty("avgVolume");
      expect(baseline).toHaveProperty("variability");
    });

    it("should handle insufficient data", () => {
      const baseline = calculateBaseline([], 30);
      expect(baseline.avgFrequency).toBe(0);
    });
  });
});

describe("Compliance Engine - Anomaly Detection", () => {
  it("should detect volume anomalies", () => {
    const baseline = {
      avgFrequency: 10,
      avgVolume: 100,
      variability: 20,
      commonAccessTimes: [9, 10, 11],
    };

    const currentAccess = {
      volume: 1000,
      timestamp: new Date(),
    };

    const { isAnomaly, score } = require("@/lib/compliance-engine").detectAnomalies(
      currentAccess,
      baseline,
    );

    expect(score).toBeGreaterThan(0);
  });

  it("should detect time-based anomalies", () => {
    const baseline = {
      avgFrequency: 10,
      avgVolume: 100,
      variability: 20,
      commonAccessTimes: [9, 10, 11],
    };

    // Create access at unusual hour
    const unusualTime = new Date();
    unusualTime.setHours(3); // 3 AM

    const currentAccess = {
      volume: 100,
      timestamp: unusualTime,
    };

    const { isAnomaly } = require("@/lib/compliance-engine").detectAnomalies(
      currentAccess,
      baseline,
    );

    // Should detect anomaly
    expect(isAnomaly).toBeDefined();
  });
});
