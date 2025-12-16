# Start Vite Dev Server
# Change to the build-a-wig directory first
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Starting Vite dev server..." -ForegroundColor Green
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Get local IP address
Write-Host "Your local IP addresses:" -ForegroundColor Cyan
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notmatch '^127\.' -and 
    $_.IPAddress -notmatch '^169\.254\.' -and
    $_.InterfaceAlias -notmatch 'Loopback'
} | ForEach-Object {
    Write-Host "  - http://$($_.IPAddress):3001" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting server on port 3001..." -ForegroundColor Green
Write-Host "Access from mobile: Use one of the IP addresses above" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev

