@echo off
setlocal
set "NODE16=%LOCALAPPDATA%\Programs\Nodejs\node-v16.20.2-win-x64"
if not exist "%NODE16%\node.exe" (
  echo No se encuentra Node.js 16.20.2 en %NODE16%.
  exit /b 1
)
set "PATH=%NODE16%;%PATH%"
cd /d "%~dp0"
call "%NODE16%\npm.cmd" %*
exit /b %errorlevel%
