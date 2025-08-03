const crypto = require("crypto");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const { sequelize } = require("../../infrastructure/db/connection");

class UserIdentityService {
  constructor() {
    this.parser = new UAParser();
  }

  /**
   * Generate device fingerprint
   * @param {Object} req - Express request object
   * @returns {Object} Device fingerprint
   */
  generateDeviceFingerprint(req) {
    try {
      const userAgent = req.headers["user-agent"] || "";
      const ip = this.getClientIP(req);

      // Parse user agent
      const ua = this.parser.setUA(userAgent).getResult();

      // Create fingerprint components
      const fingerprint = {
        // Browser information
        browser: {
          name: ua.browser.name || "Unknown",
          version: ua.browser.version || "Unknown",
          major: ua.browser.major || "Unknown",
        },

        // Operating system
        os: {
          name: ua.os.name || "Unknown",
          version: ua.os.version || "Unknown",
        },

        // Device information
        device: {
          type: ua.device.type || "desktop",
          model: ua.device.model || "Unknown",
          vendor: ua.device.vendor || "Unknown",
        },

        // Screen information
        screen: {
          width: req.headers["sec-ch-viewport-width"] || "Unknown",
          height: req.headers["sec-ch-viewport-height"] || "Unknown",
          colorDepth: req.headers["sec-ch-color-depth"] || "Unknown",
        },

        // Language and locale
        locale: {
          language: req.headers["accept-language"] || "Unknown",
          timezone: req.headers["sec-ch-prefers-color-scheme"] || "Unknown",
        },

        // Network information
        network: {
          connection: req.headers["sec-ch-ua-platform-version"] || "Unknown",
          downlink: req.headers["sec-ch-ua-downlink"] || "Unknown",
          rtt: req.headers["sec-ch-ua-rtt"] || "Unknown",
        },

        // Security headers
        security: {
          dpr: req.headers["sec-ch-ua-dpr"] || "Unknown",
          viewportWidth: req.headers["sec-ch-ua-viewport-width"] || "Unknown",
          viewportHeight: req.headers["sec-ch-ua-viewport-height"] || "Unknown",
        },

        // IP and location
        location: this.getLocationFromIP(ip),

        // Canvas fingerprint (simplified)
        canvas: this.generateCanvasFingerprint(),

        // WebGL fingerprint (simplified)
        webgl: this.generateWebGLFingerprint(),

        // Audio fingerprint (simplified)
        audio: this.generateAudioFingerprint(),

        // Font fingerprint (simplified)
        fonts: this.generateFontFingerprint(),

        // Hardware concurrency
        hardware: {
          cores: req.headers["sec-ch-ua-platform"] || "Unknown",
          memory: req.headers["sec-ch-ua-mobile"] || "Unknown",
        },

        // Timestamp
        timestamp: new Date().toISOString(),
      };

      // Generate hash of the fingerprint
      const fingerprintString = JSON.stringify(fingerprint);
      const hash = crypto
        .createHash("sha256")
        .update(fingerprintString)
        .digest("hex");

      return {
        fingerprint,
        hash,
        confidence: this.calculateConfidence(fingerprint),
      };
    } catch (error) {
      console.error("Error generating device fingerprint:", error);
      return {
        fingerprint: { error: "Failed to generate fingerprint" },
        hash: crypto.randomBytes(32).toString("hex"),
        confidence: 0,
      };
    }
  }

  /**
   * Get client IP address
   * @param {Object} req - Express request object
   * @returns {string} IP address
   */
  getClientIP(req) {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.headers["x-client-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      "Unknown"
    );
  }

  /**
   * Get location information from IP
   * @param {string} ip - IP address
   * @returns {Object} Location information
   */
  getLocationFromIP(ip) {
    try {
      if (ip === "Unknown" || ip === "127.0.0.1" || ip === "::1") {
        return {
          country: "Unknown",
          region: "Unknown",
          city: "Unknown",
          timezone: "Unknown",
          ll: [0, 0],
        };
      }

      const geo = geoip.lookup(ip);
      if (!geo) {
        return {
          country: "Unknown",
          region: "Unknown",
          city: "Unknown",
          timezone: "Unknown",
          ll: [0, 0],
        };
      }

      return {
        country: geo.country || "Unknown",
        region: geo.region || "Unknown",
        city: geo.city || "Unknown",
        timezone: geo.timezone || "Unknown",
        ll: geo.ll || [0, 0],
        ip: ip,
      };
    } catch (error) {
      console.error("Error getting location from IP:", error);
      return {
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        timezone: "Unknown",
        ll: [0, 0],
        ip: ip,
      };
    }
  }

  /**
   * Generate canvas fingerprint
   * @returns {Object} Canvas fingerprint
   */
  generateCanvasFingerprint() {
    // This would normally be generated on the client side
    // For now, we'll create a simplified version
    return {
      width: Math.floor(Math.random() * 1000) + 100,
      height: Math.floor(Math.random() * 1000) + 100,
      dataURL: crypto.randomBytes(16).toString("hex"),
    };
  }

  /**
   * Generate WebGL fingerprint
   * @returns {Object} WebGL fingerprint
   */
  generateWebGLFingerprint() {
    // This would normally be generated on the client side
    return {
      vendor: "Unknown",
      renderer: "Unknown",
      extensions: [],
    };
  }

  /**
   * Generate audio fingerprint
   * @returns {Object} Audio fingerprint
   */
  generateAudioFingerprint() {
    // This would normally be generated on the client side
    return {
      sampleRate: 44100,
      channelCount: 2,
      hash: crypto.randomBytes(8).toString("hex"),
    };
  }

  /**
   * Generate font fingerprint
   * @returns {Object} Font fingerprint
   */
  generateFontFingerprint() {
    // This would normally be generated on the client side
    const commonFonts = [
      "Arial",
      "Helvetica",
      "Times New Roman",
      "Georgia",
      "Verdana",
      "Courier New",
      "Impact",
      "Comic Sans MS",
      "Tahoma",
      "Trebuchet MS",
    ];

    return {
      available: commonFonts.slice(0, Math.floor(Math.random() * 5) + 3),
      hash: crypto.randomBytes(8).toString("hex"),
    };
  }

  /**
   * Calculate confidence score for the fingerprint
   * @param {Object} fingerprint - Device fingerprint
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(fingerprint) {
    let score = 0;
    let total = 0;

    // Browser information (20 points)
    if (fingerprint.browser.name !== "Unknown") {
      score += 10;
      total += 10;
    }
    if (fingerprint.browser.version !== "Unknown") {
      score += 10;
      total += 10;
    }

    // OS information (20 points)
    if (fingerprint.os.name !== "Unknown") {
      score += 10;
      total += 10;
    }
    if (fingerprint.os.version !== "Unknown") {
      score += 10;
      total += 10;
    }

    // Device information (15 points)
    if (fingerprint.device.type !== "Unknown") {
      score += 15;
      total += 15;
    }

    // Location information (25 points)
    if (fingerprint.location.country !== "Unknown") {
      score += 15;
      total += 15;
    }
    if (fingerprint.location.city !== "Unknown") {
      score += 10;
      total += 10;
    }

    // Screen information (10 points)
    if (fingerprint.screen.width !== "Unknown") {
      score += 5;
      total += 5;
    }
    if (fingerprint.screen.height !== "Unknown") {
      score += 5;
      total += 5;
    }

    // Language (10 points)
    if (fingerprint.locale.language !== "Unknown") {
      score += 10;
      total += 10;
    }

    return total > 0 ? Math.round((score / total) * 100) : 0;
  }

  /**
   * Compare two device fingerprints
   * @param {Object} fingerprint1 - First fingerprint
   * @param {Object} fingerprint2 - Second fingerprint
   * @returns {Object} Comparison result
   */
  compareFingerprints(fingerprint1, fingerprint2) {
    const comparison = {
      score: 0,
      matches: [],
      differences: [],
      risk: "low",
    };

    const fields = [
      { path: "browser.name", weight: 15 },
      { path: "browser.version", weight: 10 },
      { path: "os.name", weight: 15 },
      { path: "os.version", weight: 10 },
      { path: "device.type", weight: 10 },
      { path: "location.country", weight: 20 },
      { path: "location.city", weight: 15 },
      { path: "screen.width", weight: 5 },
    ];

    fields.forEach(({ path, weight }) => {
      const value1 = this.getNestedValue(fingerprint1, path);
      const value2 = this.getNestedValue(fingerprint2, path);

      if (value1 === value2 && value1 !== "Unknown") {
        comparison.score += weight;
        comparison.matches.push({ field: path, value: value1 });
      } else if (value1 !== value2) {
        comparison.differences.push({
          field: path,
          value1,
          value2,
        });
      }
    });

    // Determine risk level
    if (comparison.score >= 80) {
      comparison.risk = "low";
    } else if (comparison.score >= 60) {
      comparison.risk = "medium";
    } else {
      comparison.risk = "high";
    }

    return comparison;
  }

  /**
   * Get nested object value
   * @param {Object} obj - Object to search
   * @param {string} path - Path to value
   * @returns {*} Value at path
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : "Unknown";
    }, obj);
  }

  /**
   * Detect suspicious activity
   * @param {Object} currentFingerprint - Current device fingerprint
   * @param {Array} previousFingerprints - Previous fingerprints for the user
   * @returns {Object} Suspicious activity detection result
   */
  detectSuspiciousActivity(currentFingerprint, previousFingerprints) {
    const detection = {
      isSuspicious: false,
      reasons: [],
      riskScore: 0,
      recommendations: [],
    };

    if (!previousFingerprints || previousFingerprints.length === 0) {
      return detection;
    }

    // Check for location changes
    const recentLocations = previousFingerprints
      .slice(-5)
      .map((fp) => fp.fingerprint.location);

    const currentLocation = currentFingerprint.location;

    const locationChanges = recentLocations.filter(
      (loc) =>
        loc.country !== currentLocation.country ||
        loc.city !== currentLocation.city
    );

    if (locationChanges.length > 0) {
      detection.isSuspicious = true;
      detection.reasons.push("Location change detected");
      detection.riskScore += 30;
      detection.recommendations.push("Verify user identity");
    }

    // Check for device type changes
    const deviceTypes = [
      ...new Set(previousFingerprints.map((fp) => fp.fingerprint.device.type)),
    ];

    if (deviceTypes.length > 1) {
      detection.reasons.push("Multiple device types detected");
      detection.riskScore += 20;
    }

    // Check for browser changes
    const browsers = [
      ...new Set(previousFingerprints.map((fp) => fp.fingerprint.browser.name)),
    ];

    if (browsers.length > 2) {
      detection.reasons.push("Multiple browsers detected");
      detection.riskScore += 15;
    }

    // Check for rapid location changes
    const recentTimestamps = previousFingerprints
      .slice(-3)
      .map((fp) => new Date(fp.fingerprint.timestamp));

    const timeDiff =
      Math.abs(new Date() - recentTimestamps[0]) / (1000 * 60 * 60); // hours

    if (timeDiff < 24 && locationChanges.length > 0) {
      detection.reasons.push("Rapid location change");
      detection.riskScore += 25;
    }

    // Set risk level
    if (detection.riskScore >= 50) {
      detection.isSuspicious = true;
      detection.recommendations.push("Consider additional authentication");
    }

    return detection;
  }

  /**
   * Generate user behavior profile
   * @param {Array} activities - User activities
   * @returns {Object} Behavior profile
   */
  generateBehaviorProfile(activities) {
    const profile = {
      loginPatterns: this.analyzeLoginPatterns(activities),
      deviceUsage: this.analyzeDeviceUsage(activities),
      locationPatterns: this.analyzeLocationPatterns(activities),
      timePatterns: this.analyzeTimePatterns(activities),
      riskScore: 0,
    };

    // Calculate overall risk score
    profile.riskScore = this.calculateBehaviorRiskScore(profile);

    return profile;
  }

  /**
   * Analyze login patterns
   * @param {Array} activities - User activities
   * @returns {Object} Login pattern analysis
   */
  analyzeLoginPatterns(activities) {
    const logins = activities.filter((activity) => activity.type === "login");

    return {
      totalLogins: logins.length,
      averagePerDay:
        logins.length /
        Math.max(
          1,
          this.getDaysBetween(
            logins[0]?.timestamp,
            logins[logins.length - 1]?.timestamp
          )
        ),
      devicesUsed: [
        ...new Set(logins.map((login) => login.deviceFingerprint?.hash)),
      ].length,
      locationsUsed: [...new Set(logins.map((login) => login.location?.city))]
        .length,
    };
  }

  /**
   * Analyze device usage
   * @param {Array} activities - User activities
   * @returns {Object} Device usage analysis
   */
  analyzeDeviceUsage(activities) {
    const devices = activities.map((activity) => activity.deviceFingerprint);

    return {
      uniqueDevices: [...new Set(devices.map((device) => device?.hash))].length,
      mostUsedDevice: this.getMostFrequent(
        devices.map((device) => device?.hash)
      ),
      deviceTypes: [
        ...new Set(devices.map((device) => device?.fingerprint?.device?.type)),
      ],
    };
  }

  /**
   * Analyze location patterns
   * @param {Array} activities - User activities
   * @returns {Object} Location pattern analysis
   */
  analyzeLocationPatterns(activities) {
    const locations = activities.map((activity) => activity.location);

    return {
      uniqueLocations: [...new Set(locations.map((loc) => loc?.city))].length,
      mostFrequentLocation: this.getMostFrequent(
        locations.map((loc) => loc?.city)
      ),
      countries: [...new Set(locations.map((loc) => loc?.country))],
    };
  }

  /**
   * Analyze time patterns
   * @param {Array} activities - User activities
   * @returns {Object} Time pattern analysis
   */
  analyzeTimePatterns(activities) {
    const times = activities.map((activity) => new Date(activity.timestamp));
    const hours = times.map((time) => time.getHours());

    return {
      averageHour: hours.reduce((sum, hour) => sum + hour, 0) / hours.length,
      mostActiveHour: this.getMostFrequent(hours),
      timeRange: {
        earliest: Math.min(...hours),
        latest: Math.max(...hours),
      },
    };
  }

  /**
   * Calculate behavior risk score
   * @param {Object} profile - Behavior profile
   * @returns {number} Risk score
   */
  calculateBehaviorRiskScore(profile) {
    let score = 0;

    // Multiple devices
    if (profile.deviceUsage.uniqueDevices > 3) {
      score += 20;
    }

    // Multiple locations
    if (profile.locationPatterns.uniqueLocations > 2) {
      score += 15;
    }

    // Unusual login times
    const avgHour = profile.timePatterns.averageHour;
    if (avgHour < 6 || avgHour > 22) {
      score += 10;
    }

    // High login frequency
    if (profile.loginPatterns.averagePerDay > 5) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  /**
   * Get most frequent value in array
   * @param {Array} arr - Array of values
   * @returns {*} Most frequent value
   */
  getMostFrequent(arr) {
    const counts = {};
    arr.forEach((item) => {
      if (item) {
        counts[item] = (counts[item] || 0) + 1;
      }
    });

    const keys = Object.keys(counts);
    if (keys.length === 0) {
      return null;
    }

    return keys.reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }

  /**
   * Get days between two dates
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {number} Days between dates
   */
  getDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

module.exports = UserIdentityService;
