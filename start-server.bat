@echo off
echo Starting sense website server on port 3000...
echo.
echo Access it at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 3000
pause
