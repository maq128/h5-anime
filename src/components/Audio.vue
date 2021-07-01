<template>
  <div class="player">
    <button v-if="!fullControls" class="simple-control" @click="play">
      <span v-if="playing">◼</span>
      <span v-else>▶</span>
    </button>
    <audio
      class="controls"
      ref="audio"
      @timeupdate="timeupdate"
      @play="playing=true"
      @pause="playing=false"
      @ended="playing=false"
      :autoplay="autoplay"
      :controls="fullControls"
    >
      <source :src="source.url" :type="source.type">
    </audio>
  </div>
</template>

<script>
export default {
  name: 'Audio',
  data () {
    return {
      url: null,
      type: 'audio/mpeg',
      playing: false,
    }
  },
  props: {
    source: {
      type: Object
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    fullControls: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    source() {
      this.$refs.audio.load()
    }
  },
  methods: {
    play () {
      if (this.playing) {
        this.$refs.audio.pause()
      } else {
        this.$refs.audio.play()
      }
    },
    timeupdate () {
      this.$emit('timeupdate', this.$refs.audio.currentTime)
    }
  },
}
</script>

<style scoped>
.player {
  display: inline-block;
  vertical-align: middle;
}
.simple-control {
  width: 100px;
  height: 50px;
  line-height: 30px;
  font-size: 30px;
  border-radius: 1em;
  cursor: pointer;
}
.controls {
  display: inline-block;
  vertical-align: middle;
}
</style>
