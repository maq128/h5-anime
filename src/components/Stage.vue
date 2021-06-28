<template>
  <div>
    <div class="stage" :style="cssProps" ref="stage"></div>
    <button @click="sbf()">单块分叉过程</button>
    <button @click="dbf()">双块分叉过程</button>
  </div>
</template>

<script>
import Vue from 'vue'
import anime from 'animejs'
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
    sbf () {
      console.log('演示单块分叉过程')
    },
    dbf () {
      console.log('演示双块分叉过程')
    },
    new (i, prev, mining) {
      var miner = 'ABC'[Math.floor(Math.random() * 3)]
      this.ledger[miner] ++
      var propsData = {
        x: 100 + i * 160,
        y: 200,
        prev,
        mining,
        miner,
        ledger: { ...this.ledger }
      }
      var block = new this.BlockClass({
        propsData
      })
      this.actors.push(block)

      block.$mount()
      this.$refs.stage.appendChild(block.$el)
      this.$children.push(block)
      block.$parent = this
      return block
    },
    round () {
      for (var i=0; i < this.actors.length; i++) {
        var block = this.actors[i]
        anime({
          targets: block,
          x: [block.x, block.x - 160],
          easing: 'easeOutExpo',
          delay: i * 50,
          complete: i == 0 ? () => {
            var first = this.actors.shift();
            first.$destroy()
            first.$el.remove()

            this.prev = this.new(4, this.prev, 3000)
            this.prev.$once('mined', this.round)
          } : null
        })
      }
    },
    removeAll () {
      this.actors.forEach(actor => {
        actor.$destroy()
        actor.$el.remove()
      })
      this.actors = []
    }
  },
  mounted () {
    this.BlockClass = Vue.extend(Block)
    this.prev = null
    for (var i=0; i <= 3; i++) {
      this.prev = this.new(i, this.prev)
    }
    this.prev = this.new(4, this.prev, 5000)
    this.prev.$once('mined', this.round)
  }
}
</script>

<style scoped>
.stage {
  background-color: black;
  width: var(--stage-width);
  height: var(--stage-height);
  position: relative;
  overflow: hidden;
}
button {
  margin: 1em 1em 1em 0;
}
</style>
