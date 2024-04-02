import { app, ipcMain } from 'electron'
import log from 'electron-log/main'
// noinspection ES6PreferShortImport
import * as crypto from 'crypto'
import Store from 'electron-store'
import { Launch } from 'minecraft-java-core'
import { join } from 'path'
import { isNumber, throttle } from 'radash'
import type { Modpack, ModpackFile } from '../../../types/modpack.type'
import { sendMainWindowWebContent } from '../windows/main.window'
import { AuthService } from './auth.service'
import axios from 'axios'

const store = new Store()
const root = join(app.getPath('userData'), '/instances')

export class MinecraftService {
  public static name = 'MinecraftService'

  public async fetchGithubFiles(modpack: Modpack): Promise<ModpackFile[]> {
    const list = await fetch(`https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/modpacks/${modpack.id}/files.json`).then((res) =>
      res.json(),
    )
    return list
  }

  public async registerEvents(): Promise<void> {
    ipcMain.handle('launchMinecraft', async (_, modpack: Modpack) => {
      log.info('launchMinecraft', modpack.id)

      modpack = (await axios.get(`https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/modpacks/${modpack.id}/modpack.json`))
        .data as Modpack

      const launch = new Launch()
      const loader = {} as any
      for (const l of modpack.loaders) {
        loader.type = l.type
        loader.build = l.version
        loader.enable = true
        break
      }
      const optionalFiles = store.get(modpack.name + '_files', []) as (ModpackFile & { enabled: boolean })[]
      let files = modpack.files.filter((f) => !f.optional || optionalFiles.find((o) => o.path === f.path && o.enabled))
      const githubFiles = await this.fetchGithubFiles(modpack)
      files = files.concat(githubFiles)

      sendMainWindowWebContent('windowLogEvent', { message: `Authenticate Minecraft account...` })
      await AuthService.refreshCurrentAccessToken()
      sendMainWindowWebContent('windowLogEvent', { message: `Authentication successful !` })

      sendMainWindowWebContent('minecraftStartup', null)
      await launch.Launch({
        authenticator: {
          user_properties: '{}',
          access_token: (<any>global).share.auth.access_token,
          refresh_token: (<any>global).share.auth.refresh_token,
          client_token: crypto.randomBytes(16).toString('hex'),
          uuid: (<any>global).share.auth.uuid,
          name: (<any>global).share.auth.name,
          meta: {
            xuid: (<any>global).share.auth.xuid,
            access_token_expires_in: ((<any>global).share.auth.access_token_expires_in || 0) + Math.floor(Date.now() / 1000),
            type: 'Xbox',
            demo: false,
          },
        },
        url: 'nodownload',
        files,
        javaPath: '',
        timeout: 10000,
        path: join(root, modpack.id),
        version: modpack.minecraft.version,
        detached: true,
        downloadFileMultiple: 65,
        loader,
        verify: true,
        ignored: [
          'config',
          'loader',
          'local',
          'logs',
          'resources',
          'resourcepacks',
          'screenshots',
          'shaderpacks',
          'shaderpacks',
          'options.txt',
          'usercache.json',
          'usernamecache.json',
          // 'servers.dat',
          ...(modpack.ignoredFiles || []),
        ],
        //args: [],
        screen: {
          width: store.get('launcher_resolution_width', 854) as number,
          height: store.get('launcher_resolution_height', 480) as number,
          fullscreen: !!store.get('launcher_resolution_fullscreen', false),
        },
        memory: {
          max: store.get(modpack.name + '_maxMemory', modpack.minecraft.recommendedMemory || 2048) + 'M',
          min: store.get(modpack.name + '_minMemory', 1024) + 'M',
        },
        GAME_ARGS: [],
        JVM_ARGS: [],
        mcp: undefined,
      })

      launch.on('extract', (extract: any) => {
        console.log('extract', extract)
      })

      const throttleProgressEvent = (progress: number, size: number, element: string) => {
        const progressPercentage = Math.round(((progress || 0) / (size || 0)) * 100)
        const progressMsg = `Downloading ${element} ${progressPercentage}%`
        sendMainWindowWebContent('windowLogEvent', { message: progressMsg })
        log.info(progressMsg)
      }
      const throttledProgressEvent = throttle({ interval: 100 }, throttleProgressEvent)
      launch.on('progress', (progress: number, size: number, element: string) => {
        throttledProgressEvent(progress, size, element)
      })

      const throttleCheckEvent = (progress: number, size: number, element: string) => {
        console.log(progress, size, element)
        const progressPercentage = Math.round(((progress || 0) / (size || 0)) * 100)
        const progressMsg = `Checking ${element} ${isNumber(progressPercentage) ? progressPercentage : 0}%`
        sendMainWindowWebContent('windowLogEvent', { message: progressMsg })
        log.info(progressMsg)
      }
      const throttledCheckEvent = throttle({ interval: 100 }, throttleCheckEvent)
      launch.on('check', (progress: number, size: number, element: string) => {
        throttledCheckEvent(progress, size, element)
      })

      launch.on('estimated', (time: any) => {
        const estimatedMsg = `Estimated time: ${time ? Math.round(time) + ' seconds' : 'calculating...'}`
        sendMainWindowWebContent('estimatedTimeToDownload', { message: estimatedMsg })
        log.info(estimatedMsg)
      })

      launch.on('speed', (speed: any) => {
        const speedMsg = `Speed: ${(speed / 1067008).toFixed(2)} Mb/s`
        sendMainWindowWebContent('speedToDownload', { message: speedMsg })
        log.info(speedMsg)
      })

      launch.on('patch', (patch: any) => {
        console.log('patch', patch)
      })

      launch.on('data', (e: any) => {
        console.log('d', e)
      })

      launch.on('close', (code: any) => {
        console.log(code)
        sendMainWindowWebContent('minecraftClose', null)
      })

      launch.on('error', (err: any) => {
        console.log('error', err)
      })
    })
  }
}
