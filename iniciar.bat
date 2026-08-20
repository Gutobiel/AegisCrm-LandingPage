@echo off
title Aegis CRM - Landing Page
chcp 65001 >nul

cd /d "%~dp0"

echo.
echo ==========================================
echo       AEGIS CRM - Landing Page
echo       Iniciando servidores locais...
echo ==========================================
echo.

:: 1. Adicionar dependencias portateis ao PATH
if exist "%~dp0node-portable" set "PATH=%~dp0node-portable;%PATH%"
if exist "%~dp0git-portable\cmd" set "PATH=%~dp0git-portable\cmd;%PATH%"

:: 2. Iniciar Servidor Kokoro TTS se houver venv
if exist "%~dp0.venv\Scripts\python.exe" start "Aegis CRM - Kokoro TTS" /min "%~dp0.venv\Scripts\python.exe" server\kokoro_server.py

:: 3. Definir comando do Node
set "NODE_CMD="
if exist "%~dp0node-portable\node.exe" set "NODE_CMD=%~dp0node-portable\node.exe"
if not defined NODE_CMD if exist "%~dp0..\node-portable\node.exe" set "NODE_CMD=%~dp0..\node-portable\node.exe"
if not defined NODE_CMD if exist "C:\Program Files\nodejs\node.exe" set "NODE_CMD=C:\Program Files\nodejs\node.exe"
if not defined NODE_CMD where node >nul 2>nul && set "NODE_CMD=node"

if not defined NODE_CMD (
    echo [ERRO] O Node.js nao foi encontrado no sistema.
    echo Por favor, verifique a pasta node-portable ou instale em https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo -> Node.js: %NODE_CMD%
echo -> Abrindo navegador em http://localhost:3000...
echo.

start "" "http://localhost:3000"

"%NODE_CMD%" server\server.js

echo.
echo [AVISO] Servidor encerrado.
pause
