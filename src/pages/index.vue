<template lang="pug">
//- div.fit(:style='{background: `url(${backgroundUrl}) no-repeat center center fixed`}')
div.fit(style="overflow: hidden;position: absolute;top: 0;bottom: 0;")
  video(
    v-for="video in videos"
    v-show="selectedVideo === video.name"
    :id="'video-' + video.name" muted playsinline
    :src='baseVideoUrl + video.name'
    ref="video"
    :style='{position: "absolute", objectFit: "none"}'
    style="z-index: -1;overflow: hidden;min-width: 100%;min-height: 100%;width: auto;height: auto;"
  )
  q-splitter.full-height.gradient(v-model='splitter' :horizontal='!launcher.config.menu.vertical' disable)
    template(v-slot:before)
      div.flex.fit(:style='{flexFlow: menuFlow}')
        div.fit.flex.items-center.overflow-hidden
          q-tabs.full-width.q-my-md.overflow-hidden(
            v-model='tab'
            :vertical='launcher.config.menu.vertical'
            :style='{height: "initial", maxHeight: "60vh"}'
            outside-arrows
          )
            q-tab(
              v-for='modpack in modpacks' :key='modpack.id'
              :label='modpack.name' :name='modpack.name' icon='mdi-package-variant-closed'
            )
        q-separator.q-my-sm.q-mx-md
        account-avatar

    template(v-slot:after)
      div.flex.fit(:style='{flexFlow: "column"}')
        q-tab-panels.fit.transparent(v-model='tab' transition-prev="jump-up" transition-next="jump-up" animated swipeable)
          q-tab-panel.fit.q-pa-none.overflow-hidden(v-for='modpack in modpacks' :key='modpack.id' :name='modpack.name')
            modpack-display(:modpack='modpack')
        q-bar
          q-space
          small(v-text="'v' + packageVersion")
  settings-dialog
</template>

<script lang="ts">
import { reactive, ref } from 'vue'
import type { Launcher } from '~~/types/launcher.type'
import type { Modpack } from '~~/types/modpack.type'

export default defineNuxtComponent({
  inject: ['global-launcher', 'global-modpacks'],
  data: () => ({
    videoPlayer: ref<HTMLVideoElement | null>(null),
    selectedVideo: '',
    settingsDialog: reactive({
      data: false,
    }),
    settingsTab: reactive({
      data: 'launcher',
    }),
  }),
  computed: {
    launcher(): Launcher {
      return this['global-launcher'] as Launcher
    },
    modpacks(): Modpack[] {
      return this['global-modpacks'] as Modpack[]
    },
    menuFlow(): string {
      let flow = this.launcher.config.menu.vertical ? 'column' : 'row'
      if (this.launcher.config.menu.reverse) flow += '-reverse'
      return flow
    },
    defaultModpack(): Modpack {
      return this.modpacks.find((modpack) => modpack.default) as Modpack
    },
  },
  setup() {
    const tab = ref('')
    const videos = [
      {
        name: '/videos/Bateau_pirate.mp4',
      },
      {
        name: '/videos/Bibliotheque.mp4',
      },
      {
        name: '/videos/Champs.mp4',
      },
      {
        name: '/videos/Chateau.mp4',
      },
      {
        name: '/videos/Coatlicue.mp4',
      },
      {
        name: '/videos/Collisee.mp4',
      },
      {
        name: '/videos/Cuisine.mp4',
      },
      {
        name: '/videos/Demonis.mp4',
      },
      {
        name: '/videos/Ecole.mp4',
      },
      {
        name: '/videos/Ecole_1.mp4',
      },
      {
        name: '/videos/Ferme.mp4',
      },
      {
        name: '/videos/Forteresse_2.mp4',
      },
      {
        name: '/videos/Forteresse_3.mp4',
      },
      {
        name: '/videos/Fraktalis_plan_large.mp4',
      },
      {
        name: '/videos/Fraktalis_plan_large_2.mp4',
      },
      {
        name: '/videos/Frelheim.mp4',
      },
      {
        name: '/videos/Marche.mp4',
      },
      {
        name: '/videos/Oui_Heberg.mp4',
      },
      {
        name: '/videos/Paradis.mp4',
      },
      {
        name: '/videos/Place.mp4',
      },
      {
        name: '/videos/Plan_Sekeris.mp4',
      },
      {
        name: '/videos/Plan_Sekeris_2.mp4',
      },
      {
        name: '/videos/Pub.mp4',
      },
      {
        name: '/videos/Pyramid.mp4',
      },
      {
        name: '/videos/Restaurant.mp4',
      },
      {
        name: '/videos/Temple_3.mp4',
      },
      {
        name: '/videos/Tour_ensorceleur.mp4',
      },
      {
        name: '/videos/Viridiana.mp4',
      },
      {
        name: '/videos/Viridiana_plan_large.mp4',
      },
    ]
    const runtimeConfig = useRuntimeConfig()
    const splitter = ref(25)

    return {
      tab,
      videos,
      splitter,
      packageVersion: runtimeConfig.app.packageVersion,
      baseVideoUrl: 'https://github.com/tacxtv/miratopia-launcher/raw/config/launcher',
    }
  },
  methods: {
    onVideoEnded(e: any) {
      const nextVideo = this.videos[Math.floor(Math.random() * this.videos.length)]
      this.videoPlayer?.removeEventListener('ended', this.onVideoEnded, false)
      this.videoPlayer = document.getElementById('video-' + nextVideo.name) as HTMLVideoElement
      this.videoPlayer.addEventListener('ended', this.onVideoEnded, false)
      this.selectedVideo = nextVideo.name
      this.videoPlayer.playbackRate = 0.9
      this.videoPlayer.play()
    },
  },
  provide() {
    return {
      'settings-dialog': ref(this.settingsDialog),
      'settings-tab': ref(this.settingsTab),
    }
  },
  created() {
    this.selectedVideo = this.videos[Math.floor(Math.random() * this.videos.length)].name
    this.tab = this.defaultModpack.name
  },
  mounted() {
    this.videoPlayer = document.getElementById('video-' + this.selectedVideo) as HTMLVideoElement
    this.videoPlayer.addEventListener('ended', this.onVideoEnded, false)
    this.videoPlayer.playbackRate = 0.9
    this.videoPlayer.play()
  },
})
</script>
