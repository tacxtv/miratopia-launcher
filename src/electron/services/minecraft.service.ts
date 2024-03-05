import { app, ipcMain } from 'electron'
import log from 'electron-log/main'
// noinspection ES6PreferShortImport
import type { Modpack } from '../../../types/modpack.type'
import Store from 'electron-store'
import { join } from 'path'
import { Launch } from 'minecraft-java-core'
import { sendMainWindowWebContent } from '../windows/main.window'
import * as crypto from 'crypto'

const store = new Store()
const root = join(app.getAppPath(), 'instances')

export class MinecraftService {
  public static name = 'MinecraftService'

  public async registerEvents(): Promise<void> {
    ipcMain.handle('launchMinecraft', async (_, modpack: Modpack) => {
      console.log('launchMinecraft')

      const loader = {} as any
      // noinspection LoopStatementThatDoesntLoopJS
      for (const l of modpack.loaders) {
        loader.type = l.type
        loader.build = l.version
        loader.enable = true
        break
      }

      const launch = new Launch()
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
            type: "Xbox",
            demo: false,
          },
        },
        // url: 'nodownload',
        javaPath: '',
        timeout: 10000,
        path: join(root, modpack.id),
        version: modpack.minecraft.version,
        detached: true,
        downloadFileMultiple: 100,
        loader,
        verify: false,
        ignored: ['loader', 'options.txt'],
        args: [],
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
        console.log(extract)
      })

      launch.on('progress', (progress: any, size: any, element: any) => {
        console.log(`Downloading ${element} ${Math.round((progress / size) * 100)}%`)
        sendMainWindowWebContent('windowLogEvent', { message: `Downloading ${element} ${Math.round((progress / size) * 100)}%`})
      })

      launch.on('check', (progress: any, size: any, element: any) => {
        console.log(`Checking ${element} ${Math.round((progress / size) * 100)}%`)
      })

      launch.on('estimated', (time: any) => {
        let hours = Math.floor(time / 3600)
        let minutes = Math.floor((time - hours * 3600) / 60)
        let seconds = Math.floor(time - hours * 3600 - minutes * 60)
        console.log(`${hours}h ${minutes}m ${seconds}s`)
      })

      launch.on('speed', (speed: any) => {
        console.log(`${(speed / 1067008).toFixed(2)} Mb/s`)
      })

      launch.on('patch', (patch: any) => {
        console.log(patch)
      });

      launch.on('data', (e: any) => {
        console.log('d', e)
      })

      launch.on('close', (code: any) => {
        console.log(code)
      });

      launch.on('error', (err: any) => {
        console.log(err)
      });
    })
  }
}
