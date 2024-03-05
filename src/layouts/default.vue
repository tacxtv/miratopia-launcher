<template lang="pug">
div.fit.flex(:style='{flexFlow: "column"}')
  window-bar
  lazy-nuxt-page
</template>

<style>
body {
  margin: 0;
  background: #333;
}
</style>
