# Debug script to see what's happening with the server
# Change to the build-a-wig directory first
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== Starting Server with Debug Output ===" -ForegroundColor Cyan
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Kill any existing node processes on port 3001
$existing = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Killing existing process on port 3001..." -ForegroundColor Yellow
    $pid = $existing.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "Starting Vite server..." -ForegroundColor Green
Write-Host "Watch the output below for any errors" -ForegroundColor Yellow
Write-Host ""

# Set environment variables for better error reporting
$env:NODE_OPTIONS = "--trace-warnings"
$env:DEBUG = "vite:*"

# Start the server and capture output
npm run dev 2>&1 | ForEach-Object {
    Write-Host $_ -ForegroundColor White
    # If we see an error, highlight it
    if ($_ -match "error|Error|ERROR|failed|Failed|FAILED") {
        Write-Host $_ -ForegroundColor Red
    }
}

