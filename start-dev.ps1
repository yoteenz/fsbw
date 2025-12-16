# Start Vite Dev Server with Error Handling
$ErrorActionPreference = "Continue"

Write-Host "=== Starting Vite Dev Server ===" -ForegroundColor Green
Write-Host ""

# Kill any existing Node processes on ports 3001-3010
Write-Host "Cleaning up any existing processes..." -ForegroundColor Yellow
$ports = 3001..3010
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $pid = $connection.OwningProcess
        Write-Host "Killing process on port $port (PID: $pid)" -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 1

# Check dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install failed!" -ForegroundColor Red
        exit 1
    }
}

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
Write-Host "  - http://localhost:3001" -ForegroundColor Green

Write-Host ""
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host "If the server crashes, check the error messages above." -ForegroundColor Yellow
Write-Host ""

# Set environment variables
$env:NODE_ENV = "development"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Start server and capture all output
try {
    npm run dev 2>&1 | ForEach-Object {
        $line = $_
        Write-Host $line
        # Check for common error patterns
        if ($line -match "error|Error|ERROR|failed|Failed|FAILED") {
            Write-Host ">>> ERROR DETECTED: $line" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "FATAL ERROR: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
}
