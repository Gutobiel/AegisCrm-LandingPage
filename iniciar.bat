@echo off
title Aegis CRM - Landing Page

:: Set current directory to script directory
cd /d "%~dp0"

:: If running from root directory, go to subdirectory
if exist "AegisCrm-LandingPage-main" (
    cd "AegisCrm-LandingPage-main"
)

echo.
echo  ==========================================
echo        AEGIS CRM - Landing Page
echo        Iniciando servidores locais...
echo  ==========================================
echo.

:: 1. Start Kokoro TTS FastAPI Server (Port 8880)
if exist ".venv\Scripts\python.exe" (
    echo -> Iniciando Servidor de Voz Kokoro TTS (Porta 8880)...
    start "Aegis CRM - Kokoro TTS Server (Porta 8880)" /min ".venv\Scripts\python.exe" server\kokoro_server.py
) else (
    echo [AVISO] .venv de Python nao localizado em .venv\Scripts\python.exe
)

:: 2. Check Node.js path in priority order:
if exist "node-portable\node.exe" (
    set "NODE_CMD=node-portable\node.exe"
    goto node_ok
)

if exist "..\node-portable\node.exe" (
    set "NODE_CMD=..\node-portable\node.exe"
    goto node_ok
)

node -v >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
    goto node_ok
)

if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    goto node_ok
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files (x86)\nodejs\node.exe"
    goto node_ok
)

if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
    set "NODE_CMD=%LOCALAPPDATA%\Programs\node\node.exe"
    goto node_ok
)

if exist "%APPDATA%\npm\node.exe" (
    set "NODE_CMD=%APPDATA%\npm\node.exe"
    goto node_ok
)

echo [ERRO] O Node.js nao foi encontrado no sistema (nem instalado, nem portable).
echo Por favor, instale o Node.js para rodar o servidor ou verifique a pasta node-portable.
echo Baixe em: https://nodejs.org/
echo.
pause
exit /b

:node_ok
echo -> Node.js localizado: %NODE_CMD%
echo -> Servidor Web sendo iniciado na porta 3000...
echo.

:: Open browser
start "" "http://localhost:3000"

:: Start Node.js Web Server
"%NODE_CMD%" server\server.js

pause
