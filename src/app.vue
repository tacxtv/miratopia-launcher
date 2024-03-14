<template lang="pug">
nuxt-layout
  nuxt-page
</template>

<script lang="ts">
import axios from 'axios'
import type { Launcher } from '../types/launcher.type'
import type { Modpack } from '../types/modpack.type'

// @ts-ignore
export default defineNuxtComponent({
  async setup() {
    const launcher: Launcher = (await axios.get('https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/launcher.json')).data
    const modpack: Modpack = (await axios.get('https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/modpacks/miratopia/modpack.json')).data

    return {
      launcher,
      modpack,
    }
  },
  provide() {
    return {
      'global-launcher': this.launcher,
      'global-modpacks': [this.modpack],
    }
  },
  mounted() {
  }
})
</script>
