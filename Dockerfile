# Multi-stage build for production deployment on Ubuntu server
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for better performance
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production --no-audit --no-fund \
  && npm cache clean --force \
  && rm -rf /tmp/*

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001

# Create necessary directories and set permissions
RUN mkdir -p /app/uploads /app/logs /app/temp \
  && chown -R nodejs:nodejs /app \
  && chmod -R 755 /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node scripts/health-check.js || exit 1

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application with proper signal handling
CMD ["node", "src/server.js"]
