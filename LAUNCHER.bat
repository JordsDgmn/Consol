@echo off
REM CONSOL AI Training Monitor - Universal Launcher
REM Choose your mode!

:menu
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     CONSOL AI Training Monitor v2.1.4 Launcher         ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Choose a mode:
echo.
echo  1) FULL GUI + Terminal (Most convincing, shows everything)
echo  2) GUI Only - Silent Mode (Just the window, no terminal)
echo  3) Terminal Only (Logs in terminal, no window)
echo  4) Setup Check (Verify dependencies)
echo  5) Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    start START_TRAINING.bat
    echo.
    echo Training monitor launched!
    timeout /t 2 /nobreak
    goto menu
)

if "%choice%"=="2" (
    cscript START_TRAINING_SILENT.vbs
    echo.
    echo Silent training monitor launched!
    timeout /t 2 /nobreak
    goto menu
)

if "%choice%"=="3" (
    call START_TRAINING_TERMINAL.bat
    goto menu
)

if "%choice%"=="4" (
    call SETUP_CHECK.bat
    goto menu
)

if "%choice%"=="5" (
    exit /b
)

echo Invalid choice!
timeout /t 2 /nobreak
goto menu
