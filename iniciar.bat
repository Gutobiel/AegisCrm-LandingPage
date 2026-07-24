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

:: Check Node.js path
set "NODE_CMD=node"

:: Test if global node works
node -v >nul 2>nul
if %errorlevel% equ 0 goto node_ok

:: Test default installation path
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    goto node_ok
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files (x86)\nodejs\node.exe"
    goto node_ok
)

echo [ERRO] O Node.js nao foi encontrado no sistema.
echo Por favor, instale o Node.js para rodar o servidor.
echo Baixe em: https://nodejs.org/
echo.
pause
exit /b

:node_ok
:: Open browser
start "" "http://localhost:3000"

:: Start server
"%NODE_CMD%" server.js

pause
