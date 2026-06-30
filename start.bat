@echo off
title KidneyScan AI

:: Start Backend
start "Backend" /min cmd /k "cd /d "E:\Kidney Disorder - Copy\backend" && myenv\Scripts\activate && python run.py"

:: Start Frontend
start "Frontend" /min cmd /k "cd /d "E:\Kidney Disorder - Copy\frontend" && npm run dev"

:: Wait 10 seconds then open Chrome
timeout /t 10 /nobreak > nul
start chrome http://localhost:3000