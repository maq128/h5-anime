<template>
  <div :style="cssProps">
    <div class="stage">
      <div ref="slide" class="slide" @keydown="onKeyDown" tabindex="0">
        <div
          v-for="(line, idx) in lines"
          :key="idx"
          :class="{
            line: true,
            begin: line.begin,
            end: line.end,
            prepare: line.status==1,
            cur:line.status==2,
          }"
        >{{ line.text }}</div>
      </div>
      <div v-if="lines.length==0" class="help">
        <p>字幕编辑就是要给每条字幕设置以下两个属性：</p>
        <p>● 入点：开始显示的时间。该属性若已设置，则在左侧以黄色圆点表示。</p>
        <p>● 出点：结束显示的时间，若未单独设置则与下一条的入点相同。该属性若已设置，则在左侧以灰色圆点表示。</p>
        <hr>
        <p>在编辑模式每条字幕有三种表现状态：</p>
        <p>● 空闲状态：音频播放的当前进度与本条字幕无关。</p>
        <p>● 预备状态：根据音频播放进度，即将要设置本条字幕的入点。本状态用灰色外框表示。</p>
        <p>● 显示状态：本条字幕已设置入点，正等待设置出点。本状态用黄色外框表示。</p>
        <hr>
        <p>工作界面有两种工作模式，准备模式和编辑模式，只要音频开始播放即进入编辑模式。</p>
        <p>有四个按键可以用来控制字幕打点：</p>
        <p>● 空格键：如果当前行处于预备状态，则切换到显示状态（并设置入点）；如果当前行处于显示状态，则切换到下一行显示状态（并设置入点）。</p>
        <p>● 回车键：如果当前行处于显示状态，则切换到空闲状态（并设置出点），同时进入下一行预备状态；否则此键无效。</p>
        <p>● 上箭头：回到上一行显示状态，同时音频也回到上一条的入点；如果已在首行，则首行回到预备状态。</p>
        <p>● 下箭头：进入下一行显示状态，同时音频也进到下一条的入点。如果下一条尚未设置入点，则此键无效。</p>
        <hr>
        <p>关于四个按键的作用：</p>
        <p>空格键用于设置入点（同时可能清除出点），回车键用于设置出点。这两个键仅在编辑模式下可用，不会影响音频播放进度。</p>
        <p>上/下箭头用于移动当前行，并把音频播放进度调整到对应的入点。这两个键不会影响入点和出点。</p>
      </div>
    </div>
    <div class="toolbar">
      <audio ref="audio" controls
        @play="playing=true"
        @pause="playing=false"
        @ended="playing=false"
        @emptied="playing=false"
      >
        <source :src="audioUrl" type="audio/mpeg">
      </audio>
      <input type="text" @change="changeAudio" v-model="audioUrl" :disabled="playing" size="60">
      <button @click="parseSubtitles">↑↑提取字幕文本</button>
      <button @click="composeSubtitles">↓↓合成LRC</button>
    </div>
    <textarea class="lrc" v-model="lrc" :disabled="playing"></textarea>
  </div>
</template>

<script>
import anime from 'animejs'

export default {
  name: 'StageLrcMaker',

  data () {
    return {
      audioUrl: '/chuanqi.mp3',
      lrc: require('raw-loader!@/assets/chuanqi.lrc').default,
      lines: [],
      cur: 0,
      playing: false,
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

  watch: {
    cur(val) {
      // 屏幕可显示 10 行文本，当前行切换时，移动 slide，尽量保证当前行显示在中间附近
      var n = val + 5
      if (n >= this.lines.length) n = this.lines.length - 1
      n -= 9
      if (n < 0) n = 0
      anime({
        targets: this.$refs.slide,
        top: -n * 40,
        easing: 'easeOutQuad',
        duration: 500,
      })
    }
  },

  methods: {
    onKeyDown(evt) {
      if (evt.key == ' ') {
        this.onKeySpace()
      } else if (evt.key == 'Enter') {
        this.onKeyEnter()
      } else if (evt.key == 'ArrowUp') {
        this.onKeyArrowUp()
      } else if (evt.key == 'ArrowDown') {
        this.onKeyArrowDown()
      } else {
        return
      }
      evt.stopPropagation()
      evt.preventDefault()
    },

    onKeySpace() {
      if (!this.playing) return
      if (this.cur >= this.lines.length) return
      var line = this.lines[this.cur]
      if (line.status == 1) {
        // 当前行处于预备状态，则进入显示状态
        line.status = 2
        line.begin = this.$refs.audio.currentTime
      } else {
        // 当前行处于显示状态，解除
        line.status = 0
        line.end = null

        // 下一行进入显示状态
        this.cur ++
        if (this.cur >= this.lines.length) return
        line = this.lines[this.cur]
        line.status = 2
        line.begin = this.$refs.audio.currentTime
      }
    },

    onKeyEnter() {
      if (!this.playing) return
      if (this.cur >= this.lines.length) return
      var line = this.lines[this.cur]
      if (line.status != 2) return

      // 当前行处于显示状态，解除
      line.status = 0
      line.end = this.$refs.audio.currentTime

      // 下一行进入预备状态
      this.cur ++
      if (this.cur >= this.lines.length) return
      line = this.lines[this.cur]
      line.status = 1
    },

    onKeyArrowUp() {
      // 当前行解除任何状态（除非已超出尾部）
      if (this.cur < this.lines.length) {
        this.lines[this.cur].status = 0
      }

      // 如果是在首行，则首行进入预备状态
      if (this.cur == 0) {
        this.lines[this.cur].status = 1
        this.$refs.audio.currentTime = 0
        return
      }

      // 回到上一行，进入显示状态
      this.cur --
      this.lines[this.cur].status = 2
      this.$refs.audio.currentTime = this.lines[this.cur].begin
    },

    onKeyArrowDown() {
      if (this.cur >= this.lines.length - 1) return
      if (!this.lines[this.cur].begin) return
      if (!this.lines[this.cur + 1].begin) return
      if (this.lines[this.cur + 1].begin < this.lines[this.cur].begin) return

      // 当前行解除任何状态
      this.lines[this.cur].status = 0

      // 进到下一行，进入显示状态
      this.cur ++
      this.lines[this.cur].status = 2
      this.$refs.audio.currentTime = this.lines[this.cur].begin
    },

    changeAudio() {
      // 当音频 url 改变时，重新加载音频
      this.$refs.audio.load()
    },

    parseSubtitles() {
      var prevLine = null
      var offset = 0
      this.lines = this.lrc.trim().split('\n')
        // 从每行文本中提取出字幕和 begin
        .map(str => {
          var [, timeSeg, minutes, seconds, subSeconds, meta, text]
            = str.trim().match(/^(\[([0-9]{2}):([0-9]{2})\.([0-9]{2})\])?(\[.+\])?(.*)$/)
          if (meta) {
            // 如果设置了 offset 则提取出来
            var m = meta.trim().match(/^\[offset:\s*(-?[0-9]+)\]$/)
            if (m) {
              offset = parseInt(m[1]) / 1000
            }

            // 如果设置了 url 则提取出来
            m = meta.trim().match(/^\[url:(.+)\]$/)
            if (m) {
              this.audioUrl = m[1].trim().replace('|//', '://')
            }
            return
          }
          var line = {
            text,
            begin: null,
            end: null,
            status: 0
          }
          if (timeSeg) {
            line.begin = parseInt(minutes) * 60 + parseInt(seconds) + (parseInt(subSeconds) / 100) - offset
            if (line.begin < 0) line.begin = 0
          }
          return line
        })
        // 剔除只有 meta 的行
        .filter(line => line)
        // 把空行的 begin 转化为上一行的 end
        .map(line => {
          if (line.text.length > 0) {
            prevLine = line
            return line
          }
          if (prevLine && line.begin) {
            prevLine.end = line.begin
          }
          return line
        })
        // 剔除空行
        .filter(line => line.text.length > 0)

      this.cur = 0
      if (this.lines.length > 0) {
        this.lines[0].status = 1
      }
      this.$refs.audio.load()
    },

    convSecondsToString(sec) {
      var minutes = Math.floor(sec / 60)
      var seconds = Math.floor(sec - minutes * 60)
      var subSeconds = Math.floor((sec - minutes * 60 - seconds) * 100)
      minutes = String(minutes).padStart(2, '0')
      seconds = String(seconds).padStart(2, '0')
      subSeconds = String(subSeconds).padStart(2, '0')
      return '[' + minutes + ':' + seconds + '.' + subSeconds + ']'
    },

    composeSubtitles() {
      var a = [
        `[url:${this.audioUrl.replaceAll(':', '|')}]`,
      ]

      var firstLine = true

      this.lines.forEach(line => {
        var text = line.text

        // 首行特殊处理
        if (firstLine) {
          if (line.begin !== null) {
            if (line.begin > 0.8) {
              a.push('[00:00.00]')
            } else {
              line.begin = 0
            }
          }
        }
        firstLine = false

        if (line.begin !== null) {
          text = this.convSecondsToString(line.begin) + text
        }
        a.push(text)
        if (line.end) {
          a.push(this.convSecondsToString(line.end))
        }
      })
      this.lrc = a.join('\n')
    }
  },

  mounted() {
    // 定时器，确保输入焦点在字幕区，以便接收键盘控制
    this.timer = setInterval(() => {
      if (this.playing && this.$refs.slide) {
        this.$refs.slide.focus()
      }
    }, 500)
  },

  destroyed() {
    // 移除定时器
    clearInterval(this.timer)
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
.slide {
  position: relative;
}
.slide:focus-visible {
  outline: unset;
}
.line {
  position: relative;
  height: 40px;
  line-height: 40px;
  font-size: 30px;
  text-align: center;
  color: white;
  white-space: pre;
  margin: 0 0.5em;
  border: 1px solid transparent;
}
.line.prepare {
  border: 1px solid silver;
}
.line.cur {
  border: 1px solid yellow;
}
.line.begin:before {
  content: '';
  display: block;
  position: absolute;
  left: 10px;
  top: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: yellow;
}
.line.end:after {
  content: '';
  display: block;
  position: absolute;
  left: 25px;
  top: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: gray;
}
.toolbar {
  padding: 0;
}
.toolbar audio {
  vertical-align: middle;
}
.toolbar input {
  margin-right: 1em;
}
.toolbar button {
  margin-left: 0.5em;
}
.lrc {
  display: block;
  width: var(--stage-width);
  height: var(--stage-height);
}
.help {
  font-size: 10pt;
  color: white;
  padding: 0.5em 1em;
}
.help p {
  margin: 0 0 0.3em 0;
}
</style>
