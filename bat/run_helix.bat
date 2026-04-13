@echo off
title HELIX SERVER
color 0B
echo.
echo  H-E-L-I-X  starting...
echo.

:: kill any existing instance first
call "%~dp0kill_helix.bat" >nul 2>&1
timeout /t 1 /nobreak >nul

:: install deps silently if missing
python -m pip install flask flask-cors flask-socketio pywinpty --quiet --exists-action i 2>nul

:: start server — helix_server.py lives in assets\py_progs\, NOT in bat\
start "" python "%~dp0..\assets\py_progs\helix_server.py"

echo  Server starting on localhost:5000
echo  Close this window to stop.
pause >nul
