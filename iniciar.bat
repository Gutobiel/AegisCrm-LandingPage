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
echo        Iniciando servidor local...
echo  ==========================================
echo.

:: Check Node.js path in priority order:
:: 1. Local portable node
if exist "node-portable\node.exe" (
    set "NODE_CMD=node-portable\node.exe"
    goto node_ok
)

:: 2. Parent directory portable node
if exist "..\node-portable\node.exe" (
    set "NODE_CMD=..\node-portable\node.exe"
    goto node_ok
)

:: 3. Global node command
node -v >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
    goto node_ok
)

:: 4. Standard Program Files installation paths
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    goto node_ok
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files (x86)\nodejs\node.exe"
    goto node_ok
)

:: 5. AppData User installation paths
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
echo.

:: Open browser
start "" "http://localhost:3000"

:: Start server
"%NODE_CMD%" server.js

pause
