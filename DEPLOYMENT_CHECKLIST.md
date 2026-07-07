# Consol Deployment Checklist

**Project:** Consol Web Application  
**Target:** Bluehost Hosting  
**Date Created:** 2026-07-07

---

## 📋 PRE-DEPLOYMENT SETUP (Do First)

### Local Machine Setup
- [ ] **Clone/Configure Repository**
  - [ ] Repository initialized with Git
  - [ ] All changes committed
  - [ ] No uncommitted secrets or credentials
  - [ ] Latest main branch pulled
  
- [ ] **Environment Files**
  - [ ] `.env.example` created ✅ (Already done)
  - [ ] `.env.production.example` created ✅ (Already done)
  - [ ] Local `.env.local` or `.env` configured
  - [ ] All required variables filled
  
- [ ] **Cloudinary Setup** (File Upload Service)
  - [ ] Cloudinary account created (free tier OK)
  - [ ] API credentials obtained
  - [ ] Environment variables configured
  
### Bluehost Account Setup
- [ ] **Bluehost Account Verified**
  - [ ] Login credentials ready
  - [ ] Access to cPanel confirmed
  
- [ ] **Domain Configuration**
  - [ ] Domain name registered or transferred to Bluehost
  - [ ] Nameservers updated (if using external registrar)
  - [ ] Domain pointing to Bluehost
  
- [ ] **Database Setup** (In cPanel)
  - [ ] PostgreSQL database created
  - [ ] Database username/password generated
  - [ ] Host/Port information noted
  - [ ] Connection verified
  
- [ ] **Hosting Plan**
  - [ ] VPS or Dedicated hosting (NOT shared hosting)
  - [ ] SSH access enabled
  - [ ] Terminal access available in cPanel
  
---

## 🔨 BUILD & TEST (Local)

### Application Build
- [ ] **Local Build Successful**
  - [ ] Run: `npm install`
  - [ ] Run: `npm run build`
  - [ ] No errors reported
  - [ ] `.next/` directory created
  
- [ ] **Local Testing**
  - [ ] Run: `npm run dev`
  - [ ] App loads at `http://localhost:3000`
  - [ ] All pages accessible
  - [ ] Forms submit correctly
  - [ ] No console errors
  
### Database Testing
- [ ] **Prisma Configuration**
  - [ ] `prisma/schema.prisma` uses PostgreSQL
  - [ ] DATABASE_URL environment variable configured
  - [ ] Run: `npx prisma generate`
  
- [ ] **Database Migrations**
  - [ ] Run: `npx prisma migrate dev`
  - [ ] All migrations applied successfully
  - [ ] Schema validated
  
- [ ] **Production Build Test**
  - [ ] Run: `npm run build`
  - [ ] Run: `npm start`
  - [ ] App loads at `http://localhost:3000`
  - [ ] Navigation works
  - [ ] Database queries work
  
---

## 🚀 PREPARE FOR DEPLOYMENT

### Configuration Files
- [ ] **`.env.production` Created**
  - [ ] Copy from `.env.production.example`
  - [ ] Fill in Bluehost database credentials
  - [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
  - [ ] Set NEXTAUTH_URL to production domain
  - [ ] Set NEXT_PUBLIC_API_URL to production domain
  - [ ] Verify Cloudinary credentials
  - [ ] **DO NOT COMMIT TO GIT**
  
### Deployment Scripts
- [ ] **Scripts Ready**
  - [ ] ✅ `scripts/deploy-bluehost.sh` created
  - [ ] ✅ `scripts/deploy-bluehost.ps1` created (Windows)
  - [ ] ✅ `scripts/pre-deployment-check.sh` created
  - [ ] Scripts are executable
  
### Documentation
- [ ] **Guides Created**
  - [ ] ✅ `BLUEHOST_DEPLOYMENT_GUIDE.md` complete
  - [ ] ✅ `DEPLOYMENT_CHECKLIST.md` (this file)
  - [ ] Stored safely for reference

---

## 🔐 SECURITY CHECK

### Secrets Management
- [ ] **No Secrets in Code**
  - [ ] Run: `git log -p` and search for passwords
  - [ ] No API keys in `.git` history
  - [ ] No database passwords in code
  - [ ] `.gitignore` properly configured
  
- [ ] **Environment Variables**
  - [ ] `.env.production` NOT committed
  - [ ] `.env*` in `.gitignore`
  - [ ] `!.env.example` exception in `.gitignore`
  
- [ ] **SSL Certificate**
  - [ ] Domain has SSL (AutoSSL in Bluehost cPanel)
  - [ ] HTTPS enabled
  - [ ] Certificate valid
  
---

## 🛠️ BLUEHOST SERVER SETUP

### VPS/Dedicated Hosting Configuration
- [ ] **SSH Access**
  - [ ] SSH connection established
  - [ ] Run: `ssh user@bluehost-server`
  - [ ] Terminal access confirmed
  
- [ ] **Node.js Installation**
  - [ ] Node.js 20+ installed
  - [ ] Run: `node --version` (should be v20+)
  - [ ] npm installed: `npm --version`
  
- [ ] **Process Manager (PM2)**
  - [ ] PM2 installed globally: `npm install -g pm2`
  - [ ] Run: `pm2 startup`
  - [ ] Run: `pm2 save`
  
- [ ] **Web Server Configuration**
  - [ ] Apache or Nginx configured
  - [ ] Reverse proxy to localhost:3000
  - [ ] Ports 80/443 accessible
  - [ ] SSL configured

### Database Connection
- [ ] **PostgreSQL Accessible**
  - [ ] Test: `psql -h host -U user -d dbname -c "SELECT 1"`
  - [ ] Password verified
  - [ ] Remote connection (if needed) working
  
---

## 📤 DEPLOYMENT EXECUTION

### Upload & Deploy
- [ ] **Pre-Deployment Check**
  - [ ] Run (local): `bash scripts/pre-deployment-check.sh`
  - [ ] All checks pass
  - [ ] No issues reported
  
- [ ] **Run Deployment Script** (Choose one)
  - [ ] **Linux/Mac:** `bash scripts/deploy-bluehost.sh admin@bluehost.com`
  - [ ] **Windows PowerShell:** `.\scripts\deploy-bluehost.ps1 -Server "admin@bluehost.com"`
  - [ ] Script completes without errors
  - [ ] Files uploaded successfully
  
- [ ] **Server-Side Deployment**
  - [ ] SSH into server
  - [ ] Package extracted: `tar -xzf consol-*.tar.gz`
  - [ ] Dependencies installed: `npm install --production`
  - [ ] Database migrated: `npx prisma migrate deploy`
  - [ ] PM2 started: `pm2 start "npm start" --name consol`
  - [ ] PM2 persisted: `pm2 save`
  
---

## ✅ POST-DEPLOYMENT VALIDATION

### Application Testing
- [ ] **URL Accessibility**
  - [ ] Domain loads: `https://your-domain.com`
  - [ ] HTTPS working (green lock icon)
  - [ ] No "invalid certificate" warnings
  
- [ ] **Application Functionality**
  - [ ] Homepage loads correctly
  - [ ] Navigation works
  - [ ] All pages accessible
  - [ ] Forms submit successfully
  - [ ] File uploads work (if applicable)
  
- [ ] **Performance**
  - [ ] Page load time < 3 seconds
  - [ ] No console errors in browser
  - [ ] Images load properly
  - [ ] Responsive design works on mobile
  
- [ ] **Database Operations**
  - [ ] User authentication works (if applicable)
  - [ ] Data persistence verified
  - [ ] Queries execute properly
  - [ ] No 500 errors
  
### Server Status
- [ ] **Application Running**
  - [ ] SSH and run: `pm2 status`
  - [ ] "consol" process shows "online"
  - [ ] No errors in logs
  
- [ ] **Log Monitoring**
  - [ ] SSH and run: `pm2 logs consol`
  - [ ] No error messages
  - [ ] Application startup messages visible
  
- [ ] **Health Check**
  - [ ] Test API endpoint: `curl https://your-domain.com/api/health`
  - [ ] Returns 200 OK status
  
---

## 🔄 MAINTENANCE & MONITORING

### Ongoing Monitoring
- [ ] **Log Monitoring Setup**
  - [ ] PM2 log rotation installed: `pm2 install pm2-logrotate`
  - [ ] Monitoring alerts configured
  - [ ] Email notifications enabled (if available)
  
- [ ] **Backup Strategy**
  - [ ] Database backups scheduled
  - [ ] Daily backup at 2 AM set
  - [ ] Backups stored securely
  - [ ] Test restore procedure
  
- [ ] **Auto-Restart**
  - [ ] PM2 configured to restart on server reboot
  - [ ] Run: `pm2 startup`
  - [ ] Run: `pm2 save`
  - [ ] Reboot test: Restart server and verify app starts

### Updates & Patches
- [ ] **Security Updates**
  - [ ] Node.js security patches monitored
  - [ ] npm packages reviewed for vulnerabilities
  - [ ] SSL certificate renewal scheduled
  
- [ ] **Application Updates**
  - [ ] Update strategy documented
  - [ ] Rollback plan in place
  - [ ] Staging environment available

---

## 📞 TROUBLESHOOTING REFERENCE

| Issue | Solution |
|-------|----------|
| "Port 3000 in use" | `pm2 delete all && pm2 kill` |
| "Database connection refused" | Check credentials: `psql -h host -U user -d db` |
| "Static assets 404" | Verify `public/` copied; check proxy config |
| "npm: command not found" | SSH to server; install Node.js via NVM |
| "Permissions denied" | Check file ownership: `chown -R user:user /home/user/consol` |
| "Out of memory" | Add swap: `fallocate -l 4G /swapfile` |
| "SSL certificate invalid" | Regenerate in cPanel or with Certbot |

---

## 📊 DEPLOYMENT SUMMARY

**Status:** [ ] Ready to Deploy / [ ] Deployed / [ ] Post-Deployment Testing

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Notes:** _______________________________________________

---

## 📞 SUPPORT

If stuck at any point:
1. Check the [BLUEHOST_DEPLOYMENT_GUIDE.md](./BLUEHOST_DEPLOYMENT_GUIDE.md)
2. Review error messages in `pm2 logs consol`
3. Create new AI chat with this checklist + error screenshot

**Your app is production-ready! 🚀**

