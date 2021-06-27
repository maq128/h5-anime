<template>
  <div id="app">
    <div>bitcoin-forks</div>
    <Stage height="500px" ref="stage" />
    <button @click="$refs.stage.play()">play</button>
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
