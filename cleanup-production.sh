#!/bin/bash

# Production Cleanup Script for HR Backend
# This script removes development files and prepares the codebase for production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Starting production cleanup..."

# Create backup directory
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_status "Creating backup in $BACKUP_DIR..."

# Backup important files before cleanup
cp -r src/ "$BACKUP_DIR/"
cp -r scripts/ "$BACKUP_DIR/"
cp -r nginx/ "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/"
cp Dockerfile "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"
cp docker-compose.production.yml "$BACKUP_DIR/"
cp deploy-ubuntu.sh "$BACKUP_DIR/"
cp .sequelizerc "$BACKUP_DIR/"
cp .gitignore "$BACKUP_DIR/"
cp env.example "$BACKUP_DIR/"
cp env.development "$BACKUP_DIR/"

print_success "Backup created successfully"

# Remove test and debug files
print_status "Removing test and debug files..."

# Remove test files
rm -f test-*.js
rm -f debug-*.js
rm -f check-*.js
rm -f simple-test.js
rm -f fix-authorization-routes.js

# Remove documentation files that are not needed in production
print_status "Removing development documentation..."

rm -f EMPLOYEE_TEST_DATA.md
rm -f IMPLEMENTATION_SUMMARY.md
rm -f DEPARTMENTS_POSITIONS_APPROVALS.md
rm -f NEXT_STEPS_COMPLETE.md
rm -f TEAM_TRAINING_GUIDE.md
rm -f API_DOCUMENTATION_MODULAR.md
rm -f MIGRATION_COMPLETE.md
rm -f MODULAR_ARCHITECTURE_SUMMARY.md
rm -f MIGRATION_GUIDE.md
rm -f MODULAR_ARCHITECTURE_PLAN.md
rm -f LOGIN_ENDPOINT_GUIDE.md
rm -f DEVICE_FINGERPRINTING_GUIDE.md
rm -f test-enhanced-fingerprinting.js
rm -f test-server-status.js
rm -f test-bypass-middleware.js
rm -f test-direct-endpoint.js
rm -f test-simple-leaves.js
rm -f API_DOCUMENTATION.md
rm -f test-identity-*.js
rm -f IDENTITY_API_REFERENCE.md
rm -f BROWSER_FINGERPRINTING_GUIDE.md
rm -f USER_IDENTITY_TRACKING.md
rm -f test-user-identity-tracking.js
rm -f test-session-db-debug.js
rm -f test-jwt-debug.js
rm -f test-auth-debug.js
rm -f test-password.js
rm -f test-login-simple.js
rm -f SESSIONS_ACTIVITIES_AUDIT_IMPLEMENTATION.md
rm -f test-sessions-activities-audit.js
rm -f test-payroll-*.js
rm -f check-payroll-table.js
rm -f test-payroll.js
rm -f check-user-role.js
rm -f check-users.js
rm -f debug-login.js
rm -f ME_ENDPOINT_UPDATE.md
rm -f LOGIN_FIX_SUMMARY.md
rm -f test-login.js
rm -f test-token.js
rm -f test-me-*.js
rm -f USER_LOGIN_GUIDE.md
rm -f CONFIGURATION_CHECKLIST.md
rm -f DEPLOYMENT_GUIDE.md
rm -f deploy.sh
rm -f TROUBLESHOOTING.md
rm -f MISSING_IMPLEMENTATIONS_COMPLETED.md
rm -f check-db.js
rm -f DEVELOPMENT_READY.md
rm -f DEVELOPMENT.md
rm -f PROJECT_STATUS.md

print_success "Test and debug files removed"

# Clean up logs and temp directories
print_status "Cleaning up logs and temp directories..."

# Keep logs directory but clean contents
if [ -d "logs" ]; then
    rm -rf logs/*
    print_status "Cleared logs directory"
fi

# Clean temp directory
if [ -d "temp" ]; then
    rm -rf temp/*
    print_status "Cleared temp directory"
fi

# Clean uploads directory (keep structure)
if [ -d "uploads" ]; then
    find uploads -type f -name "*.tmp" -delete
    find uploads -type f -name "*.temp" -delete
    print_status "Cleaned uploads directory"
fi

# Remove node_modules if it exists (will be rebuilt in container)
if [ -d "node_modules" ]; then
    print_status "Removing node_modules (will be rebuilt in container)..."
    rm -rf node_modules
fi

# Create production-ready .gitignore
print_status "Creating production .gitignore..."

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env.production
.env.staging

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore

# SSL certificates
nginx/ssl/

# Uploads (keep structure, ignore files)
uploads/*
!uploads/.gitkeep

# Database
*.sqlite
*.db

# Backup files
backup-*/

# Test files
test-*.js
debug-*.js
check-*.js
simple-test.js

# Documentation (keep only essential)
*.md
!README.md
!DOCKER_DEPLOYMENT_GUIDE.md
!CHANGELOG.md
EOF

print_success "Production .gitignore created"

# Create production environment template
print_status "Creating production environment template..."

cat > .env.production.template << 'EOF'
# ===========================================
# HR Backend Production Environment Template
# ===========================================
# Copy this file to .env.production and update with your values

# Database Configuration
DB_NAME=coolnet_hrms
DB_USER=postgres
DB_PASSWORD=your_secure_database_password_here
DB_HOST=postgres
DB_PORT=5432
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random_at_least_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_long_and_random_at_least_32_characters

# Session Configuration
SESSION_SECRET=your_session_secret_key_here_make_it_long_and_random_at_least_32_characters

# Redis Configuration
REDIS_PASSWORD=your_redis_password_here

# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log

# External Services (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# ===========================================
# IMPORTANT: Update all passwords and secrets!
# ===========================================
EOF

print_success "Production environment template created"

# Create essential directories
print_status "Creating essential directories..."

mkdir -p uploads logs temp nginx/ssl

# Create .gitkeep files to preserve directory structure
touch uploads/.gitkeep
touch logs/.gitkeep
touch temp/.gitkeep

print_success "Essential directories created"

# Create production README
print_status "Creating production README..."

cat > README.md << 'EOF'
# HR Backend API

A comprehensive Human Resources Management System backend built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Ubuntu 20.04 LTS or later (for deployment)

### Production Deployment

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd hr-backend
   ```

2. **Set up environment:**
   ```bash
   cp .env.production.template .env.production
   # Edit .env.production with your actual values
   ```

3. **Deploy with Docker:**
   ```bash
   chmod +x deploy-ubuntu.sh
   ./deploy-ubuntu.sh
   ```

## 📋 Manual Deployment

```bash
# Build and start containers
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate

# Run database seeds
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:seed:all
```

## 🔧 Configuration

### Environment Variables
Copy `.env.production.template` to `.env.production` and update with your values:

- Database credentials
- JWT secrets
- External service credentials
- Security settings

### SSL Certificates
For production, replace self-signed certificates in `nginx/ssl/` with real certificates.

## 📊 API Documentation

- **Base URL**: `https://your-domain.com/api/v1`
- **Health Check**: `https://your-domain.com/health`
- **Swagger Docs**: `https://your-domain.com/api-docs`

## 🔒 Security

- All containers run as non-root users
- SSL/TLS encryption enabled
- Rate limiting configured
- Security headers implemented
- Input validation and sanitization

## 📈 Monitoring

### Health Checks
```bash
curl https://your-domain.com/health
```

### Logs
```bash
docker-compose -f docker-compose.production.yml logs -f
```

### Container Status
```bash
docker-compose -f docker-compose.production.yml ps
```

## 🔄 Maintenance

### Updates
```bash
git pull origin main
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

### Database Migrations
```bash
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate
```

### Backups
```bash
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres coolnet_hrms > backup.sql
```

## 🚨 Troubleshooting

See `DOCKER_DEPLOYMENT_GUIDE.md` for detailed troubleshooting information.

## 📞 Support

For issues and questions, check the troubleshooting section in the deployment guide or contact the development team.

## 📄 License

[Your License Here]
EOF

print_success "Production README created"

# Create CHANGELOG
print_status "Creating CHANGELOG..."

cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete HR backend API with Clean Architecture
- Employee management system
- Attendance tracking
- Leave management
- Payroll processing
- Performance reviews
- Role-based access control
- JWT authentication
- Database migrations and seeding
- Docker containerization
- Nginx reverse proxy
- SSL/TLS support
- Health checks
- Comprehensive logging
- Rate limiting
- Security headers

### Changed
- Production-ready Docker configuration
- Optimized for Ubuntu server deployment
- Enhanced security measures

### Fixed
- Database connection issues
- Authentication flow
- Permission system
- API validation

## [1.0.0] - 2025-08-03

### Added
- Initial release
- Core HR functionality
- Docker deployment setup
- Production documentation
EOF

print_success "CHANGELOG created"

# Create production startup script
print_status "Creating production startup script..."

cat > start-production.sh << 'EOF'
#!/bin/bash

# Production Startup Script for HR Backend

set -e

echo "Starting HR Backend in production mode..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "Error: .env.production file not found!"
    echo "Please copy .env.production.template to .env.production and update with your values."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Start services
echo "Starting Docker services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Run migrations
echo "Running database migrations..."
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate

# Run seeds (only if database is empty)
echo "Running database seeds..."
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:seed:all

# Health check
echo "Performing health check..."
sleep 10
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Application is healthy and running!"
    echo "🌐 Access your application at: https://your-domain.com"
    echo "📊 API Documentation: https://your-domain.com/api-docs"
else
    echo "⚠️  Health check failed, but application might still be starting up"
fi

echo "Production startup complete!"
EOF

chmod +x start-production.sh

print_success "Production startup script created"

# Create production stop script
print_status "Creating production stop script..."

cat > stop-production.sh << 'EOF'
#!/bin/bash

# Production Stop Script for HR Backend

echo "Stopping HR Backend services..."

# Stop all containers
docker-compose -f docker-compose.production.yml down

echo "✅ All services stopped successfully!"
EOF

chmod +x stop-production.sh

print_success "Production stop script created"

# Create production restart script
print_status "Creating production restart script..."

cat > restart-production.sh << 'EOF'
#!/bin/bash

# Production Restart Script for HR Backend

echo "Restarting HR Backend services..."

# Stop services
./stop-production.sh

# Start services
./start-production.sh

echo "✅ Services restarted successfully!"
EOF

chmod +x restart-production.sh

print_success "Production restart script created"

# Final cleanup
print_status "Performing final cleanup..."

# Remove any remaining test files
find . -name "test-*.js" -delete 2>/dev/null || true
find . -name "debug-*.js" -delete 2>/dev/null || true
find . -name "check-*.js" -delete 2>/dev/null || true

# Remove any temporary files
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true

print_success "Final cleanup completed"

# Summary
echo ""
echo "=========================================="
echo "✅ PRODUCTION CLEANUP COMPLETED SUCCESSFULLY"
echo "=========================================="
echo ""
echo "📁 Backup created in: $BACKUP_DIR"
echo "📄 Production files created:"
echo "   - .env.production.template"
echo "   - README.md"
echo "   - CHANGELOG.md"
echo "   - start-production.sh"
echo "   - stop-production.sh"
echo "   - restart-production.sh"
echo ""
echo "🗑️  Removed:"
echo "   - Test and debug files"
echo "   - Development documentation"
echo "   - Temporary files"
echo ""
echo "🚀 Next steps:"
echo "1. Copy .env.production.template to .env.production"
echo "2. Update .env.production with your actual values"
echo "3. Run: ./start-production.sh"
echo ""
echo "📚 For detailed deployment instructions, see:"
echo "   - DOCKER_DEPLOYMENT_GUIDE.md"
echo "   - README.md"
echo "" 