@echo off
cd /d "%~dp0"
echo Starting Soccer Training preview...
echo.
echo Open this link after the server starts:
echo http://localhost:5173/preview.html
echo.
set "CODEX_NODE=C:\Users\hydro\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%CODEX_NODE%" (
  "%CODEX_NODE%" preview-server.mjs
) else (
  node preview-server.mjs
)
echo.
echo Preview server stopped. If you see an error above, send a screenshot.
pause
