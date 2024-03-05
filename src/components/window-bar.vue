<template lang="pug">
q-bar#window-bar
  q-space
  q-btn(@click="electronWindowMinimize" icon='mdi-window-minimize' dense flat)
  q-btn(@click="maximizeOrUnmaximize" :icon="isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize'" dense flat)
  q-btn(@click="electronWindowClose" icon='mdi-window-close' dense flat)
</template>

<script lang="ts" setup>
let isMaximized = ref<boolean>(await window.electron?.getLauncherMaximizedAtStartup())

async function maximizeOrUnmaximize(): Promise<void> {
  isMaximized.value ? electronWindowUnmaximize() : electronWindowMaximize()
  isMaximized.value = !isMaximized.value
}

function electronWindowClose(): void {
  window.electron?.closeWindow()
}

function electronWindowMinimize(): void {
  window.electron?.minimizeWindow()
}

function electronWindowMaximize(): void {
  window.electron?.maximizeWindow()
}

function electronWindowUnmaximize(): void {
  window.electron?.unmaximizeWindow()
}
</script>

<style lang="sass">
@import 'quasar/src/css/variables.sass'

#window-bar
  background: $dark
  height: 32px
  -webkit-app-region: drag

  .q-btn
    -webkit-app-region: no-drag
</style>
