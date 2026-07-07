@echo off
REM CONSOL AI Training Monitor - Terminal Only Launcher
REM Minimal logs-only version without GUI

cd /d "%~dp0"

echo.
echo ========================================
echo  CONSOL AI Training Monitor
echo  Terminal Mode v2.1.4
echo ========================================
echo.

python training_monitor_terminal.py
