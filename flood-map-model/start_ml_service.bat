@echo off
REM Start ML Service with proper Python path
REM This batch file ensures the correct Python environment is used

echo.
echo ================================================
echo   Flood Prediction ML Service Startup
echo ================================================
echo.

REM Define Python path
set PYTHON_PATH=C:\Users\binuk\AppData\Local\Programs\Python\Python313\python.exe

REM Check if Python exists
if not exist "%PYTHON_PATH%" (
    echo ❌ Error: Python 3.13 not found at %PYTHON_PATH%
    echo.
    echo Installing Python from python.org and try again.
    pause
    exit /b 1
)

echo ✅ Using Python: %PYTHON_PATH%
%PYTHON_PATH% --version

REM Set Flask environment
set FLASK_APP=app.py
set FLASK_ENV=development
set PYTHONUNBUFFERED=1

echo.
echo 🚀 Starting Flask ML Service...
echo 📍 Endpoint: http://localhost:5000
echo 📊 Trained Models: Random Forest & Gradient Boosting
echo.
echo ✓ Press Ctrl+C to stop the server
echo.

REM Run the app
%PYTHON_PATH% app.py

pause
