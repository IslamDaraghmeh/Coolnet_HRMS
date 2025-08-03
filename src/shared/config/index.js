require("dotenv").config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    apiVersion: process.env.API_VERSION || "v1",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "coolnet_hrms",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "your_password",
    dialect: process.env.DB_DIALECT || "postgres",
    logging: process.env.NODE_ENV === "development",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_key_here",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key_here",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || 604800, // 7 days in seconds
    sessionExpiresIn: process.env.JWT_SESSION_EXPIRES_IN || 3600, // 1 hour in seconds
  },

  // File Upload Configuration
  upload: {
    path: process.env.UPLOAD_PATH || "./uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },

  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    s3Bucket: process.env.AWS_S3_BUCKET || "hr-documents",
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "HR System <noreply@hrsystem.com>",
  },

  // SMS Configuration (Twilio)
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "./logs/app.log",
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || "your_session_secret",
  },
};

// Validate critical configurations
const validateConfig = () => {
  const errors = [];

  // Check for critical missing values
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === "your_jwt_secret_key_here"
  ) {
    errors.push("JWT_SECRET must be set to a secure value");
  }

  if (
    !process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_REFRESH_SECRET === "your_refresh_secret_key_here"
  ) {
    errors.push("JWT_REFRESH_SECRET must be set to a secure value");
  }

  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === "your_password") {
    errors.push("DB_PASSWORD must be set to a secure value");
  }

  if (errors.length > 0) {
    console.error("❌ Configuration errors found:");
    errors.forEach((error) => console.error(`   - ${error}`));
    console.error("Please update your environment variables.");

    if (process.env.NODE_ENV === "production") {
      throw new Error("Critical configuration errors found");
    }
  }
};

// Run validation
validateConfig();

module.exports = config;
