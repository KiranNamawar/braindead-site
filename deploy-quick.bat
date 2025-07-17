@echo off
REM Quick Deploy Script - Skips linting for faster deployment
echo 🧠 Quick Deploy BrainDead.site to Netlify...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Build the project (skip linting)
echo 🏗️ Building the project...
npm run build
if errorlevel 1 (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

REM Check if dist directory was created
if not exist "dist" (
    echo ❌ Build directory 'dist' not found.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📁 Build output is in the 'dist' directory

REM Check if Netlify CLI is installed
netlify --version >nul 2>&1
if %errorlevel% == 0 (
    set /p response="🚀 Netlify CLI detected. Would you like to deploy now? (y/n): "
    if /i "%response%"=="y" (
        echo 🌐 Deploying to Netlify...
        netlify deploy --prod --dir=dist
        if errorlevel 1 (
            echo ❌ Deployment failed.
            pause
            exit /b 1
        ) else (
            echo 🎉 Deployment successful!
        )
    )
) else (
    echo 💡 To deploy with Netlify CLI:
    echo    1. Install: npm install -g netlify-cli
    echo    2. Login: netlify login
    echo    3. Deploy: netlify deploy --prod --dir=dist
    echo.
    echo 💡 Or drag the 'dist' folder to netlify.com
)

echo 🧠 BrainDead.site is ready for deployment!
echo.
echo 📝 Note: This quick deploy skipped linting. Run 'npm run lint:fix' to fix code quality issues.
pause