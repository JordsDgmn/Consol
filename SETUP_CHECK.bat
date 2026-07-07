@echo off
REM Dependency Check Script
REM Run this once to ensure everything is set up

echo ========================================
echo  CONSOL Training Monitor - Setup Check
echo ========================================
echo.

echo Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found!
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo.
echo Checking psutil module...
python -c "import psutil; print('psutil version:', psutil.__version__)"
if %ERRORLEVEL% NEQ 0 (
    echo psutil not found. Installing...
    pip install psutil
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install psutil
        pause
        exit /b 1
    )
    echo psutil installed successfully!
)

echo.
echo Checking tkinter (should be included with Python)...
python -c "import tkinter; print('tkinter found!')"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: tkinter not found. The GUI may not work.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  All checks passed! Ready to go.
echo ========================================
echo.
echo You can now use:
echo   - START_TRAINING.bat (with terminal)
echo   - START_TRAINING_SILENT.vbs (GUI only)
echo   - START_TRAINING.ps1 (PowerShell version)
echo.
pause
