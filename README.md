# HR Backend API

A comprehensive Human Resources Management System backend built with Node.js, Express, and PostgreSQL.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Ubuntu 20.04 LTS or later (for deployment)

### Production Deployment

1. **Clone the repository:**
   `ash
   git clone <your-repo-url>
   cd hr-backend
   `

2. **Set up environment:**
   `ash
   cp .env.production.template .env.production
   # Edit .env.production with your actual values
   `

3. **Deploy with Docker:**
   `ash
   chmod +x deploy-ubuntu.sh
   ./deploy-ubuntu.sh
   `

## Manual Deployment

`ash
# Build and start containers
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate

# Run database seeds
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:seed:all
`

## Configuration

### Environment Variables
Copy .env.production.template to .env.production and update with your values:

- Database credentials
- JWT secrets
- External service credentials
- Security settings

### SSL Certificates
For production, replace self-signed certificates in 
ginx/ssl/ with real certificates.

## API Documentation

- **Base URL**: https://your-domain.com/api/v1
- **Health Check**: https://your-domain.com/health
- **Swagger Docs**: https://your-domain.com/api-docs

## Security

- All containers run as non-root users
- SSL/TLS encryption enabled
- Rate limiting configured
- Security headers implemented
- Input validation and sanitization

## Monitoring

### Health Checks
`ash
curl https://your-domain.com/health
`

### Logs
`ash
docker-compose -f docker-compose.production.yml logs -f
`

### Container Status
`ash
docker-compose -f docker-compose.production.yml ps
`

## Maintenance

### Updates
`ash
git pull origin main
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
`

### Database Migrations
`ash
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate
`

### Backups
`ash
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres coolnet_hrms > backup.sql
`

## Troubleshooting

See DOCKER_DEPLOYMENT_GUIDE.md for detailed troubleshooting information.

## Support

For issues and questions, check the troubleshooting section in the deployment guide or contact the development team.

## License

[Your License Here]
