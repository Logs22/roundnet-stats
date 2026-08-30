@echo off
title Roundnet Stats Sync
echo ==================================================
echo Starting Roundnet Tournament Sync...
echo ==================================================
echo.
python %~dp0sync_roundnet.py
echo.
echo ==================================================
echo Building web dashboard...
echo ==================================================
cd /d %~dp0web
call npm run build
echo.
echo ==================================================
echo Sync & Build Complete! Refresh your browser.
echo ==================================================
pause
