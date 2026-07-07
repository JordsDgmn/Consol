# ============================================================================
# Consol Bluehost Deployment Script for Windows PowerShell
# ============================================================================
# This script automates deployment to Bluehost server
#
# REQUIREMENTS:
# - SSH access to Bluehost (via Putty, Git Bash, or WSL)
# - .env.production file filled with credentials
# - Application built locally (npm run build)
#
# USAGE (in PowerShell):
# .\scripts\deploy-bluehost.ps1 -Server "admin@bluehost.example.com" -RemotePath "/home/admin/consol"
#
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Server,
    
    [string]$RemotePath = "/home/username/consol",
    
    [switch]$NoVerify = $false
)

# Color functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error-Custom { Write-Host $args -ForegroundColor Red }
function Write-Warning-Custom { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Blue }

$DeployDate = Get-Date -Format "yyyyMMdd_HHmmss"
$LocalDir = Get-Location
$DeployFile = "consol-${DeployDate}.tar.gz"

# ============================================================================
# PHASE 1: LOCAL BUILD
# ============================================================================
Write-Info "═══════════════════════════════════════════════════════════"
Write-Info "PHASE 1: Building application locally..."
Write-Info "═══════════════════════════════════════════════════════════"

if (-not (Test-Path ".\.next")) {
    Write-Warning-Custom "🔨 Running npm run build..."
    npm install --legacy-peer-deps
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "❌ Build failed!"
        exit 1
    }
    Write-Success "✅ Build successful"
} else {
    Write-Success "✅ Build already exists"
}

# ============================================================================
# PHASE 2: VALIDATE ENVIRONMENT
# ============================================================================
Write-Info "`n═══════════════════════════════════════════════════════════"
Write-Info "PHASE 2: Validating environment..."
Write-Info "═══════════════════════════════════════════════════════════"

if (-not (Test-Path ".\.env.production")) {
    Write-Error-Custom "❌ .env.production not found!"
    Write-Warning-Custom "Please create .env.production from .env.production.example"
    exit 1
}

Write-Success "✅ .env.production found"

# ============================================================================
# PHASE 3: CREATE DEPLOYMENT PACKAGE
# ============================================================================
Write-Info "`n═══════════════════════════════════════════════════════════"
Write-Info "PHASE 3: Creating deployment package..."
Write-Info "═══════════════════════════════════════════════════════════"

Write-Warning-Custom "📦 Packaging files (this may take a moment)..."

# Create tar file with 7z (if available) or tar command
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $DeployFile `
        --exclude="node_modules" `
        --exclude=".git" `
        --exclude=".next/cache" `
        --exclude="*.log" `
        --exclude=".DS_Store" `
        ".next" "prisma" "public" "app" "lib" "components" "utils" `
        ".env.production" "next.config.mjs" "package.json" "package-lock.json" `
        "tsconfig.json" "tailwind.config.js" "postcss.config.mjs"
} else {
    Write-Error-Custom "❌ tar command not found. Install Git Bash or use WSL."
    exit 1
}

if (-not (Test-Path $DeployFile)) {
    Write-Error-Custom "❌ Failed to create deployment package"
    exit 1
}

$FileSize = (Get-Item $DeployFile).Length / 1MB
Write-Success "✅ Package created: $DeployFile ($([math]::Round($FileSize, 2)) MB)"

# ============================================================================
# PHASE 4: UPLOAD TO SERVER
# ============================================================================
Write-Info "`n═══════════════════════════════════════════════════════════"
Write-Info "PHASE 4: Uploading to Bluehost server..."
Write-Info "═══════════════════════════════════════════════════════════"

Write-Warning-Custom "📤 Uploading to $Server..."

# Try SCP (Windows 10+ has built-in OpenSSH)
if (Get-Command scp -ErrorAction SilentlyContinue) {
    scp -P 22 $DeployFile "${Server}:${RemotePath}/"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "❌ Upload failed!"
        exit 1
    }
} else {
    Write-Error-Custom "❌ scp command not found. Install OpenSSH or Git Bash."
    exit 1
}

Write-Success "✅ Upload successful"

# ============================================================================
# PHASE 5: DEPLOY ON SERVER
# ============================================================================
Write-Info "`n═══════════════════════════════════════════════════════════"
Write-Info "PHASE 5: Deploying on server..."
Write-Info "═══════════════════════════════════════════════════════════"

Write-Warning-Custom "🚀 Executing remote deployment commands..."

$RemoteScript = @"
set -e
cd $RemotePath
echo '📦 Extracting deployment package...'
tar -xzf $DeployFile
echo '🧹 Cleaning up old node_modules...'
rm -rf node_modules
echo '📥 Installing production dependencies...'
npm install --production --legacy-peer-deps
echo '🗄️  Running database migrations...'
npx prisma migrate deploy || npx prisma db push
echo '🔄 Restarting application with PM2...'
pm2 delete consol 2>/dev/null || true
pm2 start "npm start" --name consol
pm2 save
echo '✅ Deployment complete!'
pm2 status
"@

ssh $Server $RemoteScript

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "❌ Remote deployment failed!"
    exit 1
}

Write-Success "✅ Remote deployment successful"

# ============================================================================
# PHASE 6: CLEANUP
# ============================================================================
Write-Info "`n═══════════════════════════════════════════════════════════"
Write-Info "PHASE 6: Cleanup..."
Write-Info "═══════════════════════════════════════════════════════════"

Write-Warning-Custom "🧹 Removing local deployment package..."
Remove-Item $DeployFile -Force
Write-Success "✅ Cleanup complete"

# ============================================================================
# SUMMARY
# ============================================================================
Write-Success "`n╔════════════════════════════════════════════════════════════╗"
Write-Success "║        🎉 DEPLOYMENT SUCCESSFUL! 🎉                         "
Write-Success "╠════════════════════════════════════════════════════════════╣"
Write-Success "║ Server: $Server"
Write-Success "║ Deploy Date: $DeployDate"
Write-Success "║ Remote Path: $RemotePath"
Write-Success "╠════════════════════════════════════════════════════════════╣"
Write-Success "║ Next Steps:"
Write-Success "║ 1. Visit your domain and test the application"
Write-Success "║ 2. Check logs: ssh $Server 'pm2 logs consol'"
Write-Success "║ 3. Monitor: ssh $Server 'pm2 monit'"
Write-Success "║ 4. Restart if needed: ssh $Server 'pm2 restart consol'"
Write-Success "╚════════════════════════════════════════════════════════════╝"

Write-Warning-Custom "`n📚 Documentation: See BLUEHOST_DEPLOYMENT_GUIDE.md for details"

