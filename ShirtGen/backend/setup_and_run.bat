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


:: Keep the command prompt open
pause
