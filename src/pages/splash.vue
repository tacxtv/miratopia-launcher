<template lang='pug'>
div.fit.flex(:style='{flexFlow: "column", background: "url(" + launcher?.config?.pages?.login?.background + ") no-repeat center center fixed"}')
  div.items-center.fit.justify-center.flex.gradient
    q-inner-loading(showing)
      q-spinner-box(color='white' size='120px')
      h6.text-white.q-mt-md.q-mb-sm Tentative de mise à jour...
      small.text-white.q-mt-md.q-mb-sm Veuillez ne pas fermer le launcher !
  q-bar
    q-space
    small(v-text="'v' + packageVersion")
</template>

<script lang='ts'>
import type { Launcher } from '~~/types/launcher.type'

definePageMeta({
  layout: 'simple',
})

export default defineNuxtComponent({
  inject: ['global-launcher'],
  setup() {
    const runtimeConfig = useRuntimeConfig()

    return {
      packageVersion: runtimeConfig.app.packageVersion,
    }
  },
  computed: {
    launcher(): Launcher {
      return (this['global-launcher']) as Launcher
    },
  },
  methods: {
    getAccessToken() {
      window.electron?.getAccessToken()
    },
    checkForUpdates() {
      window.electron?.checkForUpdates()
    },
    clearProfiles() {
      window.electron?.clearProfiles()
    },
  },
  mounted() {
    window.electron?.checkForUpdates()
  },
})
</script>
