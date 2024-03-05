import { contextBridge, ipcRenderer } from "electron"

declare global {
  interface Window {
    electron: {
      getLauncherMaximizedAtStartup: () => Promise<boolean>
      setLauncherMaximizedAtStartup: (payload: boolean) => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      unmaximizeWindow: () => void
      closeWindow: () => void

      checkForUpdates: () => void
      quitAndInstallUpdate: () => void
    }
  }
}

contextBridge.exposeInMainWorld('electron', {
  getLauncherMaximizedAtStartup: () => ipcRenderer.invoke('getLauncherMaximizedAtStartup'),
  setLauncherMaximizedAtStartup: (payload: any) => ipcRenderer.send('setLauncherMaximizedAtStartup', payload),
  minimizeWindow: () => ipcRenderer.send('minimizeWindow'),
  maximizeWindow: () => ipcRenderer.send('maximizeWindow'),
  unmaximizeWindow: () => ipcRenderer.send('unmaximizeWindow'),
  closeWindow: () => ipcRenderer.send('closeWindow'),

  checkForUpdates: () => ipcRenderer.send('checkForUpdates'),
  quitAndInstallUpdate: () => ipcRenderer.send('quitAndInstallUpdate'),
})

window.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Preload script loaded')
})
