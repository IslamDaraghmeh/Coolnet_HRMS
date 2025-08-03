# Production Cleanup Script for HR Backend (PowerShell)
# This script removes development files and prepares the codebase for production

Write-Host "Starting production cleanup..." -ForegroundColor Blue

# Create backup directory
$backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "Creating backup in $backupDir..." -ForegroundColor Blue

# Backup important files before cleanup
Copy-Item -Path "src" -Destination "$backupDir\" -Recurse -Force
Copy-Item -Path "scripts" -Destination "$backupDir\" -Recurse -Force
Copy-Item -Path "nginx" -Destination "$backupDir\" -Recurse -Force
Copy-Item -Path "package.json" -Destination "$backupDir\" -Force
Copy-Item -Path "package-lock.json" -Destination "$backupDir\" -Force
Copy-Item -Path "Dockerfile" -Destination "$backupDir\" -Force
Copy-Item -Path "docker-compose.yml" -Destination "$backupDir\" -Force
Copy-Item -Path "docker-compose.production.yml" -Destination "$backupDir\" -Force
Copy-Item -Path "deploy-ubuntu.sh" -Destination "$backupDir\" -Force
Copy-Item -Path ".sequelizerc" -Destination "$backupDir\" -Force
Copy-Item -Path ".gitignore" -Destination "$backupDir\" -Force
Copy-Item -Path "env.example" -Destination "$backupDir\" -Force
Copy-Item -Path "env.development" -Destination "$backupDir\" -Force

Write-Host "Backup created successfully" -ForegroundColor Green

# Remove test and debug files
Write-Host "Removing test and debug files..." -ForegroundColor Blue

# Remove test files
Get-ChildItem -Path "." -Filter "test-*.js" | Remove-Item -Force
Get-ChildItem -Path "." -Filter "debug-*.js" | Remove-Item -Force
Get-ChildItem -Path "." -Filter "check-*.js" | Remove-Item -Force
Get-ChildItem -Path "." -Filter "simple-test.js" | Remove-Item -Force
Get-ChildItem -Path "." -Filter "fix-authorization-routes.js" | Remove-Item -Force

# Remove documentation files that are not needed in production
Write-Host "Removing development documentation..." -ForegroundColor Blue

$docsToRemove = @(
    "EMPLOYEE_TEST_DATA.md",
    "IMPLEMENTATION_SUMMARY.md",
    "DEPARTMENTS_POSITIONS_APPROVALS.md",
    "NEXT_STEPS_COMPLETE.md",
    "TEAM_TRAINING_GUIDE.md",
    "API_DOCUMENTATION_MODULAR.md",
    "MIGRATION_COMPLETE.md",
    "MODULAR_ARCHITECTURE_SUMMARY.md",
    "MIGRATION_GUIDE.md",
    "MODULAR_ARCHITECTURE_PLAN.md",
    "LOGIN_ENDPOINT_GUIDE.md",
    "DEVICE_FINGERPRINTING_GUIDE.md",
    "test-enhanced-fingerprinting.js",
    "test-server-status.js",
    "test-bypass-middleware.js",
    "test-direct-endpoint.js",
    "test-simple-leaves.js",
    "API_DOCUMENTATION.md",
    "IDENTITY_API_REFERENCE.md",
    "BROWSER_FINGERPRINTING_GUIDE.md",
    "USER_IDENTITY_TRACKING.md",
    "test-user-identity-tracking.js",
    "test-session-db-debug.js",
    "test-jwt-debug.js",
    "test-auth-debug.js",
    "test-password.js",
    "test-login-simple.js",
    "SESSIONS_ACTIVITIES_AUDIT_IMPLEMENTATION.md",
    "test-sessions-activities-audit.js",
    "test-payroll-*.js",
    "check-payroll-table.js",
    "test-payroll.js",
    "check-user-role.js",
    "check-users.js",
    "debug-login.js",
    "ME_ENDPOINT_UPDATE.md",
    "LOGIN_FIX_SUMMARY.md",
    "test-login.js",
    "test-token.js",
    "test-me-*.js",
    "USER_LOGIN_GUIDE.md",
    "CONFIGURATION_CHECKLIST.md",
    "DEPLOYMENT_GUIDE.md",
    "deploy.sh",
    "TROUBLESHOOTING.md",
    "MISSING_IMPLEMENTATIONS_COMPLETED.md",
    "check-db.js",
    "DEVELOPMENT_READY.md",
    "DEVELOPMENT.md",
    "PROJECT_STATUS.md"
)

foreach ($file in $docsToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Yellow
    }
}

Write-Host "Test and debug files removed" -ForegroundColor Green

# Clean up logs and temp directories
Write-Host "Cleaning up logs and temp directories..." -ForegroundColor Blue

# Keep logs directory but clean contents
if (Test-Path "logs") {
    Get-ChildItem -Path "logs" -Recurse | Remove-Item -Force
    Write-Host "Cleared logs directory" -ForegroundColor Yellow
}

# Clean temp directory
if (Test-Path "temp") {
    Get-ChildItem -Path "temp" -Recurse | Remove-Item -Force
    Write-Host "Cleared temp directory" -ForegroundColor Yellow
}

# Clean uploads directory (keep structure)
if (Test-Path "uploads") {
    Get-ChildItem -Path "uploads" -Filter "*.tmp" -Recurse | Remove-Item -Force
    Get-ChildItem -Path "uploads" -Filter "*.temp" -Recurse | Remove-Item -Force
    Write-Host "Cleaned uploads directory" -ForegroundColor Yellow
}

# Remove node_modules if it exists (will be rebuilt in container)
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules (will be rebuilt in container)..." -ForegroundColor Blue
    Remove-Item -Path "node_modules" -Recurse -Force
}

# Create production-ready .gitignore
Write-Host "Creating production .gitignore..." -ForegroundColor Blue

$gitignoreContent = @"
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
"@

$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8

Write-Host "Production .gitignore created" -ForegroundColor Green

# Create production environment template
Write-Host "Creating production environment template..." -ForegroundColor Blue

$envTemplateContent = @"
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
"@

$envTemplateContent | Out-File -FilePath ".env.production.template" -Encoding UTF8

Write-Host "Production environment template created" -ForegroundColor Green

# Create essential directories
Write-Host "Creating essential directories..." -ForegroundColor Blue

New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
New-Item -ItemType Directory -Path "logs" -Force | Out-Null
New-Item -ItemType Directory -Path "temp" -Force | Out-Null
New-Item -ItemType Directory -Path "nginx/ssl" -Force | Out-Null

# Create .gitkeep files to preserve directory structure
New-Item -ItemType File -Path "uploads/.gitkeep" -Force | Out-Null
New-Item -ItemType File -Path "logs/.gitkeep" -Force | Out-Null
New-Item -ItemType File -Path "temp/.gitkeep" -Force | Out-Null

Write-Host "Essential directories created" -ForegroundColor Green

# Create production README
Write-Host "Creating production README..." -ForegroundColor Blue

$readmeContent = @"
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
"@

$readmeContent | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host "Production README created" -ForegroundColor Green

# Create CHANGELOG
Write-Host "Creating CHANGELOG..." -ForegroundColor Blue

$changelogContent = @"
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
"@

$changelogContent | Out-File -FilePath "CHANGELOG.md" -Encoding UTF8

Write-Host "CHANGELOG created" -ForegroundColor Green

# Create production startup script
Write-Host "Creating production startup script..." -ForegroundColor Blue

$startScriptContent = @"
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
"@

$startScriptContent | Out-File -FilePath "start-production.sh" -Encoding UTF8

Write-Host "Production startup script created" -ForegroundColor Green

# Create production stop script
Write-Host "Creating production stop script..." -ForegroundColor Blue

$stopScriptContent = @"
#!/bin/bash

# Production Stop Script for HR Backend

echo "Stopping HR Backend services..."

# Stop all containers
docker-compose -f docker-compose.production.yml down

echo "✅ All services stopped successfully!"
"@

$stopScriptContent | Out-File -FilePath "stop-production.sh" -Encoding UTF8

Write-Host "Production stop script created" -ForegroundColor Green

# Create production restart script
Write-Host "Creating production restart script..." -ForegroundColor Blue

$restartScriptContent = @"
#!/bin/bash

# Production Restart Script for HR Backend

echo "Restarting HR Backend services..."

# Stop services
./stop-production.sh

# Start services
./start-production.sh

echo "✅ Services restarted successfully!"
"@

$restartScriptContent | Out-File -FilePath "restart-production.sh" -Encoding UTF8

Write-Host "Production restart script created" -ForegroundColor Green

# Final cleanup
Write-Host "Performing final cleanup..." -ForegroundColor Blue

# Remove any remaining test files
Get-ChildItem -Path "." -Filter "test-*.js" -Recurse | Remove-Item -Force
Get-ChildItem -Path "." -Filter "debug-*.js" -Recurse | Remove-Item -Force
Get-ChildItem -Path "." -Filter "check-*.js" -Recurse | Remove-Item -Force

# Remove any temporary files
Get-ChildItem -Path "." -Filter "*.tmp" -Recurse | Remove-Item -Force
Get-ChildItem -Path "." -Filter "*.temp" -Recurse | Remove-Item -Force

Write-Host "Final cleanup completed" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ PRODUCTION CLEANUP COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Backup created in: $backupDir" -ForegroundColor Cyan
Write-Host "📄 Production files created:" -ForegroundColor Cyan
Write-Host "   - .env.production.template" -ForegroundColor White
Write-Host "   - README.md" -ForegroundColor White
Write-Host "   - CHANGELOG.md" -ForegroundColor White
Write-Host "   - start-production.sh" -ForegroundColor White
Write-Host "   - stop-production.sh" -ForegroundColor White
Write-Host "   - restart-production.sh" -ForegroundColor White
Write-Host ""
Write-Host "🗑️  Removed:" -ForegroundColor Yellow
Write-Host "   - Test and debug files" -ForegroundColor White
Write-Host "   - Development documentation" -ForegroundColor White
Write-Host "   - Temporary files" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "1. Copy .env.production.template to .env.production" -ForegroundColor White
Write-Host "2. Update .env.production with your actual values" -ForegroundColor White
Write-Host "3. Run: ./start-production.sh" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed deployment instructions, see:" -ForegroundColor Cyan
Write-Host "   - DOCKER_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "   - README.md" -ForegroundColor White
Write-Host "" 