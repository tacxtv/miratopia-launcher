import { BrowserWindow } from 'electron'
import log from 'electron-log/main'
import os from 'os'
import path from 'path'

let loginWindow: BrowserWindow | null = null

export function getLoginWindow(): BrowserWindow | null {
  return loginWindow
}

export function destroyLoginWindow(): void {
  if (!loginWindow) return
  log.info('LoginWindow destroyed !')
  loginWindow.close()
  loginWindow = null
}

export async function createLoginWindow(): Promise<void> {
  destroyLoginWindow()
  loginWindow = new BrowserWindow({
    icon: path.join(__dirname, '/../public/logo.png'),
    width: 616,
    height: 840,
    resizable: false,
    show: false,
    title: 'Login',
    transparent: os.platform() === 'win32',
    frame: os.platform() !== 'win32',
    titleBarStyle: os.platform() === 'win32' ? 'hidden' : 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  loginWindow.setMenuBarVisibility(false)
  if (process.env.VITE_DEV_SERVER_URL) {
    loginWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#login`)
    loginWindow.webContents.openDevTools()
  } else {
    loginWindow.loadFile(path.join(__dirname, '../.output/public/index.html'), { hash: 'login' })
  }
  loginWindow.once('ready-to-show', () => {
    if (loginWindow) {
      loginWindow.show()
    }
  })
  log.info('LoginWindow created !')
}

export function sendLoginWindowWebContent(channel: string, args: any): void {
  if (!loginWindow) return
  return loginWindow.webContents.send(channel, args)
}
