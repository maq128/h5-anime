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

const options = {}

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
      // 先用一个临时名称加载组件，这样仅仅是为了得到组件的正式名称
      const tempname = '__temp__'
      loadModule(tempname, options)
        .then(module => {
          // 删除缓存里的临时组件
          delete options.moduleCache[tempname]

          // 删除缓存里的组件（如果已经存在的话）
          delete options.moduleCache[module.name]

          // 用组件的正式名称重新加载组件
          // 这样做的目的是为了让加载的组件有一个跟组件名称对应的 scope id
          return loadModule(module.name, options)
        })
        .then(module => {
          // 把加载过程中得到的 style 挂到 module 上
          module.moduleStyle = options.moduleStyle

          // 把 module.name 加入选择列表
          vue.set(this.modules, module.name, true)
        })
    },

    create () {
      if (!this.modules[this.selectedModule]) return

      // 移除所有子组件
      this.$children.forEach(child => {
        child.$destroy()
        child.$el.remove()
      })

      // 获取动态加载的组件类（此处用 loadModule 跟直接从组件缓存里面取是一样的结果）
      var Comp = options.moduleCache[this.selectedModule]

      // 加载组件对应的 style
      var id = 'style-' + (Comp.moduleStyle.scopeId || Comp.name)
      var style = document.getElementById(id)
      if (!style) {
        style = document.createElement('style')
        style.id = id
        document.head.appendChild(style)
      }
      style.textContent = Comp.moduleStyle.css

      // 创建组件实例
      var inst = new vue(Comp)
      inst.$mount()
      this.$refs.container.appendChild(inst.$el)
      this.$children.push(inst)
      inst.$parent = this
    },
  },

  mounted () {
    // 为动态加载组件准备好缓存，这里是动态加载的组件可以直接使用的模块
    options.moduleCache = Object.assign(Object.create(null), {
      vue,
      less,
      animejs,
      myData: {
        vueVersion,
      }
    })

    // 为动态加载组件准备好回调函数
    options.getFile = () => ({
        getContentData: () => this.$refs.source.value,
        type: '.vue'
    })
    options.addStyle = (css, scopeId) => {
      // 把组件的 style 暂时存放在 options 里
      options.moduleStyle = { css: css.trim(), scopeId }
    }

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
