# Comprehensive Canonical Backup Script
# Backs up ALL pages, components, configs, and assets for full recovery

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "..\CANONICAL_BACKUP_$timestamp"
$sourceDir = "."
$excludeDirs = @("node_modules", "dist", ".git", "CANONICAL_BACKUP_*", ".vscode", ".idea")

Write-Host "Creating comprehensive canonical backup..." -ForegroundColor Green
Write-Host "Backup location: $backupFolder" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# Function to copy files recursively, excluding certain directories
function Copy-FilesRecursive {
    param(
        [string]$Source,
        [string]$Destination,
        [string[]]$ExcludeDirs
    )
    
    $items = Get-ChildItem -Path $Source -Force
    
    foreach ($item in $items) {
        $shouldExclude = $false
        foreach ($exclude in $ExcludeDirs) {
            if ($item.Name -like $exclude) {
                $shouldExclude = $true
                break
            }
        }
        
        if (-not $shouldExclude) {
            $destPath = Join-Path $Destination $item.Name
            
            if ($item.PSIsContainer) {
                # Create directory
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
                # Recursively copy contents
                Copy-FilesRecursive -Source $item.FullName -Destination $destPath -ExcludeDirs $ExcludeDirs
            } else {
                # Copy file
                Copy-Item -Path $item.FullName -Destination $destPath -Force
            }
        }
    }
}

# Copy essential directories and files
Write-Host "`nCopying source files..." -ForegroundColor Yellow
Copy-FilesRecursive -Source "src" -Destination "$backupFolder\src" -ExcludeDirs $excludeDirs

Write-Host "Copying public assets..." -ForegroundColor Yellow
Copy-FilesRecursive -Source "public" -Destination "$backupFolder\public" -ExcludeDirs $excludeDirs

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
        Copy-Item -Path $file -Destination "$backupFolder\$file" -Force
        Write-Host "  Copied: $file" -ForegroundColor Gray
    }
}

Write-Host "Copying scripts..." -ForegroundColor Yellow
if (Test-Path "scripts") {
    Copy-FilesRecursive -Source "scripts" -Destination "$backupFolder\scripts" -ExcludeDirs $excludeDirs
}

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
        Copy-Item -Path $script -Destination "$backupFolder\$script" -Force
        Write-Host "  Copied: $script" -ForegroundColor Gray
    }
}

# Verify all page files are backed up
Write-Host "`nVerifying page files..." -ForegroundColor Yellow
$pageFiles = Get-ChildItem -Path "src\pages" -Recurse -Filter "*.tsx" -File
$backedUpPages = Get-ChildItem -Path "$backupFolder\src\pages" -Recurse -Filter "*.tsx" -File

$missingPages = @()
foreach ($page in $pageFiles) {
    $relativePath = $page.FullName.Replace((Get-Location).Path + "\", "")
    $backupPath = Join-Path $backupFolder $relativePath
    if (-not (Test-Path $backupPath)) {
        $missingPages += $relativePath
    }
}

if ($missingPages.Count -gt 0) {
    Write-Host "`nWARNING: Missing pages in backup:" -ForegroundColor Red
    foreach ($missing in $missingPages) {
        Write-Host "  - $missing" -ForegroundColor Red
    }
} else {
    Write-Host "  All $($pageFiles.Count) page files verified!" -ForegroundColor Green
}

# Create backup manifest
Write-Host "`nCreating backup manifest..." -ForegroundColor Yellow
$manifest = @{
    timestamp = $timestamp
    backupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    sourceDirectory = (Get-Location).Path
    backupLocation = (Resolve-Path $backupFolder).Path
    totalPages = $pageFiles.Count
    totalComponents = (Get-ChildItem -Path "src\components" -Recurse -Filter "*.tsx" -File -ErrorAction SilentlyContinue).Count
    configFiles = $configFiles.Count
}

$manifestPath = Join-Path $backupFolder "BACKUP_MANIFEST.json"
$manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8

# Create page inventory
Write-Host "Creating page inventory..." -ForegroundColor Yellow
$inventory = @{
    pages = @()
    components = @()
    utils = @()
    types = @()
}

foreach ($page in $pageFiles) {
    $relativePath = $page.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.pages += @{
        path = $relativePath
        name = $page.Name
        size = $page.Length
        lastModified = $page.LastWriteTime
    }
}

$componentFiles = Get-ChildItem -Path "src\components" -Recurse -Filter "*.tsx" -File -ErrorAction SilentlyContinue
foreach ($comp in $componentFiles) {
    $relativePath = $comp.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.components += @{
        path = $relativePath
        name = $comp.Name
        size = $comp.Length
    }
}

$utilFiles = Get-ChildItem -Path "src\utils" -Recurse -Filter "*.ts" -File -ErrorAction SilentlyContinue
foreach ($util in $utilFiles) {
    $relativePath = $util.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.utils += @{
        path = $relativePath
        name = $util.Name
        size = $util.Length
    }
}

$typeFiles = Get-ChildItem -Path "src\types" -Recurse -Filter "*.ts" -File -ErrorAction SilentlyContinue
foreach ($type in $typeFiles) {
    $relativePath = $type.FullName.Replace((Get-Location).Path + "\", "")
    $inventory.types += @{
        path = $relativePath
        name = $type.Name
        size = $type.Length
    }
}

$inventoryPath = Join-Path $backupFolder "PAGE_INVENTORY.json"
$inventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $inventoryPath -Encoding UTF8

# Summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "BACKUP COMPLETE!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Cyan
Write-Host "Backup Location: $backupFolder" -ForegroundColor White
Write-Host "Total Pages: $($pageFiles.Count)" -ForegroundColor White
Write-Host "Total Components: $($componentFiles.Count)" -ForegroundColor White
Write-Host "Manifest: BACKUP_MANIFEST.json" -ForegroundColor White
Write-Host "Inventory: PAGE_INVENTORY.json" -ForegroundColor White
Write-Host "`nBackup is ready for full recovery!" -ForegroundColor Green
