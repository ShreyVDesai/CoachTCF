# CoachTCF Deployment Guide

Complete guide for deploying CoachTCF to production using Raindrop Platform and Vultr.

---

## Overview

- **Backend**: Deployed on Raindrop Platform
- **Frontend**: Deployed on Vultr Cloud Compute
- **Database**: Raindrop SmartSQL (already configured)
- **Storage**: Raindrop SmartBuckets (already configured)

---

## Part 1: Backend Deployment (Raindrop Platform)

### Step 1: Prepare Your Backend

1. **Ensure all code is committed:**
   ```bash
   cd backend
   git status
   git add .
   git commit -m "Prepare for deployment"
   ```

2. **Test locally first:**
   ```bash
   npm run dev
   # Test all API endpoints
   ```

3. **Update package.json scripts:**
   ```json
   {
     "scripts": {
       "start": "node src/index.js",
       "dev": "node --watch src/index.js"
     }
   }
   ```

### Step 2: Deploy to Raindrop

**Option A: Using Raindrop Dashboard**

1. Log into Raindrop dashboard
2. Go to your CoachTCF project
3. Navigate to **"Deploy"** tab
4. Click **"Deploy Backend"**
5. Select deployment method:
   - **GitHub Integration**: Connect your repo
   - **Direct Upload**: Upload `backend/` folder
6. Set entry point: `src/index.js`
7. Click **"Deploy"**

**Option B: Using Raindrop CLI**

```bash
# Install Raindrop CLI
npm install -g @raindrop/cli

# Login
raindrop login

# Navigate to backend
cd backend

# Deploy
raindrop deploy --project=coachtcf --entry=src/index.js

# View logs
raindrop logs --project=coachtcf
```

### Step 3: Configure Environment Variables

In Raindrop dashboard, set environment variables:

```
RAINDROP_API_KEY=<your_key>
RAINDROP_PROJECT_ID=<your_project_id>
RAINDROP_SQL_CONNECTION_STRING=<your_connection_string>
RAINDROP_BUCKET_NAME=coach-tcf-audio
RAINDROP_BUCKET_ACCESS_KEY=<your_access_key>
RAINDROP_BUCKET_SECRET_KEY=<your_secret_key>
JWT_SECRET=<your_jwt_secret>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-vultr-domain.com
```

### Step 4: Verify Deployment

1. **Check deployment status:**
   - Dashboard shows "Running" status
   - Copy the backend URL (e.g., `https://coachtcf.raindrop.app`)

2. **Test health endpoint:**
   ```bash
   curl https://coachtcf.raindrop.app/health
   ```
   
   Should return:
   ```json
   {
     "success": true,
     "message": "CoachTCF API is running",
     "timestamp": "..."
   }
   ```

3. **Test authentication:**
   ```bash
   curl -X POST https://coachtcf.raindrop.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123","name":"Test"}'
   ```

---

## Part 2: Frontend Deployment (Vultr)

### Step 1: Create Vultr Instance

1. **Log into Vultr dashboard**
2. Click **"Deploy New Server"**
3. Choose configuration:
   - **Server Type**: Cloud Compute
   - **Location**: Choose closest to your target users
   - **Server Image**: Ubuntu 22.04 LTS
   - **Server Size**: $6/month (2GB RAM, 1 vCPU) minimum
   - **Additional Features**: Enable IPv6, Auto Backups (optional)
4. **Add SSH Key** (recommended)
5. Set **Server Hostname**: `coachtcf-frontend`
6. Click **"Deploy Now"**
7. Wait 2-3 minutes for provisioning
8. Copy the **IP address**

### Step 2: Initial Server Setup

1. **SSH into your server:**
   ```bash
   ssh root@your-vultr-ip
   ```

2. **Update system:**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   node --version  # Should show v20.x
   ```

4. **Install Git:**
   ```bash
   apt install -y git
   ```

5. **Install PM2 (process manager):**
   ```bash
   npm install -g pm2
   ```

6. **Install Nginx:**
   ```bash
   apt install -y nginx
   ```

### Step 3: Deploy Frontend Code

1. **Clone repository:**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/coachtcf.git
   cd coachtcf/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   nano .env.local
   ```
   
   Add:
   ```
   NEXT_PUBLIC_API_URL=https://coachtcf.raindrop.app
   ```

4. **Build Next.js:**
   ```bash
   npm run build
   ```

5. **Start with PM2:**
   ```bash
   pm2 start npm --name "coachtcf-frontend" -- start
   pm2 save
   pm2 startup  # Follow the instructions
   ```

6. **Verify it's running:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

### Step 4: Configure Nginx

1. **Create Nginx configuration:**
   ```bash
   nano /etc/nginx/sites-available/coachtcf
   ```

2. **Add configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable site:**
   ```bash
   ln -s /etc/nginx/sites-available/coachtcf /etc/nginx/sites-enabled/
   nginx -t  # Test configuration
   systemctl restart nginx
   ```

4. **Configure firewall:**
   ```bash
   ufw allow 'Nginx Full'
   ufw allow OpenSSH
   ufw enable
   ```

### Step 5: Set Up Domain (Optional)

1. **Point your domain to Vultr IP:**
   - In your domain registrar (e.g., Namecheap, GoDaddy)
   - Create an A record: `@ -> your-vultr-ip`
   - Create an A record: `www -> your-vultr-ip`

2. **Wait for DNS propagation (5-60 minutes)**

3. **Test:**
   ```bash
   ping your-domain.com
   ```

### Step 6: Set Up SSL (HTTPS)

1. **Install Certbot:**
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate:**
   ```bash
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Follow prompts:**
   - Enter email address
   - Agree to terms
   - Choose to redirect HTTP to HTTPS (option 2)

4. **Test auto-renewal:**
   ```bash
   certbot renew --dry-run
   ```

5. **Verify HTTPS:**
   ```bash
   curl https://your-domain.com
   ```

---

## Part 3: Verification

### Backend Verification

```bash
# Health check
curl https://coachtcf.raindrop.app/health

# Test registration
curl -X POST https://coachtcf.raindrop.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"deploy-test@test.com","password":"test123","name":"Deploy Test"}'
```

### Frontend Verification

1. Open browser: `https://your-domain.com`
2. Test user flow:
   - Registration
   - Login
   - Start session
   - Complete all three tasks
   - View results
   - Check dashboard

---

## Part 4: Monitoring & Maintenance

### Backend Monitoring (Raindrop)

- **Dashboard**: Monitor CPU, memory, requests
- **Logs**: View real-time logs in Raindrop console
- **Alerts**: Set up email alerts for errors

### Frontend Monitoring (Vultr)

1. **Check PM2 status:**
   ```bash
   pm2 status
   pm2 logs coachtcf-frontend
   ```

2. **View Nginx logs:**
   ```bash
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

3. **Monitor system resources:**
   ```bash
   htop
   ```

4. **Set up PM2 monitoring (optional):**
   ```bash
   pm2 install pm2-logrotate
   ```

### Update Deployments

**Backend:**
```bash
# In Raindrop dashboard, click "Redeploy"
# OR via CLI:
raindrop deploy --project=coachtcf
```

**Frontend:**
```bash
ssh root@your-vultr-ip
cd /var/www/coachtcf/frontend
git pull origin main
npm install
npm run build
pm2 restart coachtcf-frontend
```

---

## Troubleshooting

### Backend Issues

**Problem**: API returns 500 errors

**Solution**:
1. Check Raindrop logs
2. Verify environment variables
3. Test database connection
4. Check SmartInference API key

**Problem**: Database connection fails

**Solution**:
1. Verify connection string in env vars
2. Check SmartSQL status in dashboard
3. Test connection from Raindrop console

### Frontend Issues

**Problem**: "Cannot connect to API"

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify backend is running
3. Check CORS settings in backend
4. Verify nginx proxy configuration

**Problem**: PM2 process crashes

**Solution**:
```bash
pm2 logs coachtcf-frontend
pm2 restart coachtcf-frontend
```

**Problem**: Nginx 502 Bad Gateway

**Solution**:
```bash
# Check if Next.js is running
pm2 status

# Restart if needed
pm2 restart coachtcf-frontend

# Check Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## Cost Estimation

**Raindrop Platform:**
- SmartSQL Small: ~$0.10/hour = ~$72/month
- SmartBuckets: ~$0.02/GB
- SmartInference: ~$0.01/1K tokens

**Vultr:**
- Cloud Compute (2GB): $6/month
- Bandwidth: Free (1TB included)

**Total**: ~$80-100/month for production

---

## Security Checklist

- ✅ HTTPS enabled (SSL certificate)
- ✅ Firewall configured (UFW)
- ✅ JWT secret is strong and unique
- ✅ Environment variables not in code
- ✅ Database connection uses SSL
- ✅ CORS properly configured
- ✅ PM2 runs as non-root (recommended)
- ✅ Regular security updates

---

## Support

For deployment issues:
- Raindrop: Check documentation or support
- Vultr: Open support ticket
- Hackathon: Discord #ai-champion-ship

---

**Congratulations! 🎉 CoachTCF is now live!**

