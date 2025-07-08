# PowerShell script to start the app with HTTPS using ngrok

Write-Host "Starting Time Booking App with HTTPS..." -ForegroundColor Green

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "ngrok not found. Installing via npm..." -ForegroundColor Yellow
    npm install -g ngrok
}

# Start Next.js in background
Write-Host "Starting Next.js development server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized

# Wait for Next.js to start
Write-Host "Waiting for Next.js to start..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Start ngrok tunnel
Write-Host "Creating HTTPS tunnel with ngrok..." -ForegroundColor Blue
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

ngrok http 3000
