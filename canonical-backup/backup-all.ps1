# Comprehensive Canonical Backup Script
$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupPath = Join-Path ".." "CANONICAL_BACKUP_$timestamp"

Write-Host "Creating comprehensive backup..." -ForegroundColor Green
Write-Host "Backup location: $backupPath" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Copy src directory (all pages, components, utils, types)
Write-Host "`nCopying src directory..." -ForegroundColor Yellow
Copy-Item -Path "src" -Destination "$backupPath\src" -Recurse -Force -Exclude @("*.tsbuildinfo")

# Copy public directory (all assets)
Write-Host "Copying public directory..." -ForegroundColor Yellow
Copy-Item -Path "public" -Destination "$backupPath\public" -Recurse -Force

# Copy configuration files
Write-Host "Copying configuration files..." -ForegroundColor Yellow
$configFiles = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "vite.config.js",
    "vite.config.d.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "vercel.json",
    "index.html",
    ".gitignore",
    "README.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$backupPath\$file" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Copy scripts directory
if (Test-Path "scripts") {
    Write-Host "Copying scripts directory..." -ForegroundColor Yellow
    Copy-Item -Path "scripts" -Destination "$backupPath\scripts" -Recurse -Force
}

# Copy utility scripts
Write-Host "Copying utility scripts..." -ForegroundColor Yellow
$utilityScripts = @(
    "start-dev.ps1",
    "start-server.ps1",
    "start-server.bat",
    "test-server.ps1",
    "debug-server.ps1",
    "create-canonical-backup.ps1",
    "update-membership.js",
    "update-to-premium.js"
)

foreach ($script in $utilityScripts) {
    if (Test-Path $script) {
        Copy-Item -Path $script -Destination "$backupPath\$script" -Force
        Write-Host "  ✓ $script" -ForegroundColor Gray
    }
}

# Verify all pages are backed up
Write-Host "`nVerifying page files..." -ForegroundColor Yellow
$allPages = Get-ChildItem -Path "src\pages" -Recurse -Filter "*.tsx" -File
$backedUpPages = Get-ChildItem -Path "$backupPath\src\pages" -Recurse -Filter "*.tsx" -File

Write-Host "  Source pages: $($allPages.Count)" -ForegroundColor White
Write-Host "  Backed up pages: $($backedUpPages.Count)" -ForegroundColor White

$missingPages = @()
foreach ($page in $allPages) {
    $relativePath = $page.FullName.Replace((Get-Location).Path + "\", "")
    $backupPathFull = Join-Path $backupPath $relativePath
    if (-not (Test-Path $backupPathFull)) {
        $missingPages += $relativePath
    }
}

if ($missingPages.Count -gt 0) {
    Write-Host "`nWARNING: Missing pages:" -ForegroundColor Red
    foreach ($missing in $missingPages) {
        Write-Host "  - $missing" -ForegroundColor Red
    }
} else {
    Write-Host "  ✓ All pages verified!" -ForegroundColor Green
}

# Create manifest
Write-Host "`nCreating backup manifest..." -ForegroundColor Yellow
$manifest = @{
    timestamp = $timestamp
    backupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    sourceDirectory = (Get-Location).Path
    backupLocation = (Resolve-Path $backupPath).Path
    totalPages = $allPages.Count
    totalComponents = (Get-ChildItem -Path "src\components" -Recurse -Filter "*.tsx" -File -ErrorAction SilentlyContinue).Count
    totalUtils = (Get-ChildItem -Path "src\utils" -Recurse -Filter "*.ts" -File -ErrorAction SilentlyContinue).Count
    totalTypes = (Get-ChildItem -Path "src\types" -Recurse -Filter "*.ts" -File -ErrorAction SilentlyContinue).Count
}

$manifestPath = Join-Path $backupPath "BACKUP_MANIFEST.json"
$manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8

# Create detailed page inventory
Write-Host "Creating page inventory..." -ForegroundColor Yellow
$inventory = @{
    pages = @()
    components = @()
    utils = @()
    types = @()
}

foreach ($page in $allPages) {
    $relativePath = $page.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.pages += @{
        path = $relativePath
        name = $page.Name
        size = $page.Length
        lastModified = $page.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
}

$componentFiles = Get-ChildItem -Path "src\components" -Recurse -Filter "*.tsx" -File -ErrorAction SilentlyContinue
foreach ($comp in $componentFiles) {
    $relativePath = $comp.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.components += @{
        path = $relativePath
        name = $comp.Name
    }
}

$utilFiles = Get-ChildItem -Path "src\utils" -Recurse -Filter "*.ts" -File -ErrorAction SilentlyContinue
foreach ($util in $utilFiles) {
    $relativePath = $util.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.utils += @{
        path = $relativePath
        name = $util.Name
    }
}

$typeFiles = Get-ChildItem -Path "src\types" -Recurse -Filter "*.ts" -File -ErrorAction SilentlyContinue
foreach ($type in $typeFiles) {
    $relativePath = $type.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.types += @{
        path = $relativePath
        name = $type.Name
    }
}

$inventoryPath = Join-Path $backupPath "PAGE_INVENTORY.json"
$inventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $inventoryPath -Encoding UTF8

# Summary
Write-Host "`n" + "="*70 -ForegroundColor Cyan
Write-Host "BACKUP COMPLETE!" -ForegroundColor Green
Write-Host "="*70 -ForegroundColor Cyan
Write-Host "Backup Location: $backupPath" -ForegroundColor White
Write-Host "Total Pages: $($allPages.Count)" -ForegroundColor White
Write-Host "Total Components: $($componentFiles.Count)" -ForegroundColor White
Write-Host "Total Utils: $($utilFiles.Count)" -ForegroundColor White
Write-Host "Total Types: $($typeFiles.Count)" -ForegroundColor White
Write-Host "`nManifest: BACKUP_MANIFEST.json" -ForegroundColor Cyan
Write-Host "Inventory: PAGE_INVENTORY.json" -ForegroundColor Cyan
Write-Host "`n✓ Backup is ready for full recovery!" -ForegroundColor Green
