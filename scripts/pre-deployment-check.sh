#!/bin/bash
# ============================================================================
# Pre-Deployment Checklist for Consol Bluehost
# ============================================================================
# Run this script before deployment to catch any issues early
#
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((CHECKS_FAILED++))
    fi
}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}CONSOL PRE-DEPLOYMENT CHECKLIST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# ============================================================================
# SYSTEM CHECKS
# ============================================================================
echo -e "\n${YELLOW}📋 SYSTEM REQUIREMENTS${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js${NC} installed: $NODE_VERSION"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ Node.js${NC} not found. Install from https://nodejs.org"
    ((CHECKS_FAILED++))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm${NC} installed: v$NPM_VERSION"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ npm${NC} not found"
    ((CHECKS_FAILED++))
fi

# Check Git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✅ Git${NC} installed"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠️  Git${NC} not found (optional for this check)"
fi

# ============================================================================
# PROJECT STRUCTURE
# ============================================================================
echo -e "\n${YELLOW}📁 PROJECT STRUCTURE${NC}"

# Check key files exist
files_to_check=(
    "package.json"
    "next.config.mjs"
    "tsconfig.json"
    "prisma/schema.prisma"
    ".env.example"
    ".env.production.example"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $file not found"
        ((CHECKS_FAILED++))
    fi
done

# Check directories
dirs_to_check=(
    "app"
    "components"
    "prisma"
    "public"
)

for dir in "${dirs_to_check[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $dir/"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $dir/ not found"
        ((CHECKS_FAILED++))
    fi
done

# ============================================================================
# ENVIRONMENT CONFIGURATION
# ============================================================================
echo -e "\n${YELLOW}🔧 ENVIRONMENT CONFIGURATION${NC}"

# Check .env.example
if grep -q "DATABASE_URL" .env.example; then
    echo -e "${GREEN}✅${NC} DATABASE_URL in .env.example"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} DATABASE_URL missing from .env.example"
    ((CHECKS_FAILED++))
fi

# Check .gitignore
if grep -q ".env" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅${NC} .env files are gitignored"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} .env files might be committed"
    ((CHECKS_FAILED++))
fi

# Check local .env
if [ -f ".env.local" ] || [ -f ".env" ]; then
    echo -e "${GREEN}✅${NC} Local .env file exists"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠️  ${NC} No local .env file. Create from .env.example"
fi

# ============================================================================
# DEPENDENCIES
# ============================================================================
echo -e "\n${YELLOW}📦 DEPENDENCIES${NC}"

# Check package.json has required packages
required_deps=(
    "next"
    "@prisma/client"
    "react"
)

for dep in "${required_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo -e "${GREEN}✅${NC} $dep"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $dep not in package.json"
        ((CHECKS_FAILED++))
    fi
done

# ============================================================================
# BUILD TEST
# ============================================================================
echo -e "\n${YELLOW}🔨 BUILD TEST${NC}"

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Application builds successfully"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} Build failed"
    echo "   Run 'npm run build' to see errors"
    ((CHECKS_FAILED++))
fi

# ============================================================================
# DATABASE
# ============================================================================
echo -e "\n${YELLOW}🗄️  DATABASE${NC}"

# Check Prisma schema
if grep -q "provider = \"postgresql\"" prisma/schema.prisma; then
    echo -e "${GREEN}✅${NC} PostgreSQL configured in Prisma"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} PostgreSQL not configured"
    ((CHECKS_FAILED++))
fi

# Check DATABASE_URL is referenced
if grep -q "env(\"DATABASE_URL\")" prisma/schema.prisma; then
    echo -e "${GREEN}✅${NC} DATABASE_URL environment variable used"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} DATABASE_URL not properly configured"
    ((CHECKS_FAILED++))
fi

# ============================================================================
# DEPLOYMENT FILES
# ============================================================================
echo -e "\n${YELLOW}🚀 DEPLOYMENT FILES${NC}"

deploy_files=(
    "BLUEHOST_DEPLOYMENT_GUIDE.md"
    "scripts/deploy-bluehost.sh"
)

for file in "${deploy_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $file not found"
        ((CHECKS_FAILED++))
    fi
done

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED! ($CHECKS_PASSED/$TOTAL)${NC}"
    echo -e "\n${GREEN}Your app is ready for deployment!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "1. Configure .env.production with Bluehost credentials"
    echo -e "2. Run: bash scripts/deploy-bluehost.sh admin@bluehost.com"
    echo -e "3. Test your domain"
    exit 0
else
    echo -e "${RED}❌ ISSUES FOUND! ($CHECKS_FAILED fails, $CHECKS_PASSED passes)${NC}"
    echo -e "\n${YELLOW}Fix the issues above before deploying.${NC}"
    exit 1
fi

