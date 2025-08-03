const UAParser = require("ua-parser-js");
const crypto = require("crypto");

/**
 * Enhanced Device Fingerprinting Service
 * Supports both web and mobile platforms with comprehensive device detection
 */
class DeviceFingerprintService {
  constructor() {
    this.parser = new UAParser();
  }

  /**
   * Generate comprehensive device fingerprint
   * @param {Object} requestData - Request data containing headers and client info
   * @param {Object} clientFingerprint - Optional client-side fingerprint data
   * @returns {Object} Complete device fingerprint
   */
  generateFingerprint(requestData, clientFingerprint = {}) {
    try {
      const userAgent =
        requestData.userAgent || requestData.headers?.["user-agent"] || "";
      const ipAddress = this.getIPAddress(requestData);

      // Parse user agent for basic device info
      const uaResult = this.parser.setUA(userAgent).getResult();

      // Generate comprehensive fingerprint
      const fingerprint = {
        // Basic device information
        device: {
          type: this.detectDeviceType(userAgent, clientFingerprint),
          brand: uaResult.device.vendor || "Unknown",
          model: uaResult.device.model || "Unknown",
          platform: uaResult.os.name || "Unknown",
          platformVersion: uaResult.os.version || "Unknown",
        },

        // Browser/App information
        browser: {
          name: uaResult.browser.name || "Unknown",
          version: uaResult.browser.version || "Unknown",
          engine: uaResult.engine.name || "Unknown",
          engineVersion: uaResult.engine.version || "Unknown",
        },

        // Network and location
        network: {
          ipAddress: ipAddress,
          isp: this.detectISP(ipAddress),
          country: this.detectCountry(ipAddress),
          timezone: clientFingerprint.timezone || this.detectTimezone(),
        },

        // Screen and display
        display: {
          width: clientFingerprint.screenWidth || null,
          height: clientFingerprint.screenHeight || null,
          pixelRatio: clientFingerprint.pixelRatio || null,
          colorDepth: clientFingerprint.colorDepth || null,
          orientation: clientFingerprint.orientation || "unknown",
        },

        // Hardware capabilities
        hardware: {
          cpuCores: clientFingerprint.cpuCores || null,
          memory: clientFingerprint.memory || null,
          battery: clientFingerprint.battery || null,
          sensors: clientFingerprint.sensors || [],
        },

        // Advanced fingerprinting (if available)
        fingerprint: {
          canvas: clientFingerprint.canvas || null,
          webgl: clientFingerprint.webgl || null,
          audio: clientFingerprint.audio || null,
          fonts: clientFingerprint.fonts || [],
          plugins: clientFingerprint.plugins || [],
        },

        // Mobile-specific information
        mobile: {
          isMobile: this.isMobile(userAgent),
          isTablet: this.isTablet(userAgent),
          isNativeApp: this.isNativeApp(userAgent),
          appVersion: this.extractAppVersion(userAgent),
          deviceId: clientFingerprint.deviceId || null,
          pushToken: clientFingerprint.pushToken || null,
        },

        // Security and privacy
        security: {
          doNotTrack: requestData.headers?.["dnt"] || "0",
          language: requestData.headers?.["accept-language"] || "en",
          encoding: requestData.headers?.["accept-encoding"] || "",
        },

        // Timestamp and metadata
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: userAgent,
          fingerprintHash: this.generateFingerprintHash(
            userAgent,
            clientFingerprint
          ),
        },
      };

      return fingerprint;
    } catch (error) {
      console.error("Error generating device fingerprint:", error);
      return this.getFallbackFingerprint(requestData);
    }
  }

  /**
   * Detect device type based on user agent and client data
   */
  detectDeviceType(userAgent, clientFingerprint) {
    // Check for mobile indicators
    if (this.isMobile(userAgent)) {
      if (this.isTablet(userAgent)) {
        return "tablet";
      }
      return "mobile";
    }

    // Check for desktop indicators
    if (
      userAgent.includes("Windows") ||
      userAgent.includes("Mac") ||
      userAgent.includes("Linux")
    ) {
      return "desktop";
    }

    // Check for smart TV or other devices
    if (userAgent.includes("SmartTV") || userAgent.includes("TV")) {
      return "smart-tv";
    }

    // Check client fingerprint for additional clues
    if (clientFingerprint.screenWidth && clientFingerprint.screenHeight) {
      const ratio =
        clientFingerprint.screenWidth / clientFingerprint.screenHeight;
      if (ratio > 1.5) {
        return "desktop";
      } else if (ratio < 0.8) {
        return "mobile";
      }
    }

    return "unknown";
  }

  /**
   * Check if device is mobile
   */
  isMobile(userAgent) {
    const mobileKeywords = [
      "Mobile",
      "Android",
      "iPhone",
      "iPad",
      "iPod",
      "BlackBerry",
      "Windows Phone",
      "webOS",
      "Opera Mini",
      "IEMobile",
    ];
    return mobileKeywords.some((keyword) => userAgent.includes(keyword));
  }

  /**
   * Check if device is tablet
   */
  isTablet(userAgent) {
    const tabletKeywords = ["iPad", "Android.*Tablet", "Tablet"];
    return tabletKeywords.some((keyword) =>
      new RegExp(keyword, "i").test(userAgent)
    );
  }

  /**
   * Check if request is from native mobile app
   */
  isNativeApp(userAgent) {
    const appKeywords = [
      "MyApp/",
      "CompanyApp/",
      "com.company.app",
      "CFNetwork",
      "Darwin",
      "iOS",
      "Android",
    ];
    return appKeywords.some((keyword) => userAgent.includes(keyword));
  }

  /**
   * Extract app version from user agent
   */
  extractAppVersion(userAgent) {
    const versionMatch = userAgent.match(
      /(?:MyApp|CompanyApp)\/(\d+\.\d+\.\d+)/
    );
    return versionMatch ? versionMatch[1] : null;
  }

  /**
   * Get IP address from request
   */
  getIPAddress(requestData) {
    return (
      requestData.ip ||
      requestData.headers?.["x-forwarded-for"]?.split(",")[0] ||
      requestData.headers?.["x-real-ip"] ||
      requestData.connection?.remoteAddress ||
      "unknown"
    );
  }

  /**
   * Detect ISP based on IP (placeholder - implement with IP geolocation service)
   */
  detectISP(ipAddress) {
    // TODO: Implement with IP geolocation service like MaxMind, IP2Location, etc.
    return "unknown";
  }

  /**
   * Detect country based on IP (placeholder - implement with IP geolocation service)
   */
  detectCountry(ipAddress) {
    // TODO: Implement with IP geolocation service
    return "unknown";
  }

  /**
   * Detect timezone
   */
  detectTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      return "UTC";
    }
  }

  /**
   * Generate fingerprint hash for consistency checking
   */
  generateFingerprintHash(userAgent, clientFingerprint) {
    const fingerprintString = JSON.stringify({
      userAgent,
      screen:
        clientFingerprint.screenWidth + "x" + clientFingerprint.screenHeight,
      timezone: clientFingerprint.timezone,
      language: clientFingerprint.language,
      canvas: clientFingerprint.canvas,
      webgl: clientFingerprint.webgl,
    });

    return crypto.createHash("sha256").update(fingerprintString).digest("hex");
  }

  /**
   * Get fallback fingerprint when detailed detection fails
   */
  getFallbackFingerprint(requestData) {
    const userAgent =
      requestData.userAgent || requestData.headers?.["user-agent"] || "";

    return {
      device: {
        type: this.isMobile(userAgent) ? "mobile" : "desktop",
        brand: "Unknown",
        model: "Unknown",
        platform: "Unknown",
        platformVersion: "Unknown",
      },
      browser: {
        name: "Unknown",
        version: "Unknown",
        engine: "Unknown",
        engineVersion: "Unknown",
      },
      network: {
        ipAddress: this.getIPAddress(requestData),
        isp: "unknown",
        country: "unknown",
        timezone: "UTC",
      },
      display: {
        width: null,
        height: null,
        pixelRatio: null,
        colorDepth: null,
        orientation: "unknown",
      },
      hardware: {
        cpuCores: null,
        memory: null,
        battery: null,
        sensors: [],
      },
      fingerprint: {
        canvas: null,
        webgl: null,
        audio: null,
        fonts: [],
        plugins: [],
      },
      mobile: {
        isMobile: this.isMobile(userAgent),
        isTablet: this.isTablet(userAgent),
        isNativeApp: this.isNativeApp(userAgent),
        appVersion: null,
        deviceId: null,
        pushToken: null,
      },
      security: {
        doNotTrack: requestData.headers?.["dnt"] || "0",
        language: requestData.headers?.["accept-language"] || "en",
        encoding: requestData.headers?.["accept-encoding"] || "",
      },
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: userAgent,
        fingerprintHash: this.generateFingerprintHash(userAgent, {}),
      },
    };
  }

  /**
   * Validate fingerprint consistency
   */
  validateFingerprint(fingerprint1, fingerprint2) {
    const tolerance = 0.8; // 80% similarity threshold
    const similarity = this.calculateSimilarity(fingerprint1, fingerprint2);
    return similarity >= tolerance;
  }

  /**
   * Calculate similarity between two fingerprints
   */
  calculateSimilarity(fp1, fp2) {
    let matches = 0;
    let total = 0;

    // Compare basic device info
    if (fp1.device.type === fp2.device.type) matches++;
    if (fp1.device.platform === fp2.device.platform) matches++;
    if (fp1.browser.name === fp2.browser.name) matches++;
    total += 3;

    // Compare network info
    if (fp1.network.ipAddress === fp2.network.ipAddress) matches++;
    if (fp1.network.timezone === fp2.network.timezone) matches++;
    total += 2;

    // Compare display info if available
    if (fp1.display.width && fp2.display.width) {
      if (Math.abs(fp1.display.width - fp2.display.width) < 50) matches++;
      if (Math.abs(fp1.display.height - fp2.display.height) < 50) matches++;
      total += 2;
    }

    // Compare fingerprint hashes
    if (fp1.metadata.fingerprintHash === fp2.metadata.fingerprintHash)
      matches++;
    total += 1;

    return total > 0 ? matches / total : 0;
  }

  /**
   * Detect suspicious login patterns
   */
  detectSuspiciousLogin(currentFingerprint, previousFingerprints = []) {
    const suspiciousFlags = [];

    // Check for new device
    if (previousFingerprints.length > 0) {
      const lastFingerprint =
        previousFingerprints[previousFingerprints.length - 1];
      if (!this.validateFingerprint(currentFingerprint, lastFingerprint)) {
        suspiciousFlags.push("new_device");
      }
    }

    // Check for location change
    if (previousFingerprints.length > 0) {
      const lastFingerprint =
        previousFingerprints[previousFingerprints.length - 1];
      if (
        currentFingerprint.network.country !== lastFingerprint.network.country
      ) {
        suspiciousFlags.push("location_change");
      }
    }

    // Check for unusual device type
    if (currentFingerprint.device.type === "unknown") {
      suspiciousFlags.push("unknown_device");
    }

    // Check for missing fingerprint data
    if (
      !currentFingerprint.fingerprint.canvas &&
      !currentFingerprint.fingerprint.webgl
    ) {
      suspiciousFlags.push("limited_fingerprint");
    }

    return {
      isSuspicious: suspiciousFlags.length > 0,
      flags: suspiciousFlags,
      riskLevel: this.calculateRiskLevel(suspiciousFlags),
    };
  }

  /**
   * Calculate risk level based on suspicious flags
   */
  calculateRiskLevel(flags) {
    const riskScores = {
      new_device: 2,
      location_change: 3,
      unknown_device: 1,
      limited_fingerprint: 1,
    };

    const totalScore = flags.reduce(
      (score, flag) => score + (riskScores[flag] || 0),
      0
    );

    if (totalScore >= 5) return "high";
    if (totalScore >= 3) return "medium";
    if (totalScore >= 1) return "low";
    return "none";
  }
}

module.exports = DeviceFingerprintService;
