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
    const launcher: Launcher = (
      await axios.get('https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/launcher.json', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).data

    let modpack
    const modpacks = []
    for await (const mp of launcher?.config?.modpacks) {
      const mpk: Modpack = (
        await axios.get(`https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/modpacks/${mp}/modpack.json`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).data
      modpacks.push(mpk)
    }

    return {
      launcher,
      modpacks,
    }
  },
  provide() {
    return {
      'global-launcher': this.launcher,
      'global-modpacks': this.modpacks,
    }
  },
  mounted() {},
})
</script>
