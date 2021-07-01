<template>
  <div :style="cssProps">
    <div class="stage" ref="container">
    </div>
    <button @click="load()">load</button>
    <textarea class="source" ref="source"></textarea>
  </div>
</template>

<script>
export default {
  name: 'StageDynamicLoad',

  data () {
    return {
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
    async load () {
      const { loadModule, vueVersion } = window['vue2-sfc-loader']
      const Vue = window['Vue']
      var $refs = this.$refs

      const options = {
        moduleCache: {
          vue: Vue,
          myData: {
            vueVersion,
          }
        },
        getFile(url) {
          console.log('getFile:', url)
          return $refs.source.value
        },
        addStyle(css) {
          var style = document.createElement('style')
          style.textContent = css
          document.head.appendChild(style)
        },
      }

      var Comp = await loadModule('Message.vue', options)
      var comp = new Vue(Comp)
      comp.$mount()
      this.$refs.container.appendChild(comp.$el)
      this.$children.push(comp)
      comp.$parent = this
    },
  },

  mounted () {
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
.source {
  display: block;
  width: var(--stage-width);
  height: var(--stage-height);
}
</style>
