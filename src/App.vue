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
  margin: 1em;
}
* {
  box-sizing: border-box;
}
</style>
