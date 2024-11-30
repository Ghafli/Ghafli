@echo off
echo Creating MongoDB data directory...
mkdir C:\data\db

echo Creating MongoDB log directory...
mkdir C:\data\log

echo Creating MongoDB configuration file...
(
echo systemLog:
echo    destination: file
echo    path: C:\data\log\mongod.log
echo storage:
echo    dbPath: C:\data\db
) > C:\data\mongod.cfg

echo MongoDB setup complete!
echo.
echo Please follow these steps:
echo 1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
echo 2. Run the installer and follow the installation steps
echo 3. Add MongoDB bin directory to your system PATH
echo 4. Run 'mongod --config "C:\data\mongod.cfg"' to start MongoDB
echo.
pause
