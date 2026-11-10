@echo off
chcp 65001 >nul
rem KELI 전공박람회 부스 실행기: 소리 자동 재생 + 전체화면(키오스크)
rem 이 파일과 게임 HTML 파일을 같은 폴더에 두고 더블클릭하세요. 종료: Alt+F4
set "F="
for %%f in ("%~dp0*.html") do set "F=%%~ff"
if not defined F ( echo 같은 폴더에 게임 HTML 파일이 없습니다. & pause & exit /b )
set "ARGS=--autoplay-policy=no-user-gesture-required --kiosk --user-data-dir=%TEMP%\keli-fair-kiosk --no-first-run"
set "CH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CH%" set "CH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CH%" set "CH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if exist "%CH%" ( start "" "%CH%" %ARGS% "file:///%F:\=/%" & exit /b )
set "ED=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%ED%" set "ED=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%ED%" ( start "" "%ED%" %ARGS% "file:///%F:\=/%" & exit /b )
echo Chrome 또는 Edge를 찾지 못했습니다. & pause
