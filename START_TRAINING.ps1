# CONSOL AI Training Monitor Launcher
# PowerShell version - Run with: powershell -ExecutionPolicy Bypass -File START_TRAINING.ps1

Write-Host "========================================" -ForegroundColor Green
Write-Host " CONSOL AI Training Monitor v2.1.4" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow

# Check if psutil is installed
try {
    python -c "import psutil" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing psutil..." -ForegroundColor Yellow
        pip install psutil --quiet
    }
}
catch {
    Write-Host "Installing psutil..." -ForegroundColor Yellow
    pip install psutil --quiet
}

Write-Host "Starting distributed training pipeline..." -ForegroundColor Green
Write-Host "This window will display real-time metrics" -ForegroundColor Cyan
Write-Host ""

python training_monitor.py

pause
