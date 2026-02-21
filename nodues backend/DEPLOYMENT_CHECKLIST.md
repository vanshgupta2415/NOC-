# 🚀 Deployment Checklist - No Dues Portal

Use this checklist to ensure a smooth deployment to production.

---

## Pre-Deployment Checklist

### 1. Code Review
- [ ] All features tested locally
- [ ] No console.log statements in production code
- [ ] Error handling implemented everywhere
- [ ] Input validation on all endpoints
- [ ] File upload limits configured
- [ ] Rate limiting configured

### 2. Security Audit
- [ ] All default passwords changed
- [ ] Strong JWT secrets (min 32 characters)
- [ ] Environment variables secured
- [ ] CORS configured for production domain
- [ ] Helmet middleware enabled
- [ ] Rate limiting enabled
- [ ] File upload validation working
- [ ] SQL injection prevention (Handled by Prisma)
- [ ] XSS prevention implemented

### 3. Database Setup
- [ ] Production PostgreSQL database created (Neon, Supabase, or Render)
- [ ] `DATABASE_URL` configured with production credentials
- [ ] Connection string tested
- [ ] Run `npx prisma migrate deploy` on production
- [ ] Run `npx prisma generate` on production build
- [ ] Backup strategy planned

### 4. Email Configuration
- [ ] Production SMTP service chosen (Gmail/SendGrid/Mailgun)
- [ ] SMTP credentials configured
- [ ] Test email sent successfully
- [ ] Email templates reviewed
- [ ] Sender email verified
- [ ] Email rate limits understood

### 5. File Storage
- [ ] Cloud storage service chosen (AWS S3/Cloudinary)
- [ ] Storage bucket created
- [ ] Access credentials configured
- [ ] Upload middleware updated for cloud storage
- [ ] File size limits configured
- [ ] File type restrictions verified

### 6. Environment Configuration
- [ ] Production .env file created
- [ ] NODE_ENV=production set
- [ ] All secrets rotated (different from dev)
- [ ] Frontend URL configured
- [ ] CORS_ORIGIN set to production domain
- [ ] Port configured (usually 5000 or 8080)

---

## Prisma Commands (Run on Production)

After connecting to your production database, ensure you run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations (idempotent, safe for production)
npx prisma migrate deploy

# (Optional) Seed initial system data
node prisma-seed.js
```

---

## Deployment Platforms

### Option 1: Railway (Recommended - Easiest)

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   
   # Add environment variables
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI=<your-atlas-uri>
   railway variables set JWT_SECRET=<your-secret>
   # ... add all other variables
   
   # Deploy
   railway up
   ```

3. **Configure**
   - Set custom domain (optional)
   - Enable auto-deploy from GitHub

---

### Option 2: Render

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Configure:
     - Name: nodues-backend
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from .env

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

---

### Option 3: DigitalOcean App Platform

1. **Create Account**
   - Go to [digitalocean.com](https://www.digitalocean.com)

2. **Create App**
   - Apps → Create App
   - Connect GitHub
   - Select repository
   - Configure build settings

3. **Add Environment Variables**
   - Settings → Environment Variables
   - Add all variables

4. **Deploy**
   - Review and create

---

### Option 4: AWS EC2 (Advanced)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier) or larger
   - Configure security group (ports 22, 80, 443, 5000)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx (optional - for reverse proxy)
   sudo apt install -y nginx
   ```

4. **Clone and Setup**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd nodues-backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # (paste your production environment variables)
   
   # Start with PM2
   pm2 start server.js --name nodues-backend
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Production Environment Variables

Create a production `.env` file with these variables:

```env
# Server
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nodues-portal?retryWrites=true&w=majority

# JWT (CHANGE THESE - Use strong random strings!)
JWT_ACCESS_SECRET=<generate-strong-secret-min-32-chars>
JWT_REFRESH_SECRET=<generate-strong-secret-min-32-chars>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net  # or smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey  # or your email
SMTP_PASSWORD=<your-sendgrid-api-key>  # or app password
EMAIL_FROM=noreply@mitsgwl.ac.in
EMAIL_FROM_NAME=MITS Gwalior - No Dues Portal

# File Upload (Cloud Storage)
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads  # or S3 bucket
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Certificate
CERTIFICATE_DIR=./certificates  # or S3 bucket
COLLEGE_NAME=Madhav Institute of Technology & Science
COLLEGE_ADDRESS=Gwalior, Madhya Pradesh, India
COLLEGE_LOGO_PATH=./assets/college-logo.png

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Generate Strong Secrets

Use these commands to generate strong secrets:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Or use online generator
# https://randomkeygen.com/
```

---

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Server is running
- [ ] Health check endpoint works: `GET /health`
- [ ] Database connection successful
- [ ] No errors in logs

### 2. Create Admin User
```bash
# SSH into server or use Railway/Render console
node scripts/seedAdmin.js
```

### 3. Test Critical Flows
- [ ] Admin login works
- [ ] Create test student user
- [ ] Student can submit application
- [ ] Email notifications received
- [ ] Approval workflow works
- [ ] Certificate generation works
- [ ] Certificate email delivery works

### 4. Monitor
- [ ] Set up logging (Winston already configured)
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Set up uptime monitoring (UptimeRobot/Pingdom)
- [ ] Set up performance monitoring (New Relic/DataDog)

### 5. Backup
- [ ] MongoDB Atlas automatic backups enabled
- [ ] File storage backups configured
- [ ] Database backup schedule set
- [ ] Disaster recovery plan documented

### 6. Documentation
- [ ] API documentation shared with frontend team
- [ ] Admin credentials securely stored
- [ ] Deployment process documented
- [ ] Rollback procedure documented

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### Recommended Tools

1. **Error Monitoring**
   - Sentry (free tier available)
   - Rollbar
   - Bugsnag

2. **Uptime Monitoring**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

3. **Performance Monitoring**
   - New Relic
   - DataDog
   - AppDynamics

4. **Log Management**
   - Papertrail
   - Loggly
   - CloudWatch (AWS)

---

## Scaling Considerations

### When to Scale
- Response time > 500ms
- CPU usage > 70%
- Memory usage > 80%
- Database queries slow

### How to Scale
1. **Vertical Scaling**: Upgrade server resources
2. **Horizontal Scaling**: Add more servers + load balancer
3. **Database Scaling**: MongoDB Atlas auto-scaling
4. **Caching**: Add Redis for session/data caching
5. **CDN**: Use CloudFront/Cloudflare for static assets

---

## Maintenance

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Check disk space
- [ ] Monthly: Review audit logs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Yearly: Rotate secrets

### Update Process
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migrations (if any)
# npm run migrate

# Restart server
pm2 restart nodues-backend

# Or on Railway/Render - auto-deploys on git push
```

---

## Rollback Procedure

If deployment fails:

```bash
# Railway
railway rollback

# Render
# Use dashboard to rollback to previous deployment

# EC2/Manual
git checkout <previous-commit>
npm install
pm2 restart nodues-backend
```

---

## Support Contacts

- **Technical Lead**: [Your Name]
- **DevOps**: [DevOps Team]
- **Database Admin**: [DBA Contact]
- **Emergency**: [Emergency Contact]

---

## Final Checks Before Go-Live

- [ ] All checklist items completed
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Backup and recovery tested
- [ ] Monitoring and alerts configured
- [ ] Documentation complete
- [ ] Team trained on admin panel
- [ ] Support process established
- [ ] Rollback plan tested

---

**Deployment Status:** Ready for Production ✅

**Last Updated:** February 2026
