
:: Check if virtual environment directory exists
IF NOT EXIST "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate

:: Change to frontend directory
cd frontend

:: Install required packages
echo Installing dependencies...
npm install

:: Start React development server
echo Starting React development server...
npm start

:: Pause to keep the command window open
pause
