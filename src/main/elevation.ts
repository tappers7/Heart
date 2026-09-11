import { app } from 'electron'
import { execFileSync, spawn } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

const ENV_FLAG = '--heart-env-file='

/** Restore env vars written by a non-elevated relaunch (needed for electron-vite ELECTRON_RENDERER_URL). */
export function restoreElevatedEnv(): void {
  const arg = process.argv.find((a) => a.startsWith(ENV_FLAG))
  if (!arg) return
  const file = arg.slice(ENV_FLAG.length)
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string | undefined>
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'string') process.env[k] = v
    }
    fs.unlinkSync(file)
  } catch {
    /* ignore */
  }
  const idx = process.argv.indexOf(arg)
  if (idx >= 0) process.argv.splice(idx, 1)
}

export function isProcessElevated(): boolean {
  if (process.platform !== 'win32') return true
  try {
    execFileSync('fltmc', [], { stdio: 'ignore', windowsHide: true })
    return true
  } catch {
    try {
      execFileSync('net', ['session'], { stdio: 'ignore', windowsHide: true })
      return true
    } catch {
      return false
    }
  }
}

/** Relaunch the current Electron process with admin rights, then quit. */
export function relaunchAsAdminAndQuit(): void {
  if (process.platform !== 'win32') {
    app.quit()
    return
  }

  const envPayload: Record<string, string | undefined> = {
    ELECTRON_RENDERER_URL: process.env.ELECTRON_RENDERER_URL,
    NODE_ENV: process.env.NODE_ENV,
    VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL
  }
  const envFile = path.join(os.tmpdir(), 'heart-elevate-env-' + process.pid + '-' + Date.now() + '.json')
  fs.writeFileSync(envFile, JSON.stringify(envPayload), 'utf8')

  const exe = process.execPath
  const args = [...process.argv.slice(1).filter((a) => !a.startsWith(ENV_FLAG)), ENV_FLAG + envFile]

  const psExe = exe.replace(/'/g, "''")
  const psArgs = args.map((a) => "'" + String(a).replace(/'/g, "''") + "'").join(',')
  const ps = "Start-Process -FilePath '" + psExe + "' -ArgumentList @(" + psArgs + ") -Verb RunAs"

  spawn(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-Command', ps],
    { detached: true, stdio: 'ignore', windowsHide: true }
  ).unref()

  app.exit(0)
}
