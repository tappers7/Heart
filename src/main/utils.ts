import { app, BrowserWindow } from 'electron'

export const is = {
  get dev() {
    return !app.isPackaged
  }
}

export const electronApp = {
  setAppUserModelId(id: string) {
    if (process.platform === 'win32') {
      app.setAppUserModelId(id)
    }
  }
}

export const optimizer = {
  watchWindowShortcuts(_window: BrowserWindow) {
    // reserved for future shortcut handling
  }
}
