@echo off
title Aegis CRM - Landing Page
chcp 65001 >nul

:: Definir diretorio atual para a pasta do script
cd /d "%~dp0"

:: Se estiver rodando da raiz com subpasta, entrar nela
if exist "AegisCrm-LandingPage-main" (
    cd "AegisCrm-LandingPage-main"
)

echo.
echo  ==========================================
echo        AEGIS CRM - Landing Page
echo        Iniciando servidores locais...
echo  ==========================================
echo.

:: 1. Adicionar dependencias portateis locais ao PATH
if exist "%CD%\node-portable" (
    set "PATH=%CD%\node-portable;%PATH%"
)
if exist "%CD%\git-portable\cmd" (
    set "PATH=%CD%\git-portable\cmd;%PATH%"
)

:: 2. Iniciar Servidor de Voz Kokoro TTS (se houver python/venv)
if exist ".venv\Scripts\python.exe" (
    echo -> Iniciando Servidor de Voz Kokoro TTS (Porta 8880)...
    start "Aegis CRM - Kokoro TTS Server (Porta 8880)" /min ".venv\Scripts\python.exe" server\kokoro_server.py
) else if exist "venv\Scripts\python.exe" (
    echo -> Iniciando Servidor de Voz Kokoro TTS (Porta 8880)...
    start "Aegis CRM - Kokoro TTS Server (Porta 8880)" /min "venv\Scripts\python.exe" server\kokoro_server.py
)

:: 3. Localizar executavel do Node.js
if exist "node-portable\node.exe" (
    set "NODE_CMD=%CD%\node-portable\node.exe"
    goto node_ok
)

if exist "..\node-portable\node.exe" (
    set "NODE_CMD=%CD%\..\node-portable\node.exe"
    goto node_ok
)

where node >nul 2>nul
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
echo Por favor, verifique a pasta node-portable ou instale em https://nodejs.org/
echo.
pause
exit /b

:node_ok
echo -> Node.js localizado: %NODE_CMD%
echo -> Servidor Web sendo iniciado na porta 3000...
echo.

:: Abrir navegador
start "" "http://localhost:3000"

:: Iniciar Servidor Node.js
"%NODE_CMD%" server\server.js

pause
