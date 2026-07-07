@echo off
REM CONSOL AI Training Monitor Launcher
REM Click to activate training mode

cd /d "%~dp0"

echo ========================================
echo  CONSOL AI Training Monitor v2.1.4
echo ========================================
echo.
echo Starting distributed training pipeline...
echo This window will display real-time metrics
echo.

python training_monitor.py

pause
