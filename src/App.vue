<template>
  <div id="app">
    <div>比特币分叉</div>
    <Stage height="500px" ref="stage" />
  </div>
</template>

<script>
import Stage from './components/Stage.vue'

export default {
  name: 'App',
  components: {
    Stage
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
