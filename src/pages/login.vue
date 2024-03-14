<template lang='pug'>
div.fit.flex(:style='{flexFlow: "column"}')
  div.items-center.fit.justify-center.flex(:style='{background: "url(" + launcher?.config?.pages?.login?.background + ") no-repeat center center fixed"}')
    q-btn(label='Connexion' color='primary' icon="mdi-login-variant" size='lg' @click='getAccessToken')
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
      window.electron?.getAccessToken(true)
    },
  },
})
</script>
