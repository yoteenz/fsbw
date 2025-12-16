# Test script to diagnose server issues
# Change to the build-a-wig directory first
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== Server Diagnostic Script ===" -ForegroundColor Cyan
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules not found! Run 'npm install' first." -ForegroundColor Red
    exit 1
}

# Check for Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check for Vite
$viteVersion = npx vite --version 2>&1
Write-Host "Vite version: $viteVersion" -ForegroundColor Green

# Get local IP
Write-Host ""
Write-Host "Your local IP addresses:" -ForegroundColor Cyan
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notmatch '^127\.' -and 
    $_.IPAddress -notmatch '^169\.254\.' -and
    $_.InterfaceAlias -notmatch 'Loopback'
}
foreach ($ip in $ips) {
    Write-Host "  - http://$($ip.IPAddress):3001" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting server with verbose logging..." -ForegroundColor Yellow
Write-Host "Watch for any errors after 'ready' message" -ForegroundColor Yellow
Write-Host ""

# Start server with explicit error handling
$env:NODE_ENV = "development"
npm run dev
