<template>
  <div>
    <div class="stage" :style="cssProps" ref="stage">
      <Subtitle ref="subtitle"></Subtitle>
    </div>
    <div class="footbar">
      <Audio :source="audioSource" :fullControls="false" @timeupdate="timeupdate"></Audio>
      <button @click="play1" :class="{'in-progress':cur==1}">第一段</button>
      <button @click="play2" :class="{'in-progress':cur==2}">第二段</button>
      <button @click="play3" :class="{'in-progress':cur==3}">第三段</button>
    </div>
  </div>
</template>

<script>
import Subtitle from './Subtitle.vue'
import Audio from './Audio.vue'

export default {
  name: 'StageAudioSubtitles',

  components: {
    Subtitle,
    Audio,
  },

  data () {
    return {
      cur: 0,
      audioSource: {
        url: '',
        type: ''
      }
    }
  },

  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },

  computed: {
    cssProps() {
      return {
        '--stage-width': this.width,
        '--stage-height': this.height
      }
    },
  },

  methods: {
    timeupdate (ct) {
      // 把音频组件的播放进度推送给字幕组件
      this.$refs.subtitle.timeupdate(ct)
    },

    play1 () {
      this.cur = 1
      var lrc = require('raw-loader!@/assets/chuanqi.lrc').default
      this.audioSource = this.$refs.subtitle.load(lrc)
    },

    play2 () {
      this.cur = 2
      var lrc = require('raw-loader!@/assets/lgfw.lrc').default
      this.audioSource = this.$refs.subtitle.load(lrc)
    },

    play3 () {
      this.cur = 3
      var lrc = require('raw-loader!@/assets/jzbg.lrc').default
      this.audioSource = this.$refs.subtitle.load(lrc)
    },
  },

  mounted () {
    this.play1()
  }
}
</script>

<style scoped>
.stage {
  background-color: #212128;
  width: var(--stage-width);
  height: var(--stage-height);
  position: relative;
  overflow: hidden;
}
.footbar {
  padding: 1em;
  background-color: #1b1b22;
  text-align: center;
}
.footbar button {
  margin: 0 1em;
  padding: 1em;
  border: 1px solid #2d2d32;
  border-radius: 5px;
  background-color: #2d2d32;
  color: white;
  cursor: pointer;
}
.footbar button:hover {
  border: 1px solid #3183f2;
  color: #3183f2;
}
.footbar button:active {
  border: 1px solid #3183f2;
  background-color: #3183f2;
  color: white;
}
.footbar button[disabled] {
  border: 1px solid #2d2d32;
  color: gray;
  cursor: wait;
}
.footbar button.in-progress {
  border: 1px solid #3183f2;
  background-color: #3183f2;
  color: white;
}
</style>
