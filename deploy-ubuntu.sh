#!/bin/bash

# HR Backend Deployment Script for Ubuntu Server
# This script sets up and deploys the HR backend application on Ubuntu

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Configuration
PROJECT_NAME="hr-backend"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

print_status "Starting HR Backend deployment on Ubuntu server..."

# Step 1: Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System packages updated"

# Step 2: Install Docker and Docker Compose
print_status "Installing Docker and Docker Compose..."

# Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_success "Docker installed"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_status "Docker Compose already installed"
fi

# Step 3: Create production environment file
print_status "Setting up environment configuration..."

if [ ! -f "$ENV_FILE" ]; then
    print_status "Creating production environment file..."
    cat > "$ENV_FILE" << EOF
# Database Configuration
DB_NAME=coolnet_hrms
DB_USER=postgres
DB_PASSWORD=your_secure_database_password_here
DB_HOST=postgres
DB_PORT=5432
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_long_and_random

# Session Configuration
SESSION_SECRET=your_session_secret_key_here_make_it_long_and_random

# Redis Configuration
REDIS_PASSWORD=your_redis_password_here

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
EOF
    print_warning "Please edit $ENV_FILE with your actual configuration values"
    print_warning "Especially update the passwords and secrets!"
else
    print_status "Environment file already exists"
fi

# Step 4: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs temp nginx/ssl
print_success "Directories created"

# Step 5: Set up Nginx configuration
print_status "Setting up Nginx configuration..."

if [ ! -f "nginx/nginx.conf" ]; then
    print_status "Creating Nginx configuration..."
    cat > "nginx/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Upstream for backend
    upstream hr_backend {
        server hr_backend:3000;
    }

    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name _;
        
        # Redirect all HTTP traffic to HTTPS
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://hr_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://hr_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files (uploads)
        location /uploads/ {
            alias /app/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Default location
        location / {
            return 404;
        }
    }
}
EOF
    print_success "Nginx configuration created"
else
    print_status "Nginx configuration already exists"
fi

# Step 6: Generate self-signed SSL certificate (for development)
print_status "Setting up SSL certificates..."
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    print_status "Generating self-signed SSL certificate..."
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    print_success "SSL certificate generated"
    print_warning "For production, replace with real SSL certificates"
else
    print_status "SSL certificates already exist"
fi

# Step 7: Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R $USER:$USER uploads logs temp nginx
chmod -R 755 uploads logs temp
chmod 600 nginx/ssl/*
print_success "Permissions set"

# Step 8: Build and start the application
print_status "Building and starting the application..."

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
fi

# Build and start containers
docker-compose -f "$DOCKER_COMPOSE_FILE" down
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

print_success "Application started"

# Step 9: Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Step 10: Run database migrations
print_status "Running database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec hr_backend npx sequelize-cli db:migrate
print_success "Database migrations completed"

# Step 11: Run database seeds
print_status "Running database seeds..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec hr_backend npx sequelize-cli db:seed:all
print_success "Database seeds completed"

# Step 12: Health check
print_status "Performing health check..."
sleep 10
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Application is healthy and running!"
else
    print_warning "Health check failed, but application might still be starting up"
fi

# Step 13: Display deployment information
print_success "Deployment completed successfully!"
echo ""
echo "=== Deployment Information ==="
echo "Application URL: https://your-domain.com"
echo "API Base URL: https://your-domain.com/api/v1"
echo "Health Check: https://your-domain.com/health"
echo ""
echo "=== Container Status ==="
docker-compose -f "$DOCKER_COMPOSE_FILE" ps
echo ""
echo "=== Logs ==="
echo "To view logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
echo ""
echo "=== Management Commands ==="
echo "Stop: docker-compose -f $DOCKER_COMPOSE_FILE down"
echo "Restart: docker-compose -f $DOCKER_COMPOSE_FILE restart"
echo "Update: ./deploy-ubuntu.sh"
echo ""
print_warning "Remember to:"
print_warning "1. Update the environment file with real credentials"
print_warning "2. Replace self-signed SSL with real certificates"
print_warning "3. Configure your domain in Nginx configuration"
print_warning "4. Set up proper firewall rules"
print_warning "5. Configure backup strategies" 