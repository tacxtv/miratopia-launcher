<template lang="pug">
div.fit.flex(:style='{flexFlow: "column"}')
  window-bar(:resizable="false")
  lazy-nuxt-page
</template>

<style>
body {
  margin: 0;
  background: #333;
}
</style>
