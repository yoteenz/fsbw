# Free ports 3001 and 3002 (when "already in use")

If you see **Port 3001 is already in use** or **live-reload port 3002 failed: EADDRINUSE**, a previous dev server or another app is using those ports.

## Option 1 — Close the other terminal

If you started `npm run dev` or `.\start-dev.ps1` in another PowerShell/terminal window, close that window or press **Ctrl+C** there. Then start the dev server again in this window.

## Option 2 — Kill the process using the port (PowerShell)

Run from any folder (no need to cd to the project):

**Find what is using port 3001:**
```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object OwningProcess
```

**Kill the process (replace `PID` with the number from OwningProcess):**
```powershell
Stop-Process -Id PID -Force
```

**One-liner to kill whatever is on 3001 and 3002:**
```powershell
@(3001, 3002) | ForEach-Object {
  $p = Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
  if ($p) { Stop-Process -Id $p -Force; Write-Host "Killed process on port $_" }
}
```

Then run your dev command again:
```powershell
cd "D:\BAW CODE\build-a-wig"
$env:VITE_DEV_PROXY_TARGET="https://fsbw.vercel.app"; npm run dev
```
or
```powershell
.\start-dev.ps1
```
