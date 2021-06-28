<template>
  <div>
    <div class="stage" :style="cssProps" ref="stage"></div>
    <button @click="notImplemented()">单块分叉过程</button>
    <button @click="notImplemented()">双块分叉过程</button>
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
      },
      goSbf: false,
      goDbf: false,
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
    notImplemented () {
      alert('尚未实现')
    },
    sbf () {
      var head1 = this.prev
      head1.y -= 80

      this.prev = this.newHead({
        x: head1.x + 160,
        y: head1.y,
        head1,
        ledger,
        mining: 3000,
      })

      var prev = head1.prev
      var miner = head1.miner == 'C' ? 'A' : 'C'
      var ledger = { ...head1.prev.ledger }
      var head2 = this.newHead({
        x: 80 + 4 * 160,
        y: 280,
        prev,
        miner,
        ledger
      })
      this.newHead({
        x: head2.x + 160,
        y: head2.y,
        head2,
        ledger,
        mining: 30000,
      })

    },

    dbf () {
      alert('尚未实现')
    },

    newHead ({
      x,      // 新块的水平位置
      y,      // 新块的垂直位置
      prev,   // 指向上一个块
      mining, // 挖矿时间长度，0 表示直接出块
      miner,  // 出块的矿工
      ledger, // 出块前的账簿
    }) {
      if (!miner) miner = 'ABC'[Math.floor(Math.random() * 3)]
      if (!ledger) ledger = this.ledger
      ledger[miner] ++
      var propsData = {
        x,
        y,
        prev,
        mining,
        miner,
        ledger: { ...ledger }
      }
      var block = new this.BlockClass({
        propsData
      })
      this.actors.push(block)

      block.$mount()
      this.$refs.stage.appendChild(block.$el)
      this.$children.push(block)
      block.$parent = this

      anime({
        targets: block.$el,
        opacity: [0, 1],
        duration: 1000,
      })

      return block
    },

    round () {
      if (this.goSbf) {
        this.sbf()
        return
      }
      if (this.goDbf) {
        this.dbf()
        return
      }
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

            first = this.actors[0]
            first.prev = null

            this.prev = this.newHead({
              x: 80 + 4 * 160,
              y: 200,
              prev: this.prev,
              mining: 5000,
            })
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
      this.prev = this.newHead({
        x: 80 + i * 160,
        y: 200,
        prev: this.prev,
      })
    }
    this.prev = this.newHead({
        x: 80 + 4 * 160,
        y: 200,
        prev: this.prev,
        mining: 3000,
    })
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
