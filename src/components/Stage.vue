<template>
  <div class="stage" :style="cssProps" ref="stage">
  </div>
</template>

<script>
import Vue from 'vue'
import Block from './Block.vue'
export default {
  name: 'Stage',
  data () {
    return {
      actors: [],
      ledger: {
        A: 10,
        B: 6,
        C: 9
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
    }
  },
  methods: {
    new () {
      this.removeAll()
    },
    removeAll () {
      this.actors.forEach(actor => {
        actor.$destroy()
      })
      this.actors = []
      this.$refs.stage.innerHTML = ''
    }
  },
  mounted () {
    this.BlockClass = Vue.extend(Block)
    for (var i=0; i< 5; i++) {
      var miner = 'ABC'[Math.floor(Math.random() * 3)]
      this.ledger[miner] ++
      var propsData = {
        x: 100 + i * 160,
        y: 200,
        miner,
        ledger: { ...this.ledger }
      }
      var block = new this.BlockClass({
        propsData
      })
      this.actors.push(block)
      block.$mount()
      this.$refs.stage.appendChild(block.$el)
    }
  }
}
</script>

<style scoped>
.stage {
  background-color: black;
  width: var(--stage-width);
  height: var(--stage-height);
  position: relative;
}
</style>
