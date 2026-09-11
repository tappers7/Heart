import { contextBridge, ipcRenderer } from 'electron'

export type HeartAPI = {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  getLocale: () => Promise<string>
  getTweakStates: () => Promise<unknown>
  applyTweak: (id: string) => Promise<{ ok: boolean; message: string }>
  revertTweak: (id: string) => Promise<{ ok: boolean; message: string }>
  runCleanup: () => Promise<unknown>
  confirm: (opts: { title: string; message: string }) => Promise<boolean>
}

const api: HeartAPI = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  getLocale: () => ipcRenderer.invoke('app:getLocale'),
  getTweakStates: () => ipcRenderer.invoke('tweaks:getStates'),
  applyTweak: (id) => ipcRenderer.invoke('tweaks:apply', id),
  revertTweak: (id) => ipcRenderer.invoke('tweaks:revert', id),
  runCleanup: () => ipcRenderer.invoke('cleaner:run'),
  confirm: (opts) => ipcRenderer.invoke('dialog:confirm', opts)
}

contextBridge.exposeInMainWorld('heart', api)
