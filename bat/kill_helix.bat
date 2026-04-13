@echo off
:: Only kill the process LISTENING on port 5000 (the server).
:: Do NOT match outgoing connections — those belong to the launcher's ping thread.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":5000"') do (
    taskkill /PID %%a /F >nul 2>&1
)
:: Also kill by server PID file if it exists (more reliable)
set PID_FILE=%~dp0..\data\server.pid
if exist "%PID_FILE%" (
    set /p SERVER_PID=<"%PID_FILE%"
    taskkill /PID %SERVER_PID% /F >nul 2>&1
    del "%PID_FILE%" >nul 2>&1
)
echo [HELIX] port 5000 cleared.
