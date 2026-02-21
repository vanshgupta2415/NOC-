# Quick Start Script for No Dues Portal
# This script helps you start both frontend and backend servers

$backendPath = Join-Path $PSScriptRoot "nodues backend"
$frontendPath = Join-Path $PSScriptRoot "Nodues frontend"

Write-Host "No Dues Portal - Quick Start" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    # Using Try-Catch in case Test-NetConnection fails or is not found
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoCheck.TcpTestSucceeded) {
        Write-Host "MongoDB is running on port 27017" -ForegroundColor Green
    }
    else {
        Write-Host "MongoDB is NOT running on port 27017" -ForegroundColor Red
        Write-Host "Please start MongoDB before continuing." -ForegroundColor Yellow
        Write-Host "Run: mongod" -ForegroundColor Yellow
        Write-Host "NOTE: If you don't have MongoDB installed locally, the backend will fail." -ForegroundColor Magenta
        
        # We will attempt to start servers anyway, but backend will likely crash
        Write-Host "Starting servers anyway (Backend might fail)..." -ForegroundColor Red
        Start-Sleep -Seconds 3
    }
}
catch {
    Write-Host "Count not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server' -ForegroundColor Green; npm start"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "Servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "1. Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "2. Test Login Credentials:" -ForegroundColor Cyan
Write-Host "   Email:    admin@mitsgwl.ac.in" -ForegroundColor White
Write-Host "   Password: Admin@123456" -ForegroundColor White
Write-Host ""
Write-Host "3. For more info, see: FRONTEND_BACKEND_ALIGNMENT.md" -ForegroundColor Yellow
Write-Host ""
