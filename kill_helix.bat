@echo off
title HELIX — KILL
echo Killing process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 "') do (
    echo Killing PID %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo Done.
