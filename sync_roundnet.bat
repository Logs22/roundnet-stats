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
echo Publishing update to GitHub / Vercel...
echo ==================================================
cd /d %~dp0
git add export web/src/data/roundnet_data.json
git commit -m "Auto-sync tournament statistics payload"
git push origin main
echo.
echo ==================================================
echo Sync Complete! Vercel is deploying your updates.
echo ==================================================
pause
