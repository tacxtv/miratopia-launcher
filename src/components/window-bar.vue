<template lang="pug">
q-bar#window-bar
  q-space
  q-btn(@click="electronWindowMinimize" icon='mdi-window-minimize' dense flat)
  q-btn(v-if="resizable" @click="maximizeOrUnmaximize" :icon="isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize'" dense flat)
  q-btn(@click="electronWindowClose" icon='mdi-window-close' dense flat)
</template>

<script lang="ts">
export default defineNuxtComponent({
  props: {
    resizable: {
      type: Boolean,
      default: true,
    }
  },
  data: () => ({
    isMaximized: false,
  }),
  methods: {
    async maximizeOrUnmaximize(): Promise<void> {
      this.isMaximized ? this.electronWindowUnmaximize() : this.electronWindowMaximize()
      this.isMaximized = !this.isMaximized
    },
    electronWindowClose(): void {
      window.electron?.closeWindow()
    },
    electronWindowMinimize(): void {
      window.electron?.minimizeWindow()
    },
    electronWindowMaximize(): void {
      window.electron?.maximizeWindow()
    },
    electronWindowUnmaximize(): void {
      window.electron?.unmaximizeWindow()
    },
  },
  async created() {
    this.isMaximized = await window.electron?.getLauncherMaximizedAtStartup()
  },
})
</script>

<style lang="sass">
@import 'quasar/src/css/variables.sass'

#window-bar
  z-index: 999
  background: $dark
  height: 32px
  -webkit-app-region: drag

  .q-btn
    -webkit-app-region: no-drag
</style>
