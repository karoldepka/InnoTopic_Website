@echo off
SETLOCAL

:: Check if virtual environment directory exists
IF NOT EXIST "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate

:: Install required packages
echo Installing dependencies...
pip install -r requirements.txt

:: Start FastAPI server
echo Starting FastAPI server...
start /B python -m uvicorn app.main:app --reload

:: Navigate to frontend directory
cd ..\frontend

:: Install frontend dependencies
echo Installing frontend dependencies...
npm install

:: Start React development server
echo Starting React development server...
npm start

:: Keep the command prompt open
pause
