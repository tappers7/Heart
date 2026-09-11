import { contextBridge, ipcRenderer } from 'electron'

export type HeartAPI = {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  getLocale: () => Promise<string>
  isElevated: () => Promise<boolean>
  getTweakStates: () => Promise<unknown>
  applyTweak: (id: string) => Promise<{ ok: boolean; message: string }>
  revertTweak: (id: string) => Promise<{ ok: boolean; message: string }>
  listBloatware: () => Promise<
    {
      name: string
      displayName: string
      packageFullName: string
      installed: boolean
      selectedByDefault: boolean
      iconDataUrl?: string
    }[]
  >
  removeBloatware: (names: string[]) => Promise<{ ok: boolean; message: string; removed: string[] }>
  runCleanup: () => Promise<unknown>
}

const api: HeartAPI = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  getLocale: () => ipcRenderer.invoke('app:getLocale'),
  isElevated: () => ipcRenderer.invoke('app:isElevated'),
  getTweakStates: () => ipcRenderer.invoke('tweaks:getStates'),
  applyTweak: (id) => ipcRenderer.invoke('tweaks:apply', id),
  revertTweak: (id) => ipcRenderer.invoke('tweaks:revert', id),
  listBloatware: () => ipcRenderer.invoke('tweaks:listBloatware'),
  removeBloatware: (names) => ipcRenderer.invoke('tweaks:removeBloatware', names),
  runCleanup: () => ipcRenderer.invoke('cleaner:run')
}

contextBridge.exposeInMainWorld('heart', api)
