<template lang="pug">
div.fit.flex(:style='{flexFlow: "column"}')
  div.fit.q-px-md.text-center.q-mt-lg(:style='{position: "relative"}')
    q-img.q-ma-sm(src="https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/launcher/logo.png" height="auto" width="20%")
    q-img.q-ma-sm.q-mt-xl(src="https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/launcher/title.png" height="auto" width="70%")
    q-img(:src="'https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/modpacks/' + modpack.id + '/icon.png'" height="auto" width="100px")

  .text-center.q-mb-md.q-px-md(v-html='modpack.description' :style='{minHeight: "125px", overflowY: "auto"}')
  q-toolbar.q-mb-lg
    q-space
    q-btn.q-mx-sm(icon='mdi-cog' flat dense @click='openSettings')

    q-btn(
      @click='launchMinecraft'
      :color='loading ? "negative" : "positive"'
      :loading='loading'
      :percentage='downloadProgress'
    )
      icon(name="line-md:play-filled" size="24")
      span.block.q-pl-sm Jouer !
    q-space
  q-expansion-item.q-pa-none(v-model='logsDisplay' label='Console' icon='mdi-console' dense)
    q-scroll-area.bg-blue-grey-10.q-pa-xs(ref="chatScroll" :style='{maxHeight: "100px", height: "100px"}')
      pre.flex.column.q-ma-none(:style='{textWrap: "pretty"}')
        span(v-for='(log, index) in logsItems' :key='index' v-text='log')
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { Modpack } from '~~/types/modpack.type'
import { QScrollArea } from 'quasar'

// @ts-ignore
export default defineNuxtComponent({
  props: {
    modpack: {
      type: Object as PropType<Modpack>,
      required: true,
    },
  },
  inject: ['global-launcher', 'settings-dialog', 'settings-tab'],
  data: () => ({
    loading: false,
    downloadProgress: 0,
    logsDisplay: false,
    logsItems: [] as string[],
  }),
  methods: {
    openSettings() {
      ;(this['settings-dialog'] as { data: boolean }).data = true
      ;(this['settings-tab'] as { data: string }).data = this.modpack.name
    },
    launchMinecraft() {
      this.logsDisplay = true
      //TODO: fix this
      window.electron.launchMinecraft(JSON.parse(JSON.stringify(this.modpack)))
    },
  },
  mounted() {
    // console.log('this.$refs?.logEvents?.$el', this.$refs?.logEvents)
    this.logsItems.push('Initialisation du launcher...')

    window.electron.onWindowLogEvent((payload: { message?: string }) => {
      if (this.logsItems.length >= 10) {
        this.logsItems.shift()
      }
      if (payload.message) this.logsItems.push(payload.message)
      this.$nextTick(() => {
        const target = (this.$refs.chatScroll as InstanceType<typeof QScrollArea>)?.getScrollTarget()
        if (!target) return
        ;(this.$refs.chatScroll as InstanceType<typeof QScrollArea>)?.setScrollPosition('vertical', target.scrollHeight, 0)
      })
    })
    window.electron.onMinecraftStartup(() => {
      this.loading = true
      console.log('onMinecraftStartup', arguments)
    })
    window.electron.onMinecraftClose(() => {
      this.loading = false
      console.log('onMinecraftClose', arguments)
    })
    // window.electron.onMinecraftDownloadProgress((download: { id: string; value: number }) => {
    //   this.downloadProgress = download.value
    //   console.log('onMinecraftDownloadProgress', arguments)
    // })
    // window.electron.onMinecraftDownloadFinish(() => {
    //   this.downloadProgress = 0
    //   this.loading = false
    //   console.log('onMinecraftDownloadFinish', arguments)
    // })
  },
})
</script>
