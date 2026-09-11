import { execFile } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const execFileAsync = promisify(execFile)

export type CleanupResult = {
  ok: boolean
  cleared: { path: string; files: number; bytes: number; error?: string }[]
  recycleBin: boolean
  cleanmgrStarted: boolean
  summary: string
}

function dirSizeAndClear(dir: string): { files: number; bytes: number; error?: string } {
  let files = 0
  let bytes = 0
  try {
    if (!fs.existsSync(dir)) return { files: 0, bytes: 0, error: 'not found' }
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      try {
        if (ent.isDirectory()) {
          const sub = dirSizeAndClear(full)
          files += sub.files
          bytes += sub.bytes
          try { fs.rmdirSync(full) } catch { /* in use */ }
        } else {
          const st = fs.statSync(full)
          bytes += st.size
          fs.unlinkSync(full)
          files++
        }
      } catch {
        // skip locked files
      }
    }
  } catch (e) {
    return { files, bytes, error: String(e) }
  }
  return { files, bytes }
}

async function emptyRecycleBin(): Promise<boolean> {
  try {
    const script = `
$shell = New-Object -ComObject Shell.Application
$rb = $shell.NameSpace(0xA)
if ($rb -ne $null) {
  $rb.Items() | ForEach-Object { Remove-Item $_.Path -Recurse -Force -ErrorAction SilentlyContinue }
}
Clear-RecycleBin -Force -ErrorAction SilentlyContinue
Write-Output 'OK'
`
    const encoded = Buffer.from(script, 'utf16le').toString('base64')
    await execFileAsync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], {
      windowsHide: true,
      timeout: 60000
    })
    return true
  } catch {
    return false
  }
}

export async function runCleanup(): Promise<CleanupResult> {
  const cleared: CleanupResult['cleared'] = []
  const userTemp = process.env.TEMP || process.env.TMP || path.join(os.homedir(), 'AppData', 'Local', 'Temp')
  const winTemp = path.join(process.env.SystemRoot || 'C:\\Windows', 'Temp')
  const prefetch = path.join(process.env.SystemRoot || 'C:\\Windows', 'Prefetch')

  // NEVER touch Documents
  for (const p of [userTemp, winTemp, prefetch]) {
    const result = dirSizeAndClear(p)
    cleared.push({ path: p, ...result })
  }

  let cleanmgrStarted = false
  try {
    // Launch cleanmgr silently (best-effort); don't wait forever
    execFile('cleanmgr.exe', ['/sagerun:1'], { windowsHide: true, detached: true })
    cleanmgrStarted = true
  } catch {
    try {
      execFile('cleanmgr.exe', [], { windowsHide: true, detached: true })
      cleanmgrStarted = true
    } catch {
      cleanmgrStarted = false
    }
  }

  const recycleBin = await emptyRecycleBin()
  const totalFiles = cleared.reduce((a, c) => a + c.files, 0)
  const totalBytes = cleared.reduce((a, c) => a + c.bytes, 0)
  const mb = (totalBytes / (1024 * 1024)).toFixed(2)

  return {
    ok: true,
    cleared,
    recycleBin,
    cleanmgrStarted,
    summary: `Cleared ~${totalFiles} files (${mb} MB). Recycle Bin: ${recycleBin ? 'emptied' : 'skipped'}. Disk Cleanup: ${cleanmgrStarted ? 'started' : 'unavailable'}.`
  }
}
