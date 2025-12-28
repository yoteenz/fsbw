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
    "index.html"
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

# Create a README with backup information
$readmeContent = @"
CANONICAL BACKUP
================
Created: $timestamp
Source: $sourceFolder

This backup contains:
- All page routes (src/pages/**/page.tsx)
- All components (src/components/**/*.tsx and src/pages/admin/components/**/*.tsx)
- Type definitions (src/types/**/*.ts)
- Utility files (src/utils/**/*.ts)
- Configuration files (package.json, vite.config.*, tsconfig files, tailwind.config.*, vercel.json, postcss.config.js, index.html)
- Main application files (App.tsx, main.tsx, index.css)
- Entry point (index.html)

To restore:
1. Copy the contents of src/pages/ back to build-a-wig/src/pages/
2. Copy the contents of src/components/ back to build-a-wig/src/components/
3. Copy src/types/ and src/utils/ back to build-a-wig/src/
4. Copy config files back to build-a-wig root
5. Copy App.tsx, main.tsx, and index.css back to build-a-wig/src/

Total files backed up: $((Get-ChildItem -Path $backupFolder -Recurse -File).Count)
"@

$readmeContent | Out-File -FilePath "$backupFolder\README.txt" -Encoding UTF8

Write-Host "`nBackup completed successfully!" -ForegroundColor Green
Write-Host "Backup location: $backupFolder" -ForegroundColor Green
Write-Host "Total files: $((Get-ChildItem -Path $backupFolder -Recurse -File).Count)" -ForegroundColor Green

