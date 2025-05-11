@echo off
REM Change the current directory to the project folder
cd "C:\Users\66968\Documents\fitness-biometric-frontend"

REM Check if the directory change was successful
if %errorlevel% neq 0 (
    echo Error: Could not change directory to C:\Users\66968\Document\fitness-biometric-frontend
    pause
    exit /b %errorlevel%
)

REM Run the npm dev script
echo Starting server...
node .output/server/index.mjs

echo Server running

REM The script will likely stay running here as 'npm run dev' usually starts a server
REM If the npm process exits, the batch file will continue here.
REM You might want to add a 'pause' here if you want to see the output before the window closes,
REM but if this is for a service or background task, you might omit it.
REM pause
