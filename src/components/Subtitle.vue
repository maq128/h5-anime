<template>
  <div class="subtitle">
    <div class="line" ref="line">{{ line }}</div>
  </div>
</template>

<script>
// Subtitle 组件的接口定义：
//
// methods:
//    load: 供外部调用，设置 LRC 格式的字幕文件内容。
//    timeupdate: 供外部调用，设置音频的实时播放进度。

import anime from 'animejs'
import SubtitleParser from 'subtitle-parser'

export default {
  name: 'Subtitle',
  data () {
    return {
      line: '',
      lines: [],
      parser: null,
    }
  },
  methods: {
    load (lrc) {
      this.parser = new SubtitleParser(lrc)
      var { url, type, content } = this.parser.subtitle
      this.lines = content
      if (url) {
        url = url.replace('|//', '://')
        type = type || 'audio/mpeg'
      }
      return { url, type }
    },
    async timeupdate (ct) {
      if (this.updating) return
      this.updating = true

      var past = Math.floor(ct * 1000)
      this.hour = Math.floor(past / 3600000)
      past -= this.hour * 3600000
      this.minute = Math.floor(past / 60000)
      past -= this.minute * 60000
      this.second = Math.floor(past / 1000)
      past -= this.second * 1000
      this.miillisecond = past
      var line = this.parser.getNowSubtitle(this.hour, this.minute, this.second, this.miillisecond)
      if (this.line != line) {
        this.line += '\n' + line
        await anime({
          targets: this.$refs.line,
          top: [0, -40],
          easing: 'linear',
          duration: 1000,
        }).finished
        this.line = line
        if (this.$refs.line) {
          this.$refs.line.style.top = 0
        }
      }

      this.updating = false
    }
  }
}
</script>

<style scoped>
.subtitle {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  margin-bottom: 1em;
  overflow: hidden;
}
.line {
  position: relative;
  top: 0;
  margin: 0 auto;
  line-height: 40px;
  font-size: 30px;
  text-align: center;
  color: white;
  white-space: pre;
}
</style>
