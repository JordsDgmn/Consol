# Consol: Bluehost Deployment Guide & Full Instructions

**Status:** Comprehensive guide for migrating Consol Next.js app to Bluehost  
**Created:** 2026-07-07  
**App:** Consol (Next.js 15.3 + Prisma + PostgreSQL)

---

## Table of Contents
1. [Quick Answer: Feasibility & Timeline](#quick-answers)
2. [CRITICAL: Bluehost Limitations](#critical-bluehost-limitations)
3. [Recommended Solutions](#recommended-solutions)
4. [Full Deployment Instructions](#full-deployment-instructions)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)
6. [Troubleshooting & Support](#troubleshooting--support)

---

## Quick Answers

### Question A: How long/quick to go local → useable on other devices?

**Honest Timeline:**

- **If using Bluehost's built-in Node.js support (VPS/Dedicated):** 1-2 hours
- **If using Bluehost's shared hosting:** NOT RECOMMENDED - requires workarounds, 4-8 hours
- **If using Vercel/alternative PaaS:** 15-30 minutes ⭐ RECOMMENDED
- **Full migration with custom domain, SSL, database:** Add 30-60 minutes

**Real estimate for Bluehost:** 2-4 hours for first deployment, including:
- Domain setup (10 min)
- Database migration (20 min)
- Environment configuration (15 min)
- Build & deployment (30-45 min)
- Testing & troubleshooting (30-60 min)

### Question B: Can automation avoid token exhaustion?

**YES, with this strategy:**
- ✅ Create this guide first (for AI handoff)
- ✅ Provide step-by-step scripts
- ✅ Break into phases: preparation → deployment → testing
- ✅ Use batch operations where possible
- ✅ Provide ready-to-run commands

**RECOMMENDED:** Use this guide to continue in a separate chat if tokens run low.

### Question C: Why MD first?

**This guide contains:**
- Complete prompt for any AI to continue work
- All commands needed (ready-to-copy)
- Decision trees for troubleshooting
- No token waste on re-explanation

---

## CRITICAL: Bluehost Limitations

⚠️ **IMPORTANT:** Standard Bluehost shared hosting does NOT support Node.js applications.

| Feature | Shared Hosting | VPS | Dedicated | Vercel |
|---------|---|---|---|---|
| Node.js Support | ❌ NO | ✅ YES | ✅ YES | ✅ YES (Best) |
| Automatic Scaling | ❌ NO | ⚠️ Manual | ⚠️ Manual | ✅ YES |
| Cost | $2.95/mo | $19/mo+ | $40/mo+ | $0 (free tier) |
| PostgreSQL | ❌ NO | ✅ YES | ✅ YES | ✅ Managed |
| SSL Certificate | ✅ Included | ✅ Included | ✅ Included | ✅ Auto |
| Setup Difficulty | Easy | Medium | Medium | Easy |

---

## Recommended Solutions

### Option 1: Vercel (FASTEST - 15 minutes) ⭐⭐⭐

**Pros:**
- Optimized for Next.js
- Free tier available
- Automatic deployments
- Built-in environment management

**Cons:**
- Proprietary platform (vendor lock-in)

**Steps:** 3 steps total

### Option 2: Bluehost VPS/Dedicated (2-4 hours)

**Pros:**
- You already have Bluehost account
- Full control
- PostgreSQL support

**Cons:**
- Requires manual Node.js setup
- More configuration needed

**Steps:** 12 detailed steps (see below)

### Option 3: Docker + Bluehost VPS (3-5 hours)

**Pros:**
- Portable, repeatable setup
- Environment consistency

**Cons:**
- Requires Docker knowledge

---

## Full Deployment Instructions

### Choose Your Path:

---

## PATH A: Vercel Deployment (Recommended - 15 Minutes)

### Prerequisites
- Bluehost account ✅ (you have this)
- GitHub account (free)
- Vercel account (free sign-up)
- Custom domain (optional, can use Bluehost domain)

### Step 1: Prepare Repository
```bash
# In your project root (c:\Users\ASUS LAPTOP\my-app\)
cd c:\Users\ASUS LAPTOP\my-app

# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit - ready for Vercel"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/consol.git
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up (or login) with GitHub
3. Click "New Project"
4. Select your repository "consol"
5. Vercel auto-detects Next.js settings
6. Configure environment variables (see Step 3)
7. Deploy

### Step 3: Environment Variables for Vercel
In Vercel dashboard → Project Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:password@host:5432/consol
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
```

**Get PostgreSQL from:**
- Bluehost cPanel → MySQL Databases (migrate to PostgreSQL)
- OR use Vercel's PostgreSQL Add-on
- OR use Supabase (free PostgreSQL tier)

### Step 4: Connect Custom Domain (Bluehost)
1. In Bluehost: cPanel → Addon Domains
2. Add your domain → Create
3. In Vercel: Project Settings → Domains
4. Add domain → Follow DNS instructions
5. Update Bluehost nameservers (optional) or add CNAME records

### Step 5: Deploy
Vercel auto-deploys when you push to main branch.

---

## PATH B: Bluehost VPS/Dedicated Deployment (2-4 Hours)

### Prerequisites
- ✅ Bluehost VPS or Dedicated account
- SSH access enabled in cPanel
- PostgreSQL database created
- Node.js 20+ available on server

### Pre-Deployment Preparation (YOUR APP)

#### 1. Verify Build
```bash
cd c:\Users\ASUS LAPTOP\my-app

# Test local build
npm run build

# Test production start
npm start
```

If errors occur, fix before deploying. *Don't push broken code to production.*

#### 2. Create `.env.production` (DO NOT COMMIT)
```env
# Database
DATABASE_URL=postgresql://bluehost_user:PASSWORD@localhost:5432/consol_db

# Next.js
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NODE_ENV=production
PORT=3000

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>

# Optional
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3. Update `next.config.mjs`
```javascript
// Verify output is standalone for server deployment
export default {
  output: 'standalone',
  // ... rest of config
};
```

#### 4. Create Deployment Script
Create file: `scripts/deploy-bluehost.sh`

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=== Consol Deployment to Bluehost ==="

# Step 1: Build
echo -e "${GREEN}Building application...${NC}"
npm install
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Step 2: Create tarball
echo -e "${GREEN}Creating deployment package...${NC}"
tar -czf consol-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    .next/ \
    node_modules/ \
    public/ \
    prisma/ \
    .env.production \
    package.json \
    package-lock.json

# Step 3: Upload to server
echo -e "${GREEN}Uploading to Bluehost...${NC}"
scp consol-deploy.tar.gz username@your-server:/home/username/consol/

# Step 4: Deploy on server (via SSH)
ssh username@your-server << 'EOF'
    cd /home/username/consol
    tar -xzf consol-deploy.tar.gz
    npm install --production
    npx prisma migrate deploy
    pm2 restart consol || pm2 start "npm start" --name consol
EOF

echo -e "${GREEN}Deployment complete!${NC}"
```

### On Bluehost Server (SSH)

#### Step 1: SSH Into Server
```bash
ssh username@your-bluehost-server.com
# Or use Bluehost Terminal in cPanel
```

#### Step 2: Create App Directory
```bash
mkdir -p ~/consol
cd ~/consol
```

#### Step 3: Upload Project Files
Using SCP or Git:

**Option A: Via Git (Recommended)**
```bash
git clone https://github.com/YOUR_USERNAME/consol.git .
git checkout main
```

**Option B: Via SCP**
```bash
# From your local machine:
scp -r . username@server:/home/username/consol/
```

#### Step 4: Install Dependencies
```bash
cd ~/consol
node --version  # Should be 20+
npm install --production
```

#### Step 5: Setup Environment
```bash
# Copy and edit environment file
nano .env.production
# Add credentials from Step 2 above
```

#### Step 6: Setup Database
```bash
# If PostgreSQL already created, run migrations
npx prisma migrate deploy

# If first time:
npx prisma db push
npx prisma db seed  # (if you have seeds defined)
```

#### Step 7: Install PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start "npm start" --name consol
pm2 save
pm2 startup
```

#### Step 8: Configure Web Server (Apache/Nginx)

**For Apache (via cPanel):**
1. Go to cPanel → Addon Domains
2. Create domain → Add "consol" folder
3. Create `.htaccess` in public_html:
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**For Nginx (if available):**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 9: SSL Certificate (Free)
```bash
# Bluehost includes AutoSSL
# In cPanel: AutoSSL → Install
# Or use Certbot for Let's Encrypt
sudo certbot certonly --webroot -w /home/username/public_html -d your-domain.com
```

#### Step 10: Setup Automatic Backups
```bash
# Create backup script
cat > ~/backup-consol.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf ~/backups/consol_$DATE.tar.gz ~/consol/.env.production ~/consol/prisma
EOF

chmod +x ~/backup-consol.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add: 0 2 * * * /home/username/backup-consol.sh
```

#### Step 11: Test Application
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs consol

# Test endpoint
curl http://localhost:3000
curl https://your-domain.com/api/health
```

#### Step 12: Setup Monitoring & Alerts
```bash
pm2 install pm2-logrotate
pm2 install pm2-auto-pull  # Auto-deploy on git push

# Setup email alerts
pm2 notify username@email.com
```

---

## Pre-Deployment Checklist

### Local Machine
- [ ] Code review completed
- [ ] All secrets removed from `.git`
- [ ] Build successful: `npm run build`
- [ ] Production start works: `npm start`
- [ ] Database migrations tested locally
- [ ] All environment variables documented
- [ ] `.env.production` created (not committed)
- [ ] GitHub repo initialized and pushed
- [ ] SSL certificate ready

### Database
- [ ] PostgreSQL created on Bluehost
- [ ] Database credentials verified
- [ ] Firewall rules allow app server
- [ ] Backups scheduled
- [ ] Connection string tested

### Server Configuration
- [ ] Node.js 20+ installed
- [ ] PM2 installed globally
- [ ] Ports available (3000, 443, 80)
- [ ] SSH keys configured
- [ ] Web server configured (Apache/Nginx)

### DNS & Domain
- [ ] Domain registered/transferred
- [ ] Nameservers updated (if needed)
- [ ] DNS records added
- [ ] SSL certificates requested

### Post-Deployment
- [ ] Application starts without errors
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] Pages load correctly
- [ ] Static assets load
- [ ] Forms submit successfully
- [ ] Performance acceptable
- [ ] Logs monitored

---

## Decision Tree: Which Path?

```
Are you new to server administration?
├─ YES
│  ├─ Do you want the easiest setup?
│  │  ├─ YES → Use Vercel (Path A)
│  │  └─ NO → Continue
│  └─ Do you want to learn DevOps?
│     ├─ YES → Use Bluehost VPS + Docker (Path C)
│     └─ NO → Use Vercel (Path A)
└─ NO
   ├─ Do you already have VPS/Dedicated hosting?
   │  ├─ YES → Use Bluehost VPS (Path B)
   │  └─ NO → Upgrade to VPS or use Vercel
   └─ Continue with Path B
```

---

## Performance & Scalability

### Expected Performance
- **Response time:** 200-800ms (depending on DB queries)
- **Concurrent users:** 100-500 (on VPS)
- **Database:** PostgreSQL can handle standard loads

### Optimization Tips
1. Enable database indexes
2. Use Prisma caching
3. Implement CDN for static assets (Cloudinary already integrated)
4. Compress API responses
5. Monitor with New Relic or Datadog (free tier)

---

## Troubleshooting & Support

### Common Issues & Solutions

#### "npm: command not found"
```bash
# SSH into server and check Node.js
which node
node --version

# If not installed, use NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### "Port 3000 already in use"
```bash
pm2 delete all
pm2 kill
npm start
# Or change port in .env.production: PORT=3001
```

#### "Database connection refused"
```bash
# Check PostgreSQL is running on Bluehost
psql -h localhost -U username -d consol_db -c "SELECT 1"

# Verify DATABASE_URL in .env.production
echo $DATABASE_URL
```

#### "Static assets not loading (404)"
```bash
# Verify public/ directory copied
ls -la ~/consol/public/

# Check web server proxy config
# Make sure request routes through to Next.js
```

#### "Memory exceeded on shared hosting"
```bash
# Add swap memory
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### "SSL certificate not renewing"
```bash
# Auto-renewal with Let's Encrypt
certbot renew --dry-run
# Add to crontab: 0 3 1 * * /usr/bin/certbot renew
```

---

## Files to Prepare NOW (Before Deployment)

These files should be created on your local machine:

1. **`.env.production`** - Do NOT commit, copy manually
2. **`.env.example`** - Commit to repo (template only)
3. **`scripts/deploy-bluehost.sh`** - For automation
4. **`DEPLOYMENT.md`** - This guide (already created)
5. **`Dockerfile`** (optional) - For Docker deployment

---

## Token/Cost Efficiency

**If continuing this in another AI chat, provide:**
1. This entire BLUEHOST_DEPLOYMENT_GUIDE.md file
2. Your current `.env.example` file
3. Your `package.json`
4. Screenshot of current errors (if any)
5. State which Path you chose (A, B, or C)

**Cost Estimate:**
- **Vercel:** $0-20/month
- **Bluehost VPS:** $19-30/month
- **Bluehost Dedicated:** $40-80/month

---

## Next Steps (After This Guide)

1. ✅ Read this guide completely
2. ⏳ Choose Path A, B, or C
3. ⏳ Run pre-deployment checklist
4. ⏳ Execute appropriate steps
5. ⏳ Test on staging domain first
6. ⏳ Monitor logs for 24 hours
7. ⏳ Setup alerts & backups

---

## Support & Escalation

If you get stuck:
1. Share this guide + specific error message to new AI chat
2. Include: `.env.example`, `error logs`, `server details`
3. Ask: "I'm on step X of Path B and getting [error]"

Good luck! Your app is ready. 🚀

