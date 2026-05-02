@echo off
title KidneyScan AI

:: Start Backend
start "Backend" /min cmd /k "cd /d E:\Kidney Disorder\backend && myenv\Scripts\activate && python run.py"

:: Start Frontend  
start "Frontend" /min cmd /k "cd /d E:\Kidney Disorder\frontend && npm run dev"

:: Wait 10 seconds then open Chrome directly
timeout /t 10 /nobreak > nul
start chrome http://localhost:3000