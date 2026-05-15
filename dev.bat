@echo off
echo Starting Backend...
start "Backend" cmd /k "cd /d %~dp0backend && dotnet run"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"
