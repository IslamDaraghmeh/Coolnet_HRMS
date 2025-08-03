# Docker Deployment Guide for HR Backend

This guide provides comprehensive instructions for deploying the HR Backend application on Ubuntu server using Docker.

## 🚀 Quick Start

### Prerequisites

- Ubuntu 20.04 LTS or later
- User with sudo privileges
- Internet connection

### One-Command Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd hr-backend

# Make deployment script executable
chmod +x deploy-ubuntu.sh

# Run the deployment script
./deploy-ubuntu.sh
```

## 📋 Manual Deployment Steps

### 1. System Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git openssl
```

### 2. Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group changes
# Or run: newgrp docker
```

### 3. Configure Environment

Create `.env.production` file:

```bash
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
```

### 4. Deploy Application

```bash
# Build and start containers
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate

# Run database seeds
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:seed:all
```

## 🔧 Configuration Files

### Dockerfile

The `Dockerfile` is optimized for production deployment with:

- Multi-stage build for smaller image size
- Non-root user for security
- Health checks
- Production optimizations

### docker-compose.production.yml

Production-optimized compose file with:

- PostgreSQL database
- Redis cache
- Nginx reverse proxy
- Proper networking
- Volume management
- Health checks

### Nginx Configuration

Located in `nginx/nginx.conf` with:

- SSL/TLS termination
- Rate limiting
- Gzip compression
- Security headers
- Proxy configuration

## 🌐 SSL Certificate Setup

### For Development (Self-signed)

```bash
# Generate self-signed certificate
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### For Production (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*
```

## 🔍 Monitoring and Management

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f hr_backend
```

### Health Check

```bash
# Check application health
curl https://your-domain.com/health

# Check container status
docker-compose -f docker-compose.production.yml ps
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres coolnet_hrms > backup.sql

# Restore backup
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres coolnet_hrms < backup.sql
```

## 🔒 Security Considerations

### Firewall Setup

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Environment Security

- Use strong, unique passwords
- Rotate secrets regularly
- Keep system updated
- Monitor logs for suspicious activity

### Container Security

- Run containers as non-root user
- Use specific image tags
- Regularly update base images
- Scan for vulnerabilities

## 📊 Performance Optimization

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendance_employee_date ON attendance(employeeId, date);
```

### Nginx Optimization

- Enable gzip compression
- Configure caching headers
- Use rate limiting
- Optimize worker processes

### Application Optimization

- Use connection pooling
- Implement caching strategies
- Optimize database queries
- Monitor memory usage

## 🚨 Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs hr_backend

# Check environment variables
docker-compose -f docker-compose.production.yml config
```

#### Database Connection Issues

```bash
# Check database status
docker-compose -f docker-compose.production.yml exec postgres pg_isready -U postgres

# Check database logs
docker-compose -f docker-compose.production.yml logs postgres
```

#### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### Reset Deployment

```bash
# Stop all containers
docker-compose -f docker-compose.production.yml down

# Remove volumes (WARNING: This will delete all data)
docker-compose -f docker-compose.production.yml down -v

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale API service
docker-compose -f docker-compose.production.yml up -d --scale hr_backend=3
```

### Load Balancer Setup

```bash
# Install HAProxy
sudo apt install haproxy

# Configure HAProxy for load balancing
# (Configuration depends on your setup)
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

### Update Dependencies

```bash
# Update npm packages
docker-compose -f docker-compose.production.yml exec hr_backend npm update

# Rebuild container
docker-compose -f docker-compose.production.yml up -d --build hr_backend
```

### Database Migrations

```bash
# Run new migrations
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate

# Rollback migrations
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate:undo
```

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review application logs
3. Check system resources
4. Verify configuration files
5. Contact the development team

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
