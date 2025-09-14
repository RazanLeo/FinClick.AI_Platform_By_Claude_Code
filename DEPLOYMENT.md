# FinClick.AI - Deployment Guide

## Overview

FinClick.AI is a revolutionary financial analysis platform that provides comprehensive financial analysis with AI-powered insights. This guide covers the complete deployment process for the platform.

## System Requirements

### Production Environment
- **Server**: Ubuntu 20.04+ or CentOS 8+ with minimum 4GB RAM, 2 CPU cores
- **Database**: Supabase PostgreSQL (cloud-hosted)
- **Node.js**: Version 18 or higher
- **Docker**: Version 20.10+ (recommended for containerized deployment)
- **SSL**: Valid SSL certificate for HTTPS
- **Storage**: Minimum 20GB for file uploads and reports

### Dependencies
- PostgreSQL 14+ (via Supabase)
- Redis 7+ (optional, for caching)
- Node.js 18+
- PM2 (for process management)
- Nginx (reverse proxy)

## Pre-Deployment Setup

### 1. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Note down your project URL and API keys:
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: Public API key
   - Service Role Key: Admin API key (keep secure)

### 2. External API Keys

Obtain the following API keys:

- **OpenAI API Key**: For document analysis and AI insights
- **Google Gemini API Key**: Additional AI analysis capabilities
- **Financial Modeling Prep API**: Market data integration
- **Alpha Vantage API**: Stock market data
- **PayTabs Account**: Payment processing (Saudi Arabia)

### 3. Domain and SSL

- Register domain: `finclick.ai`
- Obtain SSL certificate (Let's Encrypt recommended)
- Configure DNS to point to your server

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### Step 1: Clone and Configure
```bash
git clone https://github.com/finclick-ai/platform.git
cd platform
cp .env.example .env
```

#### Step 2: Configure Environment
Edit `.env` file with your actual values:
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# AI Services
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key

# Payment
PAYTABS_PROFILE_ID=your-profile-id
PAYTABS_SERVER_KEY=your-server-key

# Domain
BASE_URL=https://finclick.ai
```

#### Step 3: Build and Deploy
```bash
# Build the production image
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

#### Step 4: Database Setup
```bash
# Run migrations
docker-compose exec finclick-app node scripts/migrate.js up

# Seed initial data
docker-compose exec finclick-app node scripts/migrate.js seed
```

### Method 2: Manual Deployment

#### Step 1: Server Setup
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx

# Install certbot for SSL
sudo apt-get install certbot python3-certbot-nginx
```

#### Step 2: Application Setup
```bash
# Clone repository
git clone https://github.com/finclick-ai/platform.git /var/www/finclick-ai
cd /var/www/finclick-ai

# Install dependencies
npm ci --production

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Create directories
mkdir -p uploads reports charts logs
chmod 755 uploads reports charts logs
```

#### Step 3: Database Migration
```bash
# Run database migrations
node scripts/migrate.js up

# Seed initial data
node scripts/migrate.js seed

# Check status
node scripts/migrate.js status
```

#### Step 4: Process Management
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor processes
pm2 status
pm2 logs
```

#### Step 5: Nginx Configuration
Create `/etc/nginx/sites-available/finclick.ai`:
```nginx
server {
    listen 80;
    server_name finclick.ai www.finclick.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name finclick.ai www.finclick.ai;

    ssl_certificate /etc/letsencrypt/live/finclick.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finclick.ai/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # File uploads
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static file serving
    location /uploads/ {
        alias /var/www/finclick-ai/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /reports/ {
        alias /var/www/finclick-ai/reports/;
        expires 1d;
        add_header Cache-Control "public";
    }
}
```

#### Step 6: SSL Certificate
```bash
# Obtain SSL certificate
sudo certbot --nginx -d finclick.ai -d www.finclick.ai

# Enable site
sudo ln -s /etc/nginx/sites-available/finclick.ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Post-Deployment Configuration

### 1. Admin Account Setup
```bash
# Create admin account
node scripts/setup-admin.js

# Or via database
psql -h your-db-host -d your-db -c "
INSERT INTO users (email, password, first_name, last_name, role, is_verified)
VALUES ('Razan@FinClick.AI', 'hashed-password', 'Razan', 'Ahmed', 'admin', true);
"
```

### 2. System Configuration
Access admin panel at `https://finclick.ai/admin` to configure:
- Payment methods and pricing
- Analysis types and categories
- Email templates
- System settings

### 3. Testing
```bash
# Run test suite
npm test

# Test specific components
npm run test:analysis
npm run test:payment

# Check API endpoints
curl -X GET https://finclick.ai/api/health
curl -X GET https://finclick.ai/api/analysis-types
```

## Monitoring and Maintenance

### Health Checks
- Application: `https://finclick.ai/health`
- Database: Monitor Supabase dashboard
- External APIs: Check `/api/system/status`

### Log Monitoring
```bash
# PM2 logs
pm2 logs

# Application logs
tail -f logs/app.log
tail -f logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring
With Docker deployment, monitoring is included:
- **Prometheus**: http://your-server:9090
- **Grafana**: http://your-server:3001 (admin/admin)
- **Log Aggregation**: Loki/Promtail setup

### Backup Strategy
```bash
# Database backup (automated daily)
docker-compose exec backup /backup.sh

# Manual backup
pg_dump -h your-supabase-host -d your-db > backup-$(date +%Y%m%d).sql

# File backup
tar -czf files-backup-$(date +%Y%m%d).tar.gz uploads reports
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check Supabase credentials
   - Verify network connectivity
   - Check RLS policies

2. **File Upload Fails**
   - Check directory permissions
   - Verify MAX_FILE_SIZE setting
   - Check disk space

3. **AI Analysis Errors**
   - Verify API keys are valid
   - Check quota limits
   - Review error logs

4. **Payment Processing Issues**
   - Verify PayTabs credentials
   - Check webhook URLs
   - Review transaction logs

### Log Files
- Application: `/var/www/finclick-ai/logs/`
- Nginx: `/var/log/nginx/`
- PM2: `~/.pm2/logs/`

### Support Commands
```bash
# Check system status
node scripts/health-check.js

# Reset user password
node scripts/reset-password.js user@email.com

# Clean up old files
node scripts/cleanup.js

# Database status
node scripts/migrate.js status
```

## Security Considerations

### Environment Variables
- Keep `.env` file secure with proper permissions (600)
- Use strong JWT secrets
- Rotate API keys regularly

### Database Security
- Enable Row Level Security (RLS) in Supabase
- Use service role key only for admin operations
- Regular security updates

### File Security
- Scan uploaded files for malware
- Limit file types and sizes
- Store sensitive files outside web root

### Network Security
- Use HTTPS everywhere
- Implement rate limiting
- Monitor for suspicious activity
- Keep server updated

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple Node.js instances with PM2 cluster mode
- Redis for session sharing

### Database Scaling
- Supabase handles database scaling automatically
- Consider read replicas for heavy read workloads

### File Storage Scaling
- Consider cloud storage (AWS S3, Google Cloud)
- CDN for static file delivery

### Monitoring Scaling
- Implement APM (New Relic, DataDog)
- Set up alerting for critical metrics
- Monitor response times and error rates

## Update and Maintenance

### Application Updates
```bash
# Backup current version
cp -r /var/www/finclick-ai /var/www/finclick-ai-backup

# Pull updates
git pull origin main

# Install new dependencies
npm ci --production

# Run migrations
node scripts/migrate.js up

# Restart application
pm2 restart ecosystem.config.js

# Verify deployment
curl -X GET https://finclick.ai/api/health
```

### Database Maintenance
```bash
# Check for new migrations
node scripts/migrate.js status

# Run pending migrations
node scripts/migrate.js up

# Backup before major updates
pg_dump > backup-pre-update.sql
```

## Support and Contact

For technical support and deployment assistance:
- **Email**: support@finclick.ai
- **Developer**: Razan Ahmed Tawfik (Razan@FinClick.AI)
- **Documentation**: https://docs.finclick.ai
- **GitHub**: https://github.com/finclick-ai/platform

---

**FinClick.AI - Revolutionizing Financial Analysis with AI**