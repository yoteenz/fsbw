# Canonical Backup Script for build-a-wig
# Creates a complete backup of all page routes, components, and configuration files

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "D:\BAW CODE\CANONICAL_BACKUP_$timestamp"
$sourceFolder = "D:\BAW CODE\build-a-wig"

Write-Host "Creating backup folder: $backupFolder" -ForegroundColor Green
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# Create directory structure
$directories = @(
    "$backupFolder\src\pages",
    "$backupFolder\src\pages\admin\components",
    "$backupFolder\src\components",
    "$backupFolder\src\components\base",
    "$backupFolder\src\types",
    "$backupFolder\src\utils",
    "$backupFolder\config"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Host "Copying all page routes..." -ForegroundColor Yellow
# Copy all page.tsx files
Get-ChildItem -Path "$sourceFolder\src\pages" -Filter "page.tsx" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace($sourceFolder, "").TrimStart('\')
    $destPath = Join-Path $backupFolder $relativePath
    $destDir = Split-Path $destPath -Parent
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Copy-Item $_.FullName -Destination $destPath -Force
    Write-Host "  Copied: $relativePath" -ForegroundColor Cyan
}

Write-Host "Copying all components..." -ForegroundColor Yellow
# Copy all component files
Get-ChildItem -Path "$sourceFolder\src\components" -Filter "*.tsx" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace($sourceFolder, "").TrimStart('\')
    $destPath = Join-Path $backupFolder $relativePath
    $destDir = Split-Path $destPath -Parent
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Copy-Item $_.FullName -Destination $destPath -Force
    Write-Host "  Copied: $relativePath" -ForegroundColor Cyan
}

# Copy admin components
if (Test-Path "$sourceFolder\src\pages\admin\components") {
    Get-ChildItem -Path "$sourceFolder\src\pages\admin\components" -Filter "*.tsx" -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Replace($sourceFolder, "").TrimStart('\')
        $destPath = Join-Path $backupFolder $relativePath
        $destDir = Split-Path $destPath -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item $_.FullName -Destination $destPath -Force
        Write-Host "  Copied: $relativePath" -ForegroundColor Cyan
    }
}

Write-Host "Copying type definitions and utilities..." -ForegroundColor Yellow
# Copy type definitions
if (Test-Path "$sourceFolder\src\types") {
    Get-ChildItem -Path "$sourceFolder\src\types" -Filter "*.ts" -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Replace($sourceFolder, "").TrimStart('\')
        $destPath = Join-Path $backupFolder $relativePath
        $destDir = Split-Path $destPath -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item $_.FullName -Destination $destPath -Force
        Write-Host "  Copied: $relativePath" -ForegroundColor Cyan
    }
}

# Copy utility files
if (Test-Path "$sourceFolder\src\utils") {
    Get-ChildItem -Path "$sourceFolder\src\utils" -Filter "*.ts" -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Replace($sourceFolder, "").TrimStart('\')
        $destPath = Join-Path $backupFolder $relativePath
        $destDir = Split-Path $destPath -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item $_.FullName -Destination $destPath -Force
        Write-Host "  Copied: $relativePath" -ForegroundColor Cyan
    }
}

Write-Host "Copying configuration files..." -ForegroundColor Yellow
# Copy critical configuration files
$configFiles = @(
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "vite.config.js",
    "vite.config.d.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tailwind.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "vercel.json",
    "index.html",
    ".gitignore",
    "README.md"
)

foreach ($file in $configFiles) {
    $sourcePath = Join-Path $sourceFolder $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination "$backupFolder\config\$file" -Force
        Write-Host "  Copied: $file" -ForegroundColor Cyan
    } else {
        Write-Host "  WARNING: $file not found!" -ForegroundColor Yellow
    }
}

# Copy App.tsx, main.tsx, and index.css if they exist
Write-Host "Copying main application files..." -ForegroundColor Yellow
if (Test-Path "$sourceFolder\src\App.tsx") {
    Copy-Item "$sourceFolder\src\App.tsx" -Destination "$backupFolder\src\App.tsx" -Force
    Write-Host "  Copied: src\App.tsx" -ForegroundColor Cyan
} else {
    Write-Host "  WARNING: src\App.tsx not found!" -ForegroundColor Red
}

if (Test-Path "$sourceFolder\src\main.tsx") {
    Copy-Item "$sourceFolder\src\main.tsx" -Destination "$backupFolder\src\main.tsx" -Force
    Write-Host "  Copied: src\main.tsx" -ForegroundColor Cyan
} else {
    Write-Host "  WARNING: src\main.tsx not found!" -ForegroundColor Red
}

if (Test-Path "$sourceFolder\src\index.css") {
    Copy-Item "$sourceFolder\src\index.css" -Destination "$backupFolder\src\index.css" -Force
    Write-Host "  Copied: src\index.css" -ForegroundColor Cyan
} else {
    Write-Host "  WARNING: src\index.css not found!" -ForegroundColor Red
}

# Copy public assets directory
Write-Host "Copying public assets..." -ForegroundColor Yellow
if (Test-Path "$sourceFolder\public") {
    Copy-Item "$sourceFolder\public" -Destination "$backupFolder\public" -Recurse -Force
    Write-Host "  Copied: public/" -ForegroundColor Cyan
}

# Copy scripts directory if it exists
Write-Host "Copying scripts..." -ForegroundColor Yellow
if (Test-Path "$sourceFolder\scripts") {
    Copy-Item "$sourceFolder\scripts" -Destination "$backupFolder\scripts" -Recurse -Force
    Write-Host "  Copied: scripts/" -ForegroundColor Cyan
}

# Verify all pages are backed up
Write-Host "`nVerifying backup completeness..." -ForegroundColor Yellow
$sourcePages = Get-ChildItem -Path "$sourceFolder\src\pages" -Filter "page.tsx" -Recurse
$backedUpPages = Get-ChildItem -Path "$backupFolder\src\pages" -Filter "page.tsx" -Recurse -ErrorAction SilentlyContinue

Write-Host "  Source pages: $($sourcePages.Count)" -ForegroundColor White
Write-Host "  Backed up pages: $($backedUpPages.Count)" -ForegroundColor White

if ($sourcePages.Count -ne $backedUpPages.Count) {
    Write-Host "  WARNING: Page count mismatch!" -ForegroundColor Red
    $missing = @()
    foreach ($page in $sourcePages) {
        $relPath = $page.FullName.Replace($sourceFolder, "").TrimStart('\')
        $backupPath = Join-Path $backupFolder $relPath
        if (-not (Test-Path $backupPath)) {
            $missing += $relPath
        }
    }
    if ($missing.Count -gt 0) {
        Write-Host "  Missing pages:" -ForegroundColor Red
        $missing | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    }
} else {
    Write-Host "  ✓ All pages verified!" -ForegroundColor Green
}

# Create detailed inventory
$inventory = @{
    timestamp = $timestamp
    backupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    sourceDirectory = $sourceFolder
    backupLocation = $backupFolder
    pages = @()
    components = @()
    utils = @()
    types = @()
}

foreach ($page in $sourcePages) {
    $inventory.pages += @{
        path = $page.FullName.Replace($sourceFolder, "").TrimStart('\')
        name = $page.Name
        size = $page.Length
        lastModified = $page.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
}

$components = Get-ChildItem -Path "$sourceFolder\src\components" -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue
foreach ($comp in $components) {
    $inventory.components += @{
        path = $comp.FullName.Replace($sourceFolder, "").TrimStart('\')
        name = $comp.Name
    }
}

$utils = Get-ChildItem -Path "$sourceFolder\src\utils" -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue
foreach ($util in $utils) {
    $inventory.utils += @{
        path = $util.FullName.Replace($sourceFolder, "").TrimStart('\')
        name = $util.Name
    }
}

$types = Get-ChildItem -Path "$sourceFolder\src\types" -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue
foreach ($type in $types) {
    $inventory.types += @{
        path = $type.FullName.Replace($sourceFolder, "").TrimStart('\')
        name = $type.Name
    }
}

$inventory.totalPages = $inventory.pages.Count
$inventory.totalComponents = $inventory.components.Count
$inventory.totalUtils = $inventory.utils.Count
$inventory.totalTypes = $inventory.types.Count

$inventoryPath = Join-Path $backupFolder "BACKUP_INVENTORY.json"
$inventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $inventoryPath -Encoding UTF8
Write-Host "  Created: BACKUP_INVENTORY.json" -ForegroundColor Cyan

# Create a README with backup information
$readmeContent = @"
CANONICAL BACKUP
================
Created: $timestamp
Source: $sourceFolder

This backup contains:
- All page routes (src/pages/**/page.tsx) - $($inventory.totalPages) pages
- All components (src/components/**/*.tsx) - $($inventory.totalComponents) components
- Type definitions (src/types/**/*.ts) - $($inventory.totalTypes) files
- Utility files (src/utils/**/*.ts) - $($inventory.totalUtils) files
- Configuration files (package.json, vite.config.*, tsconfig files, tailwind.config.*, vercel.json, postcss.config.js, index.html)
- Main application files (App.tsx, main.tsx, index.css)
- Public assets (public/)
- Scripts (scripts/) if present

To restore:
1. Copy the contents of src/pages/ back to build-a-wig/src/pages/
2. Copy the contents of src/components/ back to build-a-wig/src/components/
3. Copy src/types/ and src/utils/ back to build-a-wig/src/
4. Copy config files back to build-a-wig root
5. Copy App.tsx, main.tsx, and index.css back to build-a-wig/src/
6. Copy public/ back to build-a-wig/public/

Total files backed up: $((Get-ChildItem -Path $backupFolder -Recurse -File).Count)
"@

$readmeContent | Out-File -FilePath "$backupFolder\README.txt" -Encoding UTF8

Write-Host "`n" + "="*70 -ForegroundColor Cyan
Write-Host "BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "="*70 -ForegroundColor Cyan
Write-Host "Backup location: $backupFolder" -ForegroundColor White
Write-Host "Total pages: $($inventory.totalPages)" -ForegroundColor White
Write-Host "Total components: $($inventory.totalComponents)" -ForegroundColor White
Write-Host "Total utils: $($inventory.totalUtils)" -ForegroundColor White
Write-Host "Total types: $($inventory.totalTypes)" -ForegroundColor White
Write-Host "Total files: $((Get-ChildItem -Path $backupFolder -Recurse -File).Count)" -ForegroundColor White
Write-Host "`n✓ Backup is ready for full recovery!" -ForegroundColor Green

