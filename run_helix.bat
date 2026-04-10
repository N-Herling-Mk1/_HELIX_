@echo off
title HELIX
color 0B
echo.
echo  H-E-L-I-X  starting...
echo.

:: kill any existing instance first
call "%~dp0kill_helix.bat" >nul 2>&1
timeout /t 1 /nobreak >nul

:: install deps silently if missing
python -m pip install flask flask-cors flask-socketio pywinpty --quiet --exists-action i 2>nul

:: start server
start "" python "%~dp0helix_server.py"
timeout /t 2 /nobreak >nul
start "" http://localhost:5000/control

echo  Server running. Close this window to stop.
pause >nul
