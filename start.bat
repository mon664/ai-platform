@echo off
title AI 경리봇 시스템
echo.
echo ==========================================
echo        AI 경리봇 시스템 시작
echo ==========================================
echo.

echo [1/3] 백엔드 서버 시작 중...
cd /d "%~dp0backend"
if not exist "database" mkdir database
start "AI Assistant Backend" cmd /k "node server.js"

echo.
echo [2/3] 서버 준비 대기 (5초)...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] 웹 브라우저에서 열기...
cd /d "%~dp0web"
start "" "http://localhost:3001"
start "" "index.html"

echo.
echo ==========================================
echo           시스템 시작 완료!
echo ==========================================
echo.
echo 백엔드 서버: http://localhost:3001
echo 메인 화면: index.html
echo 데이터 입력: data-input.html
echo.
echo 이 창은 닫아도 됩니다. 백엔드 서버는 별도 창에서 계속 실행됩니다.
echo 시스템을 완전히 종료하려면 백엔드 서버 창을 닫아주세요.
echo.
pause