<template>
  <div :style="cssProps">
    <div class="stage">
      <div ref="slide" class="slide" @keydown="onKeyDown" tabindex="0">
        <div
          v-for="(line, idx) in lines"
          :key="idx"
          :class="{
            line: true,
            begin: line.begin !== null,
            end: line.end,
            prepare: line.status == 1,
            cur:line.status == 2,
          }"
        >{{ line.text }}</div>
      </div>
      <div v-if="lines.length==0" class="help">
        <p>字幕编辑就是要给每条字幕设置以下两个属性：</p>
        <p>● 入点：开始显示的时间。若该属性已设置，则在左侧以黄色圆点表示。</p>
        <p>● 出点：结束显示的时间，若未单独设置则与下一条的入点相同。若该属性已设置，则在左侧以灰色圆点表示。</p>
        <hr>
        <p>工作界面有两种工作模式，准备模式和编辑模式，只要音频开始播放即进入编辑模式。</p>
        <p>在编辑模式，根据音频播放进度，每条字幕有三种表现状态：</p>
        <p>● 空闲状态：本条字幕无可操作。</p>
        <p>● 预备状态：本条字幕即将要设置入点。本状态用灰色外框表示。</p>
        <p>● 显示状态：本条字幕已设置入点，正等待设置出点。本状态用黄色外框表示。</p>
        <hr>
        <p>有四个按键可以用来控制字幕打点：</p>
        <p>● 空格键：如果当前行处于预备状态，则为其设置入点，并转为显示状态；如果当前行处于显示状态，则转为空闲状态，同时下一行设置入点并转为显示状态。</p>
        <p>● 回车键：如果当前行处于显示状态，则为其设置出点，并转为空闲状态，同时下一行进入预备状态；否则此键无效。</p>
        <p>● 上箭头：回到上一行显示状态，同时音频进度也跳到上一行的入点；如果已在首行，则首行回到预备状态，同时音频进度跳到开头。</p>
        <p>● 下箭头：进入下一行显示状态，同时音频进度也跳到下一行的入点。如果下一条尚未设置入点，则此键无效。</p>
        <hr>
        <p>关于四个按键的作用：</p>
        <p>空格键用于设置入点（同时可能清除出点），回车键用于设置出点。这两个键仅在编辑模式下可用，不会影响音频播放进度。</p>
        <p>上/下箭头用于移动当前行，并把音频播放进度跳到对应的入点。这两个键不会影响入点和出点。</p>
      </div>
    </div>
    <div class="toolbar">
      <audio ref="audio" controls
        @play="playing=true"
        @pause="playing=false"
        @ended="playing=false"
        @emptied="playing=false"
        @seeked="onSeeked"
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
      this.$refs.slide.style.top = '-' + (n*40) + 'px'
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
      // 已在首行时，播放进度跳到开头
      if (this.cur == 0) {
        this.$refs.audio.currentTime = 0
        return
      }

      // 确保上一行的入点可用
      if (this.lines[this.cur - 1].begin === null) return
      if (this.lines[this.cur].begin === null) return
      if (this.lines[this.cur - 1].begin > this.lines[this.cur].begin) return

      // 播放进度跳到上一行的入点
      this.$refs.audio.currentTime = this.lines[this.cur - 1].begin
    },

    onKeyArrowDown() {
      // 确保下一行的入点可用
      if (this.cur >= this.lines.length - 1) return
      if (this.lines[this.cur].begin === null) return
      if (this.lines[this.cur + 1].begin === null) return
      if (this.lines[this.cur + 1].begin < this.lines[this.cur].begin) return

      // 播放进度跳到下一行的入点
      this.$refs.audio.currentTime = this.lines[this.cur + 1].begin
    },

    onSeeked() {
      if (this.lines.length == 0) return
      if (this.cur < this.lines.length) {
        this.lines[this.cur].status = 0
      }

      // 取得当前播放进度（加一个偏移是为了避免浮点数误差导致的误判）
      var ct = this.$refs.audio.currentTime + 0.01

      // 找到当前播放进度对应的字幕行
      for (var i = this.lines.length - 1; i >= 0; i--) {
        if (this.lines[i].begin !== null && this.lines[i].begin <= ct) {
          // 找到了，则设置其为当前行
          this.cur = i
          this.lines[this.cur].status = 2
          return
        }
      }
      // 没找到，则首行进入预备状态
      this.cur = 0
      this.lines[this.cur].status = 1
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

<style scoped lang="less">
.stage {
  background-color: #212128;
  width: var(--stage-width);
  height: var(--stage-height);
  position: relative;
  overflow: hidden;
}

.slide {
  position: relative;
  transition: top 0.3s ease 0s;

  &:focus-visible {
    outline: unset;
  }
}

.line {
  position: relative;
  height: 40px;
  line-height: 35px;
  font-size: 25px;
  text-align: center;
  margin: 0 0.5em;
  color: gray;
  border: 1px solid transparent;

  &.prepare {
    color: silver;
    border: 1px solid silver;
  }

  &.cur {
    color: white;
    border: 1px solid yellow;
  }

  &.begin:before {
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

  &.end:after {
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
}

.toolbar {
  padding: 0;

  audio {
    vertical-align: middle;
  }

  input {
    margin-right: 1em;
  }

  button {
    margin-left: 0.5em;
  }
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

  p {
    margin: 0 0 0.3em 0;
  }
}
</style>
