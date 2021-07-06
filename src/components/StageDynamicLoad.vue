<template>
  <div :style="cssProps">
    <div class="stage" ref="container">
    </div>
    <div class="toolbar">
      <button @click="load()">加载文本框中的单文件组件</button>
      <select v-model="selectedModule">
        <option v-for="(_, name) in modules" :key="name" :value="name" >{{ name }}</option>
      </select>
      <button @click="create()" :disabled="!selectedModule">创建组件实例</button>
    </div>
    <textarea class="source" ref="source"></textarea>
  </div>
</template>

<script>
import vue from 'vue'
import less from 'less'
import animejs from 'animejs'
import { loadModule, vueVersion } from '@/vue2-sfc-loader.js'

const options = {
  moduleCache: {
    vue,
    less,
    animejs,
    myData: {
      vueVersion,
    }
  },
  getFile: null,
  addStyle(css) {
    var style = document.createElement('style')
    style.textContent = css
    document.head.appendChild(style)
  },
}

export default {
  name: 'StageDynamicLoad',

  data () {
    return {
      selectedModule: '',
      modules: {}
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
    load () {
      // 用一个临时名称加载组件，这样做的目的是为了让组件获得一个独特的 scoped id
      // .vue 的尾缀是必要的，否则 sfc-loader 不知道如何加载
      const tempname = '__temp__' + Math.floor(Math.random() * 1000000) + '.vue'
      options.getFile = () => this.$refs.source.value
      loadModule(tempname, options)
        .then(module => {
          // 再根据组件的定义确定其正式名称
          options.moduleCache[module.name] = module
          delete options.moduleCache[tempname]

          vue.set(this.modules, module.name, true)
        })
    },

    async create () {
      if (!this.modules[this.selectedModule]) return

      // 移除所有子组件
      this.$children.forEach(child => {
        child.$destroy()
        child.$el.remove()
      })

      // 创建新的子组件
      var Comp = await loadModule(this.selectedModule, options)
      var inst = new vue(Comp)
      inst.$mount()
      this.$refs.container.appendChild(inst.$el)
      this.$children.push(inst)
      inst.$parent = this
    }
  },

  mounted () {
    // 预填充文本框
    fetch('/Message.vue')
      .then(response => response.text())
      .then(text => {
        this.$refs.source.value = text
      })
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
.toolbar {
  padding: 0.5em 0;
}
.toolbar button {
  margin-right: 1em;
}
.source {
  display: block;
  width: var(--stage-width);
  height: var(--stage-height);
}
</style>
