<template>
  <div :style="cssProps">
    <div class="stage">
      <StageLrcEditor
        v-if="mode=='edit'"
        ref="editor"
        :playing="playing"
        :playTime="playTime"
        @seek="onEditorSeek"
      />
      <Subtitle
        v-if="mode=='demo'"
        ref="subtitle"
      />
      <div v-if="mode=='setting'" class="help">
        <p>字幕编辑就是要给每条字幕设置以下两个属性：</p>
        <p>● 入点：开始显示的时间。</p>
        <p>● 出点：结束显示的时间，若未单独设置则与下一条的入点相同。</p>
        <hr>
        <p>工作界面有三种工作模式：准备模式、编辑模式和试播模式。</p>
        <p>提取字幕文本之后即进入编辑模式。此模式下，根据音频播放进度，每条字幕有三种表现状态：</p>
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
        <p>空格键用于设置入点（同时可能清除出点），回车键用于设置出点。这两个键仅在编辑模式且正在播放时可用，不会影响音频播放进度。</p>
        <p>上/下箭头用于移动当前行，并把音频播放进度跳到对应的入点。这两个键不会影响入点和出点。</p>
      </div>
    </div>
    <div class="toolbar">
      <span class="mode-indicator">
        <span v-if="mode === 'setting'">准备模式</span>
        <span v-if="mode === 'edit'">编辑模式</span>
        <span v-if="mode === 'demo'">试播模式</span>
      </span>
      <audio ref="audio" controls
        @play="playing=true"
        @pause="playing=false"
        @ended="playing=false"
        @emptied="playing=false"
        @seeked="onAudioSeeked"
        @timeupdate="timeupdate"
      >
        <source :src="audioUrl" :type="audioType">
      </audio>
      <input type="text" @change="changeAudio" v-model="audioUrl" :disabled="playing" size="40">
      <button @click="parseLrc">↑↑提取字幕文本</button>
      <button @click="composeLrc" :disabled="mode!=='edit'">↓↓合成LRC</button>
      <button @click="demoPlay">↑↑试播LRC</button>
    </div>
    <textarea class="lrc" v-model="lrc" :disabled="playing"></textarea>
  </div>
</template>

<script>
import StageLrcEditor from './StageLrcEditor'
import Subtitle from './Subtitle'

export default {
  name: 'StageLrcMaker',

  data () {
    return {
      mode: 'setting', // setting/edit/demo
      audioUrl: '/chuanqi.mp3',
      audioType: 'audio/mpeg',
      lrc: require('raw-loader!@/assets/chuanqi.lrc').default,
      playing: false,
      playTime: 0,
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

  components: {
    StageLrcEditor,
    Subtitle
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
    changeAudio() {
      // 当音频 url 改变时，重新加载音频
      this.$refs.audio.load()
    },

    timeupdate () {
      this.playTime = this.$refs.audio.currentTime
      if (this.mode === 'demo') {
        this.$refs.subtitle.timeupdate(this.playTime)
      }
    },

    onAudioSeeked() {
      this.playTime = this.$refs.audio.currentTime
      if (this.mode === 'edit') {
        this.$refs.editor.seekJump()
      }
    },

    onEditorSeek(ct) {
      this.$refs.audio.currentTime = ct
    },

    parseLrc() {
      this.mode = 'edit'
      this.$nextTick(() => {
        var { url, type } = this.$refs.editor.parseLrc(this.lrc.trim())
        if (url) {
          this.audioUrl = url
          this.audioType = type || 'audio/mpeg'
        }
        this.$refs.audio.load()
      })
    },

    composeLrc() {
      if (this.mode !== 'edit') return
      this.lrc = this.$refs.editor.composeLrc()
    },

    demoPlay() {
      this.mode = 'demo'
      this.$nextTick(() => {
        var { url, type } = this.$refs.subtitle.load(this.lrc.trim())
        if (url) {
          this.audioUrl = url
          this.audioType = type || 'audio/mpeg'
        }
        this.$refs.audio.load()
        this.$refs.audio.play()
      })
    }
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

.mode-indicator {
  display: inline-block;
  border: 1px dotted gray;
  padding: 3px;
  font-size: 9pt;
  color: gray;
}
</style>
