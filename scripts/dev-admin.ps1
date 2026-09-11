# Heart — launch electron-vite elevated (UAC once).
# Main process also self-elevates; this script is for explicitly starting as admin.
$ErrorActionPreference = 'Stop'
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
Set-Location (Split-Path -Parent $PSScriptRoot)

# Stop existing Heart / electron-vite / npm run dev related to this project
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object {
    $_.CommandLine -and (
      $_.CommandLine -match [regex]::Escape((Get-Location).Path) -and (
        $_.CommandLine -match 'electron-vite|electron\.exe|npm run dev'
      )
    )
  } |
  ForEach-Object {
    try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
  }

$cmd = "Set-Location '$((Get-Location).Path)'; `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); npm run dev"
Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList @(
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-NoExit',
  '-Command', $cmd
)