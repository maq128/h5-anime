<template>
  <div>
    <MainMenuItem path="/bitcoin-forks" title="实训案例1：比特币分叉" />
    <MainMenuItem path="/audio-subtitles" title="音频和字幕" />
  </div>
</template>

<script>
import MainMenuItem from './MainMenuItem.vue'

export default {
  name: 'MainMenu',

  data () {
    return {
    }
  },

  components: {
    MainMenuItem,
  },
}
</script>

<style scoped>
</style>
