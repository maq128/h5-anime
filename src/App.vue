<template>
  <div id="app">
    <MainMenu />
    <router-view/>
  </div>
</template>

<script>
import MainMenu from './components/MainMenu.vue'

export default {
  name: 'App',
  components: {
    MainMenu
  }
}
</script>

<style>
body {
  margin: 0;
  background: gray;
}
* {
  box-sizing: border-box;
}
#app {
  margin: 0px auto;
  width: 1024px;
  min-height: 100vh;
  background: white;
  padding: 1em;
}
</style>
