#!/bin/bash
# ============================================================================
# Consol Bluehost Deployment Script
# ============================================================================
# This script automates deployment to Bluehost server
#
# REQUIREMENTS:
# - SSH access to Bluehost server
# - .env.production file filled with credentials
# - Application built locally (npm run build)
#
# USAGE:
# ./scripts/deploy-bluehost.sh username@your-server.com /path/to/app
#
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER="${1:-}"
REMOTE_PATH="${2:-/home/username/consol}"
LOCAL_DIR="$(pwd)"
DEPLOY_DATE=$(date +%Y%m%d_%H%M%S)

# Validation
if [ -z "$SERVER" ]; then
    echo -e "${RED}❌ Usage: $0 <username@server> [remote_path]${NC}"
    echo -e "${YELLOW}Example: $0 admin@bluehost.example.com${NC}"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo -e "${YELLOW}Please create .env.production from .env.production.example${NC}"
    exit 1
fi

# ============================================================================
# PHASE 1: LOCAL BUILD
# ============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 1: Building application locally...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ ! -d ".next" ]; then
    echo -e "${YELLOW}🔨 Running npm run build...${NC}"
    npm install --legacy-peer-deps
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${GREEN}✅ Build already exists${NC}"
fi

# ============================================================================
# PHASE 2: CREATE DEPLOYMENT PACKAGE
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 2: Creating deployment package...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

DEPLOY_FILE="consol-${DEPLOY_DATE}.tar.gz"

echo -e "${YELLOW}📦 Packaging files (excluding node_modules and .git)...${NC}"
tar -czf "$DEPLOY_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next/cache' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    .next/ \
    prisma/ \
    public/ \
    app/ \
    lib/ \
    components/ \
    utils/ \
    .env.production \
    next.config.mjs \
    package.json \
    package-lock.json \
    tsconfig.json \
    tailwind.config.js \
    postcss.config.mjs

if [ ! -f "$DEPLOY_FILE" ]; then
    echo -e "${RED}❌ Failed to create deployment package${NC}"
    exit 1
fi

FILE_SIZE=$(du -h "$DEPLOY_FILE" | cut -f1)
echo -e "${GREEN}✅ Package created: $DEPLOY_FILE ($FILE_SIZE)${NC}"

# ============================================================================
# PHASE 3: UPLOAD TO SERVER
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 3: Uploading to Bluehost server...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}📤 Uploading $DEPLOY_FILE to $SERVER...${NC}"
scp -P 22 "$DEPLOY_FILE" "$SERVER:$REMOTE_PATH/" || {
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
}

echo -e "${GREEN}✅ Upload successful${NC}"

# ============================================================================
# PHASE 4: DEPLOY ON SERVER
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 4: Deploying on server...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}🚀 Executing remote deployment commands...${NC}"

ssh "$SERVER" << REMOTE_EOF
    set -e
    
    echo "📂 Navigating to $REMOTE_PATH..."
    cd $REMOTE_PATH
    
    echo "📦 Extracting deployment package..."
    tar -xzf $DEPLOY_FILE
    
    echo "🧹 Cleaning up old node_modules..."
    rm -rf node_modules
    
    echo "📥 Installing production dependencies..."
    npm install --production --legacy-peer-deps
    
    echo "🗄️  Running database migrations..."
    npx prisma migrate deploy || npx prisma db push
    
    echo "🔄 Restarting application with PM2..."
    pm2 delete consol 2>/dev/null || true
    pm2 start "npm start" --name consol
    pm2 save
    
    echo "✅ Deployment complete!"
    pm2 status
    
REMOTE_EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Remote deployment failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Remote deployment successful${NC}"

# ============================================================================
# PHASE 5: VERIFICATION
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 5: Verifying deployment...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

ssh "$SERVER" << VERIFY_EOF
    echo "🔍 Checking application status..."
    pm2 status consol
    
    echo ""
    echo "📋 Recent logs (last 10 lines):"
    pm2 logs consol --lines 10 --nostream
    
    echo ""
    echo "🧪 Testing database connection..."
    node -e "require('dotenv').config({path: '.env.production'}); const { PrismaClient } = require('@prisma/client'); new PrismaClient().\$queryRaw\`SELECT 1\`.then(() => console.log('✅ Database OK')).catch(e => console.error('❌ Database Error:', e.message));"

VERIFY_EOF

# ============================================================================
# CLEANUP
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 6: Cleanup...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}🧹 Removing local deployment package...${NC}"
rm "$DEPLOY_FILE"
echo -e "${GREEN}✅ Cleanup complete${NC}"

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🎉 DEPLOYMENT SUCCESSFUL! 🎉                         ${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║ Server: $SERVER${NC}"
echo -e "${GREEN}║ Deploy Date: $DEPLOY_DATE${NC}"
echo -e "${GREEN}║ Remote Path: $REMOTE_PATH${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║ Next Steps:${NC}"
echo -e "${GREEN}║ 1. Visit your domain and test the application${NC}"
echo -e "${GREEN}║ 2. Check logs: ssh $SERVER 'pm2 logs consol'${NC}"
echo -e "${GREEN}║ 3. Monitor: ssh $SERVER 'pm2 monit'${NC}"
echo -e "${GREEN}║ 4. Restart if needed: ssh $SERVER 'pm2 restart consol'${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📚 Documentation: See BLUEHOST_DEPLOYMENT_GUIDE.md for details${NC}"

