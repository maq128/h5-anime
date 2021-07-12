<template>
  <div class="editor">
    <div ref="slide" class="slide" @keydown="onKeyDown" tabindex="0">
      <div
        v-for="(line, idx) in lines"
        :key="idx"
        :class="{
          line: true,
          prepare: line.status == 1,
          cur: line.status == 2,
        }"
      >
        {{ line.text }}
        <div v-if="line.begin !== null" class="begin-time">{{ line.begin | formatTime }}</div>
        <div v-if="line.end !== null" class="end-time">{{ line.end | formatTime }}</div>
        <div v-if="cur == idx" :class="{'play-time':true, up:line.status==1}">{{ playTime | formatTime }}</div>
      </div>
    </div>
  </div>
</template>

<script>
// StageLrcEditor 组件的接口定义：
//
// props:
//    playing: Boolean 音频是否正在播放。在播放状态下 Space/Enter 键可以操作，且输入焦点会主动拉回。
//    playTime: Number 由外部输入的音频实时播放进度。
//
// methods:
//    parseLrc: 供外部调用，设置 LRC（也可以只包含字幕文本不含时间信息）。
//    composeLrc: 供外部调用，返还 LRC 格式的字幕文件。
//    seekJump: 供外部调用，表示音频播放进度发生了跳转。
//
// events:
//    seek: 通知外部，请求音频播放进度跳转到指定的位置（因为 ArrowUp/ArrowDown 操作）。

export default {
  name: 'StageLrcEditor',

  data () {
    return {
      lines: [],
      cur: 0,
      audioUrl: null,
      audioType: null,
    }
  },

  props: {
    playing: {
      type: Boolean,
      default: false
    },
    playTime: {
      type: Number,
      default: 0
    }
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
        line.begin = this.playTime
      } else {
        // 当前行处于显示状态，解除
        line.status = 0
        line.end = null

        // 下一行进入显示状态
        this.cur ++
        if (this.cur >= this.lines.length) return
        line = this.lines[this.cur]
        line.status = 2
        line.begin = this.playTime
      }
    },

    onKeyEnter() {
      if (!this.playing) return
      if (this.cur >= this.lines.length) return
      var line = this.lines[this.cur]
      if (line.status != 2) return

      // 当前行处于显示状态，解除
      line.status = 0
      line.end = this.playTime

      // 下一行进入预备状态
      this.cur ++
      if (this.cur >= this.lines.length) return
      line = this.lines[this.cur]
      line.status = 1
    },

    onKeyArrowUp() {
      // 已在首行时，播放进度跳到开头
      if (this.cur == 0) {
        this.$emit('seek', 0)
        return
      }

      // 确保上一行的入点可用
      if (this.lines[this.cur - 1].begin === null) return
      if (this.lines[this.cur].begin === null) return
      if (this.lines[this.cur - 1].begin > this.lines[this.cur].begin) return

      // 播放进度跳到上一行的入点
      this.$emit('seek', this.lines[this.cur - 1].begin)
    },

    onKeyArrowDown() {
      // 确保下一行的入点可用
      if (this.cur >= this.lines.length - 1) return
      if (this.lines[this.cur].begin === null) return
      if (this.lines[this.cur + 1].begin === null) return
      if (this.lines[this.cur + 1].begin < this.lines[this.cur].begin) return

      // 播放进度跳到下一行的入点
      this.$emit('seek', this.lines[this.cur + 1].begin)
    },

    // 由外部调用，播放进度跳转
    seekJump() {
      if (this.lines.length == 0) return
      if (this.cur < this.lines.length) {
        this.lines[this.cur].status = 0
      }

      // 加一个偏移是为了避免浮点数误差导致的误判
      var ct = this.playTime + 0.01

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

    // 由外部调用
    parseLrc(lrc) {
      var prevLine = null
      var offset = 0
      this.audioUrl = null
      this.audioType = null
      this.lines = lrc.trim().split('\n')
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

            // 如果设置了 type 则提取出来
            m = meta.trim().match(/^\[type:(.+)\]$/)
            if (m) {
              this.audioType = m[1].trim()
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

      return {
        url: this.audioUrl,
        type: this.audioType
      }
    },

    // 由外部调用
    composeLrc() {
      var a = []
      if (this.audioUrl) {
        a.push(`[url:${this.audioUrl.replaceAll(':', '|')}]`)
      }
      if (this.audioType) {
        a.push(`[type:${this.audioType}]`)
      }

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
          text = '[' + this.$options.filters.formatTime(line.begin) + ']' + text
        }
        a.push(text)
        if (line.end) {
          a.push('[' + this.$options.filters.formatTime(line.end) + ']')
        }
      })
      return a.join('\n')
    }
  },

  filters: {
    formatTime(sec) {
      var minutes = Math.floor(sec / 60)
      var seconds = Math.floor(sec - minutes * 60)
      var subSeconds = Math.floor((sec - minutes * 60 - seconds) * 100)
      minutes = String(minutes).padStart(2, '0')
      seconds = String(seconds).padStart(2, '0')
      subSeconds = String(subSeconds).padStart(2, '0')
      return minutes + ':' + seconds + '.' + subSeconds
    },
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
.editor {
  background-color: #212128;
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
}

.slide {
  position: relative;
  transition: top 0.3s ease 0s;
  border-left: 5px dotted transparent;
  border-right: 5px dotted transparent;

  &:focus {
    border-left-color: yellow;
    border-right-color: yellow;
  }

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

  .begin-time {
    position: absolute;
    left: 10px;
    top: 0;
    font-size: 9pt;
    line-height: 19px;
    color: yellow;
  }

  .end-time {
    position: absolute;
    left: 10px;
    top: 20px;
    font-size: 9pt;
    line-height: 19px;
    color: gray;
  }

  .play-time {
    position: absolute;
    left: 10px;
    top: 19px;
    font-size: 9pt;
    line-height: 19px;
    color: white;
    background-color: #212128;
  }

  .play-time.up {
    top: 0;
  }
}
</style>
