import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from './utils'
import {
  getTweakStates,
  applyTweak,
  revertTweak,
  TWEAK_IDS,
  listBloatwareApps,
  removeBloatwareApps
} from './tweaks'
import { runCleanup } from './cleaner'
import { isProcessElevated, relaunchAsAdminAndQuit, restoreElevatedEnv } from './elevation'

restoreElevatedEnv()

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 640,
    show: false,
    frame: false,
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'hidden',
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Elevate once at launch so tweaks never trigger mid-session UAC
  if (process.platform === 'win32' && !isProcessElevated()) {
    relaunchAsAdminAndQuit()
    return
  }

  electronApp.setAppUserModelId('com.heart.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => mainWindow?.close())
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)

  ipcMain.handle('app:getLocale', () => app.getLocale())
  ipcMain.handle('app:isElevated', () => isProcessElevated())

  ipcMain.handle('tweaks:list', () => TWEAK_IDS)
  ipcMain.handle('tweaks:getStates', async () => getTweakStates())
  ipcMain.handle('tweaks:apply', async (_e, id: string) => applyTweak(id))
  ipcMain.handle('tweaks:revert', async (_e, id: string) => revertTweak(id))
  ipcMain.handle('tweaks:listBloatware', async () => listBloatwareApps())
  ipcMain.handle('tweaks:removeBloatware', async (_e, names: string[]) => removeBloatwareApps(names))

  ipcMain.handle('cleaner:run', async () => runCleanup())

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
