@echo off
title Roundnet Crew Stats Web App
echo ==================================================
echo Launching Roundnet Crew Stats Dashboard...
echo Local address: http://localhost:3000
echo ==================================================
cd %~dp0web
npm run dev
