import { contextBridge, ipcRenderer } from 'electron'
import type { Modpack, ModpackFile } from '~~/types/modpack.type'

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

      getAccessToken: () => void
      getAccounts: () => Promise<any[]>
      currentAccount: () => Promise<string>
      changeAccount: (accountName: string) => Promise<void>
      deleteAccount: (accountName: string) => Promise<void>

      getLauncherResolution: () => Promise<{ width: number; height: number; fullscreen: boolean }>
      setLauncherResolution: (payload: { width: number; height: number; fullscreen: boolean }) => void

      getLauncherStayInOpen(): boolean
      setLauncherStayInOpen(val: boolean): void
      reinstallModpack: (modpack: any) => void
      uninstallModpack: (modpack: any) => void
      openFolderModPack: (modpack: any) => void
      isModpackInstalled: (modpack: any) => Promise<boolean>
      getModpackMemory: (modpack: any) => Promise<{ min: number; max: number }>
      setModpackMemory: (modpack: any, payload: { min: number; max: number }) => void
      getModpackJavaPath: (modpack: any) => Promise<string>
      setModpackJavaPath: (modpack: any, val: string) => void
      getModpackOptionalFiles: (modpack: any) => Promise<ModpackFile[] & { enabled: boolean }[]>
      setModpackOptionalFiles: (modpack: any, files: ModpackFile[] & { enabled: boolean }[]) => void

      launchMinecraft: (modpack: Modpack) => void
      onWindowLogEvent: (func: (...args: any[]) => void) => void
      onMinecraftStartup: (func: (...args: any[]) => void) => void
      onMinecraftClose: (func: (...args: any[]) => void) => void
      onEstimatedTimeToDownload: (func: (...args: any[]) => void) => void
      onSpeedToDownload: (func: (...args: any[]) => void) => void
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

  getAccessToken: () => ipcRenderer.send('getAccessToken'),
  getAccounts: () => ipcRenderer.invoke('getAccounts'),
  currentAccount: () => ipcRenderer.invoke('currentAccount'),
  changeAccount: (accountName: string) => ipcRenderer.send('changeAccount', accountName),
  deleteAccount: (accountName: string) => ipcRenderer.send('deleteAccount', accountName),

  getLauncherResolution: () => ipcRenderer.invoke('getLauncherResolution'),
  setLauncherResolution: (modpack: any, payload: any) => ipcRenderer.send('setLauncherResolution', modpack, payload),

  getLauncherStayInOpen: () => ipcRenderer.invoke('getLauncherStayInOpen'),
  setLauncherStayInOpen: (stayInOpen: boolean) => ipcRenderer.send('setLauncherStayInOpen', stayInOpen),
  reinstallModpack: (modpack: any) => ipcRenderer.send('reinstallModpack', modpack),
  uninstallModpack: (modpack: any) => ipcRenderer.send('uninstallModpack', modpack),
  openFolderModPack: (modpack: any) => ipcRenderer.send('openFolderModPack', modpack),
  isModpackInstalled: (modpack: any) => ipcRenderer.invoke('isModpackInstalled', modpack),
  getModpackMemory: (modpack: any) => ipcRenderer.invoke('getModpackMemory', modpack),
  setModpackMemory: (modpack: any, payload: any) => ipcRenderer.send('setModpackMemory', modpack, payload),
  getModpackJavaPath: (modpack: any) => ipcRenderer.invoke('getModpackJavaPath', modpack),
  setModpackJavaPath: (modpack: any, val: any) => ipcRenderer.send('setModpackJavaPath', modpack, val),
  getModpackOptionalFiles: (modpack: any) => ipcRenderer.invoke('getModpackOptionalFiles', modpack),
  setModpackOptionalFiles: (modpack: any, files: any) => ipcRenderer.send('setModpackOptionalFiles', modpack, files),

  launchMinecraft: (modpack: Modpack) => ipcRenderer.invoke('launchMinecraft', modpack),
  onWindowLogEvent: (func: (...args: any[]) => void) => ipcRenderer.on('windowLogEvent', (_, ...args) => func(...args)),
  onMinecraftStartup: (func: (...args: any[]) => void) => ipcRenderer.on('minecraftStartup', (_, ...args) => func(...args)),
  onMinecraftClose: (func: (...args: any[]) => void) => ipcRenderer.on('minecraftClose', (_, ...args) => func(...args)),
  onEstimatedTimeToDownload: (func: (...args: any[]) => void) => ipcRenderer.on('estimatedTimeToDownload', (_, ...args) => func(...args)),
  onSpeedToDownload: (func: (...args: any[]) => void) => ipcRenderer.on('speedToDownload', (_, ...args) => func(...args)),
})

window.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Preload script loaded')
})
