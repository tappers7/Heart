import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export const TWEAK_IDS = [
  'disable-telemetry',
  'remove-bloatware',
  'classic-context-menu',
  'disable-bing-search',
  'security-only-updates',
  'services-manual',
  'ultimate-performance',
  'remove-edge',
  'tcp-nagle-off',
  'ram-standby-purge',
  'disable-core-parking',
  'disable-transparency',
  'disable-animations',
  'remove-gallery',
  'remove-home-quickaccess'
] as const

export type TweakId = (typeof TWEAK_IDS)[number]

export type TweakState = {
  id: TweakId
  applied: boolean
  detail?: string
  oneShot?: boolean
  highRisk?: boolean
  experimental?: boolean
}

/** Known consumer bloat — always offered when installed. */
const BLOATWARE_CANDIDATES = [
  'Microsoft.BingNews',
  'Microsoft.BingWeather',
  'Microsoft.BingSports',
  'Microsoft.BingFinance',
  'Microsoft.GetHelp',
  'Microsoft.Getstarted',
  'Microsoft.MicrosoftOfficeHub',
  'Microsoft.MicrosoftSolitaireCollection',
  'Microsoft.People',
  'Microsoft.WindowsFeedbackHub',
  'Microsoft.Xbox.TCUI',
  'Microsoft.XboxApp',
  'Microsoft.XboxGameOverlay',
  'Microsoft.XboxGamingOverlay',
  'Microsoft.XboxSpeechToTextOverlay',
  'Microsoft.YourPhone',
  'Microsoft.ZuneMusic',
  'Microsoft.ZuneVideo',
  'Microsoft.GamingApp',
  'Clipchamp.Clipchamp',
  'Microsoft.Todos',
  'Microsoft.PowerAutomateDesktop',
  'Microsoft.BingSearch',
  'Microsoft.Copilot',
  'MicrosoftCorporationII.QuickAssist',
  'MicrosoftTeams',
  'MSTeams',
  'Microsoft.SkypeApp',
  'Microsoft.MicrosoftStickyNotes',
  'Microsoft.OneConnect',
  'Microsoft.MixedReality.Portal',
  'Microsoft.WindowsMaps',
  'Microsoft.WindowsSoundRecorder',
  'Microsoft.WindowsAlarms',
  'Microsoft.Messaging',
  'Microsoft.Office.OneNote',
  'Microsoft.549981C3F5F10',
  'Microsoft.WindowsCommunicationsApps',
  'microsoft.windowscommunicationsapps',
  'Microsoft.OutlookForWindows',
  'Microsoft.LinkedInforWindows',
  'Microsoft.Microsoft3DViewer',
  'Microsoft.Print3D',
  'Microsoft.Wallet',
  'Microsoft.BingTranslator',
  'Microsoft.RemoteDesktop',
  'Microsoft.NetworkSpeedTest',
  'Microsoft.Office.Sway',
  'Microsoft.Whiteboard',
  'MicrosoftCorporationII.MicrosoftFamily',
  'Microsoft.Windows.DevHome',
  'Microsoft.CrossDevice',
  'MicrosoftWindows.CrossDevice',
  'Microsoft.StartExperiencesApp',
  'Disney.37853FC22B2CE',
  'SpotifyAB.SpotifyMusic',
  'Amazon.com.Amazon',
  'Facebook.Facebook',
  'Netflix.Netflix',
  'king.com.CandyCrushSaga',
  'king.com.CandyCrushSodaSaga',
  'king.com.BubbleWitch3Saga',
  'DolbyLaboratories.DolbyAccess',
  'BytedancePte.Ltd.TikTok',
  'AdobeSystemsIncorporated.AdobePhotoshopExpress'
] as const

/** Critical / framework packages — never listed or removable via Heart. */
const BLOATWARE_PROTECTED_PREFIXES = [
  'Microsoft.WindowsStore',
  'Microsoft.StorePurchaseApp',
  'Microsoft.DesktopAppInstaller',
  'Microsoft.WindowsCalculator',
  'Microsoft.Windows.Photos',
  'Microsoft.WindowsCamera',
  'Microsoft.WindowsNotepad',
  'Microsoft.Paint',
  'Microsoft.ScreenSketch',
  'Microsoft.WindowsTerminal',
  'Microsoft.XboxIdentityProvider',
  'Microsoft.UI.Xaml',
  'Microsoft.VCLibs',
  'Microsoft.NET',
  'Microsoft.WindowsAppRuntime',
  'Microsoft.WebView2',
  'Microsoft.Services.Store',
  'Microsoft.Advertising',
  'MicrosoftWindows.Client.CBS',
  'MicrosoftWindows.Client.Core',
  'Microsoft.LockApp',
  'Microsoft.AAD.BrokerPlugin',
  'Microsoft.AccountsControl',
  'Microsoft.BioEnrollment',
  'Microsoft.CredDialogHost',
  'Microsoft.ECApp',
  'Microsoft.Win32WebViewHost',
  'Microsoft.MicrosoftEdgeDevToolsClient',
  'Microsoft.Windows.ShellExperienceHost',
  'Microsoft.Windows.StartMenuExperienceHost',
  'Microsoft.Windows.Search',
  'Microsoft.Windows.CloudExperienceHost',
  'Microsoft.Windows.ContentDeliveryManager',
  'Microsoft.Windows.NarratorQuickStart',
  'Microsoft.Windows.PeopleExperienceHost',
  'Microsoft.Windows.PinningConfirmationDialog',
  'Microsoft.Windows.XGpuEjectDialog',
  'Microsoft.XboxGameCallableUI',
  'Microsoft.Windows.CapturePicker',
  'Microsoft.Windows.Apprep.ChxApp',
  'Microsoft.Windows.AssignedAccessLockApp',
  'Microsoft.Windows.CallingShellApp',
  'Microsoft.Windows.ParentalControls',
  'Microsoft.Windows.SecureAssessmentBrowser',
  'windows.immersivecontrolpanel',
  'Windows.ImmersiveControlPanel',
  'NcsiUwpApp',
  'Microsoft.SecHealthUI',
  'Microsoft.MicrosoftEdge',
  'Microsoft.ApplicationCompatibilityEnhancements'
] as const

function isProtectedPackage(name: string): boolean {
  const n = name || ''
  for (const p of BLOATWARE_PROTECTED_PREFIXES) {
    if (n === p || n.startsWith(p)) return true
  }
  if (/\.NET\.|VCLibs|UI\.Xaml|WindowsAppRuntime|WebView2|DirectX|LanguageExperience|InputApp|PPIProjection/i.test(n)) {
    return true
  }
  return false
}

export type BloatwareApp = {
  name: string
  displayName: string
  packageFullName: string
  installed: boolean
  selectedByDefault: boolean
  iconDataUrl?: string
}

/** Strip PowerShell CLIXML / encoding noise into a short user-facing message. */
export function cleanPsError(raw: string): string {
  if (!raw) return ''
  let t = raw
  if (t.includes('#< CLIXML') || t.includes('<Objs') || t.includes('<S S="Error">')) {
    const errors: string[] = []
    const re = /<S S="Error">([^<]*)<\/S>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(t)) !== null) {
      const line = m[1]
        .replace(/_x([0-9A-Fa-f]{4})_/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/\r/g, '')
        .trim()
      if (line) errors.push(line)
    }
    t = errors.join(' ').trim() || 'Operation failed'
  }
  t = t.replace(/\uFFFD/g, '').replace(/\s+/g, ' ').trim()
  if (/annul|cancel(led)? by the user|operation was cancelled|Operation was cancelled/i.test(t)) {
    return 'Operation cancelled. Administrator permission is required.'
  }
  if (/access.*(denied|refus)/i.test(t)) {
    return 'Access denied. Restart Heart as Administrator.'
  }
  if (t.length > 240) t = t.slice(0, 240) + '…'
  return t
}

/**
 * Run PowerShell hidden in-process. App must already be elevated at launch —
 * never use Start-Process -Verb RunAs (that pops UAC mid-tweak).
 */
async function runPs(script: string, _elevated = false): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  const encoded = Buffer.from(script, 'utf16le').toString('base64')
  try {
    const { stdout, stderr } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-EncodedCommand', encoded],
      { windowsHide: true, maxBuffer: 10 * 1024 * 1024, timeout: 120000 }
    )
    return { ok: true, stdout: stdout || '', stderr: cleanPsError(stderr || '') }
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string }
    const stderr = cleanPsError(err.stderr || err.message || String(e))
    return {
      ok: false,
      stdout: err.stdout || '',
      stderr: stderr || 'Command failed'
    }
  }
}

async function regGet(path: string, name: string): Promise<string | null> {
  const r = await runPs(`
try {
  $v = Get-ItemProperty -Path '${path}' -Name '${name}' -ErrorAction Stop
  Write-Output $v.'${name}'
} catch { Write-Output '__MISSING__' }
`)
  const val = (r.stdout || '').trim()
  if (!val || val === '__MISSING__') return null
  return val
}

async function regSet(path: string, name: string, value: string | number, type: 'DWord' | 'String' = 'DWord', elevated = true) {
  return runPs(`
New-Item -Path '${path}' -Force | Out-Null
Set-ItemProperty -Path '${path}' -Name '${name}' -Value ${type === 'String' ? `'${value}'` : value} -Type ${type} -Force
`, elevated)
}

// ---- State detectors ----

async function detectDisableTelemetry(): Promise<boolean> {
  const v = await regGet('HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection', 'AllowTelemetry')
  return v === '0'
}

async function detectClassicContextMenu(): Promise<boolean> {
  const r = await runPs(`
$p = 'HKCU:\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c741a7c5f8}\\InprocServer32'
if (Test-Path $p) { Write-Output '1' } else { Write-Output '0' }
`)
  return (r.stdout || '').trim() === '1'
}

async function detectBingSearch(): Promise<boolean> {
  const v = await regGet('HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer', 'DisableSearchBoxSuggestions')
  return v === '1'
}

async function detectSecurityOnlyUpdates(): Promise<boolean> {
  const v = await regGet(
    'HKLM:\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings',
    'DeferFeatureUpdatesPeriodInDays'
  )
  if (!v) return false
  const n = parseInt(v, 10)
  return !isNaN(n) && n >= 365
}

async function detectUltimatePerformance(): Promise<{ applied: boolean; detail?: string }> {
  const r = await runPs(`
$active = powercfg /getactivescheme
if ($active -match 'e9a42b02-d5df-448d-aa00-03f14749eb61') { Write-Output 'ACTIVE' }
elseif (powercfg /list | Select-String 'e9a42b02-d5df-448d-aa00-03f14749eb61') { Write-Output 'EXISTS' }
else { Write-Output 'NONE' }
`)
  const s = (r.stdout || '').trim()
  return { applied: s === 'ACTIVE', detail: s }
}

async function detectTcpNagle(): Promise<boolean> {
  const r = await runPs(`
$found = $false
Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces' -ErrorAction SilentlyContinue | ForEach-Object {
  $t = (Get-ItemProperty $_.PSPath -Name 'TcpAckFrequency' -ErrorAction SilentlyContinue).TcpAckFrequency
  $n = (Get-ItemProperty $_.PSPath -Name 'TCPNoDelay' -ErrorAction SilentlyContinue).TCPNoDelay
  if ($t -eq 1 -and $n -eq 1) { $found = $true }
}
if ($found) { '1' } else { '0' }
`)
  return (r.stdout || '').trim() === '1'
}

async function detectCoreParking(): Promise<boolean> {
  // Check powercfg ATTR for COREPARKINGMINCORES == 100
  const r = await runPs(`
try {
  $out = powercfg /query SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 2>$null
  if ($out -match 'Current AC Power Setting Index:\\s*0x00000064') { '1' } else { '0' }
} catch { '0' }
`)
  return (r.stdout || '').trim() === '1'
}

async function detectTransparency(): Promise<boolean> {
  const v = await regGet('HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', 'EnableTransparency')
  return v === '0'
}

async function detectAnimations(): Promise<boolean> {
  const v = await regGet('HKCU:\\Control Panel\\Desktop\\WindowMetrics', 'MinAnimate')
  return v === '0'
}

async function detectGallery(): Promise<boolean> {
  const r = await runPs(`
$p = 'HKCU:\\Software\\Classes\\CLSID\\{e88865ea-0e1c-4e20-9aa6-edaf3702f3dd}'
if (Test-Path $p) {
  $v = (Get-ItemProperty $p -Name 'System.IsPinnedToNameSpaceTree' -ErrorAction SilentlyContinue).'System.IsPinnedToNameSpaceTree'
  if ($v -eq 0) { '1' } else { '0' }
} else { '0' }
`)
  return (r.stdout || '').trim() === '1'
}

async function detectHomeQuickAccess(): Promise<boolean> {
  const v = await regGet(
    'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    'LaunchTo'
  )
  return v === '1'
}

async function detectServicesManual(): Promise<boolean> {
  // Check a couple of safe services typically set to Manual
  const r = await runPs(`
$names = @('DiagTrack','dmwappushservice','SysMain')
$manual = 0
foreach ($n in $names) {
  $s = Get-Service -Name $n -ErrorAction SilentlyContinue
  if ($s -and $s.StartType -eq 'Manual') { $manual++ }
}
if ($manual -ge 2) { '1' } else { '0' }
`)
  return (r.stdout || '').trim() === '1'
}

export async function getTweakStates(): Promise<TweakState[]> {
  const [
    telemetry,
    classic,
    bing,
    security,
    ultimate,
    nagle,
    parking,
    transparency,
    animations,
    gallery,
    home,
    services
  ] = await Promise.all([
    detectDisableTelemetry(),
    detectClassicContextMenu(),
    detectBingSearch(),
    detectSecurityOnlyUpdates(),
    detectUltimatePerformance(),
    detectTcpNagle(),
    detectCoreParking(),
    detectTransparency(),
    detectAnimations(),
    detectGallery(),
    detectHomeQuickAccess(),
    detectServicesManual()
  ])

  return [
    { id: 'disable-telemetry', applied: telemetry },
    { id: 'remove-bloatware', applied: false, oneShot: true },
    { id: 'classic-context-menu', applied: classic },
    { id: 'disable-bing-search', applied: bing },
    { id: 'security-only-updates', applied: security },
    { id: 'services-manual', applied: services },
    { id: 'ultimate-performance', applied: ultimate.applied, detail: ultimate.detail },
    {
      id: 'remove-edge',
      applied: false,
      oneShot: true,
      highRisk: true,
      experimental: true
    },
    { id: 'tcp-nagle-off', applied: nagle },
    { id: 'ram-standby-purge', applied: false, oneShot: true },
    { id: 'disable-core-parking', applied: parking },
    { id: 'disable-transparency', applied: transparency },
    { id: 'disable-animations', applied: animations },
    { id: 'remove-gallery', applied: gallery },
    { id: 'remove-home-quickaccess', applied: home }
  ]
}

// ---- Apply / Revert ----

async function applyDisableTelemetry() {
  return runPs(`
New-Item -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection' -Force | Out-Null
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection' -Name 'AllowTelemetry' -Value 0 -Type DWord -Force
New-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection' -Force | Out-Null
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection' -Name 'AllowTelemetry' -Value 0 -Type DWord -Force
# Disable DiagTrack if present
Stop-Service DiagTrack -Force -ErrorAction SilentlyContinue
Set-Service DiagTrack -StartupType Disabled -ErrorAction SilentlyContinue
Write-Output 'OK'
`, true)
}

async function revertDisableTelemetry() {
  return runPs(`
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection' -Name 'AllowTelemetry' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection' -Name 'AllowTelemetry' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-Service DiagTrack -StartupType Automatic -ErrorAction SilentlyContinue
Start-Service DiagTrack -ErrorAction SilentlyContinue
Write-Output 'OK'
`, true)
}

async function applyRemoveBloatware() {
  // Conservative default when applied without the UI picker
  const defaults = [
    'Microsoft.BingNews',
    'Microsoft.BingWeather',
    'Microsoft.GetHelp',
    'Microsoft.Getstarted',
    'Microsoft.MicrosoftSolitaireCollection',
    'Microsoft.People',
    'Microsoft.WindowsFeedbackHub',
    'Microsoft.YourPhone',
    'Microsoft.ZuneMusic',
    'Microsoft.ZuneVideo',
    'Clipchamp.Clipchamp',
    'Microsoft.Todos',
    'Microsoft.PowerAutomateDesktop',
    'Microsoft.BingSearch',
    'MicrosoftCorporationII.QuickAssist',
    'Microsoft.SkypeApp',
    'Microsoft.Microsoft3DViewer',
    'Microsoft.MixedReality.Portal'
  ]
  return removeBloatwareApps(defaults).then((r) => ({
    ok: r.ok,
    stdout: r.message,
    stderr: r.ok ? '' : r.message
  }))
}

export async function listBloatwareApps(): Promise<BloatwareApp[]> {
  const knownJson = JSON.stringify([...BLOATWARE_CANDIDATES])
  const protectedJson = JSON.stringify([...BLOATWARE_PROTECTED_PREFIXES])
  const r = await runPs(`
$ErrorActionPreference = 'SilentlyContinue'
$known = ConvertFrom-Json -InputObject '${knownJson.replace(/'/g, "''")}'
$protected = ConvertFrom-Json -InputObject '${protectedJson.replace(/'/g, "''")}'

function Test-Protected([string]$name) {
  foreach ($p in $protected) {
    if ($name -eq $p -or $name.StartsWith($p)) { return $true }
  }
  if ($name -match '\\.NET\\.|VCLibs|UI\\.Xaml|WindowsAppRuntime|WebView2|DirectX|LanguageExperience|InputApp|PPIProjection') { return $true }
  return $false
}

function Get-AppIconDataUrl([string]$installLocation) {
  if (-not $installLocation -or -not (Test-Path -LiteralPath $installLocation)) { return $null }
  $manifestPath = Join-Path $installLocation 'AppxManifest.xml'
  if (-not (Test-Path -LiteralPath $manifestPath)) { return $null }
  try {
    [xml]$xml = Get-Content -LiteralPath $manifestPath -Encoding UTF8
    $logoRel = $xml.Package.Properties.Logo
    if (-not $logoRel) { return $null }
    $logoRel = ($logoRel -replace '/', '\\')
    $basePath = [System.IO.Path]::Combine($installLocation, $logoRel)
    $dir = [System.IO.Path]::GetDirectoryName($basePath)
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($basePath)
    $ext = [System.IO.Path]::GetExtension($basePath)
    $candidates = New-Object System.Collections.Generic.List[string]
    if (Test-Path -LiteralPath $basePath) { [void]$candidates.Add($basePath) }
    if ($dir -and (Test-Path -LiteralPath $dir)) {
      Get-ChildItem -LiteralPath $dir -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -like ($stem + '*') -or
        $_.Name -like '*Square44x44Logo*' -or
        $_.Name -like '*Square150x150Logo*' -or
        $_.Name -like '*StoreLogo*' -or
        $_.Name -like '*AppList*'
      } | ForEach-Object { [void]$candidates.Add($_.FullName) }
    }
    $img = $candidates | Where-Object { $_ -match '\.(png|jpe?g|gif|webp)$' } | Select-Object -First 1
    if (-not $img) { $img = $candidates | Select-Object -First 1 }
    if (-not $img -or -not (Test-Path -LiteralPath $img)) { return $null }
    $bytes = [System.IO.File]::ReadAllBytes($img)
    if ($bytes.Length -lt 32 -or $bytes.Length -gt 250000) { return $null }
    $ext2 = [System.IO.Path]::GetExtension($img).ToLowerInvariant()
    $mime = switch ($ext2) {
      '.jpg' { 'image/jpeg' }
      '.jpeg' { 'image/jpeg' }
      '.gif' { 'image/gif' }
      '.webp' { 'image/webp' }
      default { 'image/png' }
    }
    return ('data:' + $mime + ';base64,' + [Convert]::ToBase64String($bytes))
  } catch { return $null }
}

function Get-AppDisplayName($pkg, [string]$installLocation) {
  try {
    if ($installLocation -and (Test-Path -LiteralPath $installLocation)) {
      $manifestPath = Join-Path $installLocation 'AppxManifest.xml'
      if (Test-Path -LiteralPath $manifestPath) {
        [xml]$xml = Get-Content -LiteralPath $manifestPath -Encoding UTF8
        $dn = $xml.Package.Properties.DisplayName
        if ($dn -and $dn -notmatch '^ms-resource:') { return [string]$dn }
      }
    }
  } catch {}
  if ($pkg.Name) { return [string]$pkg.Name }
  return 'Unknown'
}

$byName = @{}
$pkgs = @(Get-AppxPackage -ErrorAction SilentlyContinue | Where-Object {
  -not $_.IsFramework -and -not $_.NonRemovable -and $_.SignatureKind -ne 'System'
})
foreach ($p in $pkgs) {
  if (Test-Protected $p.Name) { continue }
  $icon = Get-AppIconDataUrl $p.InstallLocation
  $display = Get-AppDisplayName $p $p.InstallLocation
  $byName[$p.Name] = [pscustomobject]@{
    name = $p.Name
    displayName = $display
    packageFullName = $p.PackageFullName
    installed = $true
    iconDataUrl = $icon
  }
}

# Ensure known consumer bloat appears when installed (in case filters missed)
foreach ($n in $known) {
  if (Test-Protected $n) { continue }
  if ($byName.ContainsKey($n)) { continue }
  $found = @(Get-AppxPackage -Name $n -ErrorAction SilentlyContinue)
  foreach ($p in $found) {
    $icon = Get-AppIconDataUrl $p.InstallLocation
    $display = Get-AppDisplayName $p $p.InstallLocation
    $byName[$p.Name] = [pscustomobject]@{
      name = $p.Name
      displayName = $display
      packageFullName = $p.PackageFullName
      installed = $true
      iconDataUrl = $icon
    }
  }
}

$out = @($byName.Values | Sort-Object displayName, name)
$out | ConvertTo-Json -Compress -Depth 4
`)

  let parsed: {
    name: string
    displayName?: string
    packageFullName: string
    installed: boolean | string
    iconDataUrl?: string | null
  }[] = []
  try {
    const raw = (r.stdout || '').trim()
    if (raw) {
      const j = JSON.parse(raw)
      parsed = Array.isArray(j) ? j : [j]
    }
  } catch {
    parsed = []
  }

  const apps: BloatwareApp[] = []
  const seen = new Set<string>()
  for (const row of parsed) {
    if (!row?.name || seen.has(row.name) || isProtectedPackage(row.name)) continue
    seen.add(row.name)
    const installed = row.installed === true || row.installed === 'True' || row.installed === 'true'
    apps.push({
      name: row.name,
      displayName: (row.displayName && String(row.displayName).trim()) || row.name,
      packageFullName: row.packageFullName || '',
      installed,
      selectedByDefault: false,
      iconDataUrl: row.iconDataUrl || undefined
    })
  }
  apps.sort((a, b) => a.displayName.localeCompare(b.displayName) || a.name.localeCompare(b.name))
  return apps
}

export async function removeBloatwareApps(names: string[]): Promise<{ ok: boolean; message: string; removed: string[] }> {
  const safe = [...new Set(names.filter((n) => n && !isProtectedPackage(n)))]
  if (safe.length === 0) return { ok: true, message: 'No apps selected.', removed: [] }
  const list = safe.map((n) => "'" + n.replace(/'/g, "''") + "'").join(',')
  const r = await runPs(`
$apps = @(${list})
$removed = @()
foreach ($a in $apps) {
  $had = $false
  $pkgs = @(Get-AppxPackage -Name $a -ErrorAction SilentlyContinue)
  foreach ($p in $pkgs) {
    Remove-AppxPackage -Package $p.PackageFullName -ErrorAction SilentlyContinue
    $had = $true
  }
  Get-AppxPackage -Name $a -AllUsers -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-AppxPackage -Package $_.PackageFullName -AllUsers -ErrorAction SilentlyContinue
    $had = $true
  }
  Get-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -eq $a } | ForEach-Object {
    Remove-AppxProvisionedPackage -Online -PackageName $_.PackageName -ErrorAction SilentlyContinue | Out-Null
    $had = $true
  }
  if ($had) { $removed += $a }
}
Write-Output ("REMOVED:" + ($removed -join ','))
`)
  const stdout = (r.stdout || '').trim()
  const m = stdout.match(/REMOVED:(.*)$/m)
  const removed = m && m[1] ? m[1].split(',').filter(Boolean) : []
  if (!r.ok) return { ok: false, message: r.stderr || 'Uninstall failed', removed }
  return {
    ok: true,
    message: removed.length ? `Removed: ${removed.join(', ')}` : 'No matching packages found to remove.',
    removed
  }
}
async function applyClassicContextMenu() {
  return runPs(`
New-Item -Path 'HKCU:\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c741a7c5f8}\\InprocServer32' -Force | Out-Null
Set-ItemProperty -Path 'HKCU:\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c741a7c5f8}\\InprocServer32' -Name '(default)' -Value '' -Force
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Process explorer
Write-Output 'OK'
`)
}

async function revertClassicContextMenu() {
  return runPs(`
Remove-Item -Path 'HKCU:\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c741a7c5f8}' -Recurse -Force -ErrorAction SilentlyContinue
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Process explorer
Write-Output 'OK'
`)
}

async function applyBingSearch() {
  return runPs(`
New-Item -Path 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer' -Force | Out-Null
Set-ItemProperty -Path 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer' -Name 'DisableSearchBoxSuggestions' -Value 1 -Type DWord -Force
New-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search' -Force | Out-Null
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search' -Name 'BingSearchEnabled' -Value 0 -Type DWord -Force
Write-Output 'OK'
`)
}

async function revertBingSearch() {
  return runPs(`
Remove-ItemProperty -Path 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer' -Name 'DisableSearchBoxSuggestions' -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search' -Name 'BingSearchEnabled' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Write-Output 'OK'
`)
}

async function applySecurityOnlyUpdates() {
  return runPs(`
New-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings' -Force | Out-Null
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings' -Name 'DeferFeatureUpdatesPeriodInDays' -Value 365 -Type DWord -Force
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings' -Name 'DeferQualityUpdatesPeriodInDays' -Value 0 -Type DWord -Force
New-Item -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate' -Force | Out-Null
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate' -Name 'DeferFeatureUpdates' -Value 1 -Type DWord -Force
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate' -Name 'DeferFeatureUpdatesPeriodInDays' -Value 365 -Type DWord -Force
Write-Output 'OK'
`, true)
}

async function revertSecurityOnlyUpdates() {
  return runPs(`
Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings' -Name 'DeferFeatureUpdatesPeriodInDays' -Force -ErrorAction SilentlyContinue
Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate' -Name 'DeferFeatureUpdates' -Force -ErrorAction SilentlyContinue
Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate' -Name 'DeferFeatureUpdatesPeriodInDays' -Force -ErrorAction SilentlyContinue
Write-Output 'OK'
`, true)
}

async function applyServicesManual() {
  // Safe subset only — never touch critical services
  return runPs(`
$safe = @(
  @{ Name='DiagTrack'; Type='Manual' },
  @{ Name='dmwappushservice'; Type='Manual' },
  @{ Name='SysMain'; Type='Manual' },
  @{ Name='WSearch'; Type='Manual' },
  @{ Name='Fax'; Type='Manual' },
  @{ Name='RemoteRegistry'; Type='Disabled' },
  @{ Name='XblAuthManager'; Type='Manual' },
  @{ Name='XblGameSave'; Type='Manual' },
  @{ Name='XboxGipSvc'; Type='Manual' },
  @{ Name='XboxNetApiSvc'; Type='Manual' }
)
foreach ($s in $safe) {
  $svc = Get-Service -Name $s.Name -ErrorAction SilentlyContinue
  if ($svc) {
    Set-Service -Name $s.Name -StartupType $s.Type -ErrorAction SilentlyContinue
  }
}
Write-Output 'OK'
`, true)
}

async function revertServicesManual() {
  return runPs(`
$defaults = @(
  @{ Name='DiagTrack'; Type='Automatic' },
  @{ Name='dmwappushservice'; Type='Automatic' },
  @{ Name='SysMain'; Type='Automatic' },
  @{ Name='WSearch'; Type='Automatic' },
  @{ Name='Fax'; Type='Manual' },
  @{ Name='RemoteRegistry'; Type='Disabled' },
  @{ Name='XblAuthManager'; Type='Manual' },
  @{ Name='XblGameSave'; Type='Manual' },
  @{ Name='XboxGipSvc'; Type='Manual' },
  @{ Name='XboxNetApiSvc'; Type='Manual' }
)
foreach ($s in $defaults) {
  $svc = Get-Service -Name $s.Name -ErrorAction SilentlyContinue
  if ($svc) { Set-Service -Name $s.Name -StartupType $s.Type -ErrorAction SilentlyContinue }
}
Write-Output 'OK'
`, true)
}

async function applyUltimatePerformance() {
  return runPs(`
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 2>$null | Out-Null
powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61
Write-Output 'OK'
`, true)
}

async function revertUltimatePerformance() {
  return runPs(`
powercfg -setactive SCHEME_BALANCED
Write-Output 'OK'
`)
}

async function applyRemoveEdge() {
  // GUARDED / EXPERIMENTAL — does NOT force-uninstall system Edge.
  // Documents limitation: fully removing Edge can break WebView2 and Windows components.
  return runPs(`
Write-Output 'EXPERIMENTAL: Heart will not forcibly uninstall Microsoft Edge.'
Write-Output 'Reason: Edge/WebView2 is tightly integrated; removal often breaks apps and updates.'
Write-Output 'Safe alternative applied: disable Edge auto-launch / startup boost where possible.'
New-Item -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge' -Force | Out-Null
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge' -Name 'StartupBoostEnabled' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\MicrosoftEdge\\Main' -Name 'AllowPrelaunch' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Write-Output 'LIMITED_OK'
`, true)
}

async function applyTcpNagle() {
  return runPs(`
Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces' | ForEach-Object {
  Set-ItemProperty -Path $_.PSPath -Name 'TcpAckFrequency' -Value 1 -Type DWord -Force
  Set-ItemProperty -Path $_.PSPath -Name 'TCPNoDelay' -Value 1 -Type DWord -Force
}
Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters' -Name 'TcpAckFrequency' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters' -Name 'TCPNoDelay' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Write-Output 'OK'
`, true)
}

async function revertTcpNagle() {
  return runPs(`
Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces' | ForEach-Object {
  Remove-ItemProperty -Path $_.PSPath -Name 'TcpAckFrequency' -Force -ErrorAction SilentlyContinue
  Remove-ItemProperty -Path $_.PSPath -Name 'TCPNoDelay' -Force -ErrorAction SilentlyContinue
}
Write-Output 'OK'
`, true)
}

async function applyRamStandbyPurge() {
  // One-shot: EmptyStandbyList via documented approach using Clear-StandbyMemory if available,
  // otherwise invoke EmptyWorkingSet style best-effort + note.
  return runPs(`
# One-shot RAM standby purge (best-effort, documented)
# Prefer Sysinternals-style EmptyStandbyList if present; else clear file cache via API wrapper
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Mem {
  [DllImport("psapi.dll")]
  public static extern bool EmptyWorkingSet(IntPtr hProcess);
}
"@
Get-Process | ForEach-Object {
  try { [Mem]::EmptyWorkingSet($_.Handle) | Out-Null } catch {}
}
[System.GC]::Collect()
Write-Output 'Purged working sets (standby list full clear requires EmptyStandbyList.exe / admin RAMMap). Best-effort done.'
`, true)
}

async function applyCoreParking() {
  return runPs(`
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100
powercfg -setactive SCHEME_CURRENT
Write-Output 'OK'
`, true)
}

async function revertCoreParking() {
  return runPs(`
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 0
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 0
powercfg -setactive SCHEME_CURRENT
Write-Output 'OK'
`)
}

async function applyTransparency() {
  return runPs(`
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'EnableTransparency' -Value 0 -Type DWord -Force
Write-Output 'OK'
`)
}

async function revertTransparency() {
  return runPs(`
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'EnableTransparency' -Value 1 -Type DWord -Force
Write-Output 'OK'
`)
}

async function applyAnimations() {
  return runPs(`
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop\\WindowMetrics' -Name 'MinAnimate' -Value '0' -Force
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name 'UserPreferencesMask' -Value ([byte[]](0x90,0x12,0x03,0x80,0x10,0x00,0x00,0x00)) -Type Binary -Force -ErrorAction SilentlyContinue
$path = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects'
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'TaskbarAnimations' -Value 0 -Type DWord -Force
Write-Output 'OK'
`)
}

async function revertAnimations() {
  return runPs(`
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop\\WindowMetrics' -Name 'MinAnimate' -Value '1' -Force
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'TaskbarAnimations' -Value 1 -Type DWord -Force
Write-Output 'OK'
`)
}

async function applyRemoveGallery() {
  return runPs(`
New-Item -Path 'HKCU:\\Software\\Classes\\CLSID\\{e88865ea-0e1c-4e20-9aa6-edaf3702f3dd}' -Force | Out-Null
Set-ItemProperty -Path 'HKCU:\\Software\\Classes\\CLSID\\{e88865ea-0e1c-4e20-9aa6-edaf3702f3dd}' -Name 'System.IsPinnedToNameSpaceTree' -Value 0 -Type DWord -Force
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Process explorer
Write-Output 'OK'
`)
}

async function revertRemoveGallery() {
  return runPs(`
Remove-ItemProperty -Path 'HKCU:\\Software\\Classes\\CLSID\\{e88865ea-0e1c-4e20-9aa6-edaf3702f3dd}' -Name 'System.IsPinnedToNameSpaceTree' -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'HKCU:\\Software\\Classes\\CLSID\\{e88865ea-0e1c-4e20-9aa6-edaf3702f3dd}' -Recurse -Force -ErrorAction SilentlyContinue
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Process explorer
Write-Output 'OK'
`)
}

async function applyHomeQuickAccess() {
  return runPs(`
# LaunchTo = 1 → This PC
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'LaunchTo' -Value 1 -Type DWord -Force
# Hide recent/frequent in Quick Access
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer' -Name 'ShowRecent' -Value 0 -Type DWord -Force
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer' -Name 'ShowFrequent' -Value 0 -Type DWord -Force
Write-Output 'OK'
`)
}

async function revertHomeQuickAccess() {
  return runPs(`
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'LaunchTo' -Value 2 -Type DWord -Force
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer' -Name 'ShowRecent' -Value 1 -Type DWord -Force
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer' -Name 'ShowFrequent' -Value 1 -Type DWord -Force
Write-Output 'OK'
`)
}

export async function applyTweak(id: string): Promise<{ ok: boolean; message: string }> {
  try {
    let r: { ok: boolean; stdout: string; stderr: string }
    switch (id as TweakId) {
      case 'disable-telemetry': r = await applyDisableTelemetry(); break
      case 'remove-bloatware': r = await applyRemoveBloatware(); break
      case 'classic-context-menu': r = await applyClassicContextMenu(); break
      case 'disable-bing-search': r = await applyBingSearch(); break
      case 'security-only-updates': r = await applySecurityOnlyUpdates(); break
      case 'services-manual': r = await applyServicesManual(); break
      case 'ultimate-performance': r = await applyUltimatePerformance(); break
      case 'remove-edge': r = await applyRemoveEdge(); break
      case 'tcp-nagle-off': r = await applyTcpNagle(); break
      case 'ram-standby-purge': r = await applyRamStandbyPurge(); break
      case 'disable-core-parking': r = await applyCoreParking(); break
      case 'disable-transparency': r = await applyTransparency(); break
      case 'disable-animations': r = await applyAnimations(); break
      case 'remove-gallery': r = await applyRemoveGallery(); break
      case 'remove-home-quickaccess': r = await applyHomeQuickAccess(); break
      default: return { ok: false, message: 'Unknown tweak' }
    }
    let msg = (r.stdout || '').trim()
    if (!r.ok || (!msg && r.stderr)) msg = r.stderr || msg || 'Failed'
    msg = cleanPsError(msg) || (r.ok ? 'OK' : 'Failed')
    return { ok: r.ok || /\bOK\b|LIMITED/i.test(msg), message: msg }
  } catch (e) {
    return { ok: false, message: String(e) }
  }
}

export async function revertTweak(id: string): Promise<{ ok: boolean; message: string }> {
  try {
    let r: { ok: boolean; stdout: string; stderr: string }
    switch (id as TweakId) {
      case 'disable-telemetry': r = await revertDisableTelemetry(); break
      case 'remove-bloatware': return { ok: true, message: 'Bloatware removal is one-shot; reinstall apps from Store if needed.' }
      case 'classic-context-menu': r = await revertClassicContextMenu(); break
      case 'disable-bing-search': r = await revertBingSearch(); break
      case 'security-only-updates': r = await revertSecurityOnlyUpdates(); break
      case 'services-manual': r = await revertServicesManual(); break
      case 'ultimate-performance': r = await revertUltimatePerformance(); break
      case 'remove-edge': return { ok: true, message: 'Edge was never fully removed (guarded). Startup boost policy left as-is; clear manually if desired.' }
      case 'tcp-nagle-off': r = await revertTcpNagle(); break
      case 'ram-standby-purge': return { ok: true, message: 'One-shot purge; nothing to revert.' }
      case 'disable-core-parking': r = await revertCoreParking(); break
      case 'disable-transparency': r = await revertTransparency(); break
      case 'disable-animations': r = await revertAnimations(); break
      case 'remove-gallery': r = await revertRemoveGallery(); break
      case 'remove-home-quickaccess': r = await revertHomeQuickAccess(); break
      default: return { ok: false, message: 'Unknown tweak' }
    }
    let msg = (r.stdout || '').trim()
    if (!r.ok || (!msg && r.stderr)) msg = r.stderr || msg || 'Failed'
    msg = cleanPsError(msg) || (r.ok ? 'OK' : 'Failed')
    return { ok: r.ok || /\bOK\b/i.test(msg), message: msg }
  } catch (e) {
    return { ok: false, message: String(e) }
  }
}
