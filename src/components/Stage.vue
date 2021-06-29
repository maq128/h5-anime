<template>
  <div>
    <div class="stage" :style="cssProps" ref="stage"></div>
    <button @click="goSbf()" :disabled="inSbf || inDbf">单块分叉过程</button>
    <button @click="goDbf()" :disabled="inSbf || inDbf">双块分叉过程</button>
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
      ledger: {
        A: 10,
        B: 6,
        C: 9
      },
      inSbf: false,
      inDbf: false,
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
    goSbf () {
      if (this.inSbf || this.inDbf) return
      this.inSbf = true
      if (this.head.mining) {
        // 突显
        this.head.flash = true
      }
    },

    goDbf () {
      alert('尚未实现')
    },

    async sbf () {
      // 长分叉上扬
      anime({
        targets: this.head,
        y: [this.head.y, this.head.y - 80],
        easing: 'easeOutExpo',
      })

      // 新增短分叉并下沉
      var fork = this.head.prev
      var miners = 'ABC'.split(this.head.miner).join('')
      var ledger = { ...fork.ledger }
      var shortHead = this.newHead({
        xpos: this.head.xpos,
        prev: fork,
        miners,
        ledger
      })
      await anime({
        targets: shortHead,
        y: [shortHead.y, shortHead.y + 80],
        easing: 'easeOutExpo',
      }).finished

      // 整体向左平移一格
      await this.shiftLeft()

      // 两个新的 head
      this.head = this.newHead({
        xpos: 4,
        ypos: -1,
        prev: this.head,
        mining: 3000,
      })
      shortHead = this.newHead({
        xpos: 4,
        ypos: 1,
        prev: shortHead,
        mining: 50000,
      })

      // 长分叉出块后
      this.head.$once('mined', async () => {
        // 短分叉消失
        await anime({
          targets: [shortHead.$el, shortHead.prev.$el],
          opacity: [1.0, 0.0],
          easing: 'linear',
          duration: 2000,
          delay: anime.stagger(500),
        }).finished

        // 长分叉归位
        // console.log(longHead.$el, this.head.$el)
        await anime({
          targets: [this.head.prev, this.head],
          y: [this.head.y, this.head.y + 80],
          easing: 'easeOutExpo',
          delay: anime.stagger(100),
        }).finished

        // 回归正常过程
        this.inSbf = false
        this.round()
      })
    },

    dbf () {
    },

    newHead ({
      xpos,   // 0/1/2/3/4/5 块的水平位置
      ypos,   // -1/0/1 块的垂直位置
      prev,   // 指向上一个块
      mining, // 挖矿时间长度，0 表示直接出块
      miners, // 参与的矿工（缺省为 ABC）
      miner,  // 出块的矿工（缺省自动从 miners 里面随机选取）
      ledger, // 出块前的账簿（缺省使用全局 ledger）
    }) {
      if (!xpos) xpos = 0
      if (!ypos) ypos = 0
      if (!mining) mining = 0
      if (!miners) miners = 'ABC'
      if (!miner) miner = miners[Math.floor(Math.random() * miners.length)]
      if (!ledger) ledger = this.ledger
      ledger[miner] ++
      var propsData = {
        x: 80 + xpos * 160,
        y: 200 + ypos * 80,
        prev,
        mining,
        miner,
        ledger: { ...ledger }
      }
      var block = new this.BlockClass({
        propsData
      })
      this.actors.add(block)

      // 额外记录水平位置
      block.xpos = xpos

      // 加入 Vue 的组件树
      block.$mount()
      this.$refs.stage.appendChild(block.$el)
      this.$children.push(block)
      block.$parent = this

      if (mining > 0) {
        anime({
          targets: block.$el,
          opacity: [0.0, 1.0],
          easing: 'linear',
          duration: 1000,
        })
      }

      return block
    },

    async shiftLeft () {
      // 整体向左滑动一格
      var finished = null
      this.actors.forEach(block => {
        finished = anime({
          targets: block,
          x: [block.x, block.x - 160],
          easing: 'easeOutExpo',
          delay: block.xpos * 80,
        }).finished
      })
      await finished

      // 删除移出显示区的 tail
      var tail = null
      this.actors.forEach(block => {
        block.xpos --
        if (block.xpos < 0) {
          tail = block
          tail.$destroy()
          tail.$el.remove()
          this.actors.delete(tail)
        }
      })

      // 把新的 tail 的 prev 置空
      this.actors.forEach(block => {
        if (block.prev == tail) {
          block.prev = null
        }
      })
    },

    async round () {
      if (this.inSbf) {
        this.sbf()
        return
      }
      if (this.inDbf) {
        this.dbf()
        return
      }

      // 整体向左平移一格
      await this.shiftLeft()

      this.head = this.newHead({
        xpos: 4,
        prev: this.head,
        mining: 5000,
      })
      this.head.$once('mined', this.round)

      // 如果在平移期间启动了分叉，这里补充突显效果
      if (this.inSbf || this.inDbf) {
        this.head.flash = true
      }
    },
  },
  mounted () {
    this.BlockClass = Vue.extend(Block)
    this.actors = new Set()
    this.head = null
    for (var xpos=0; xpos <= 3; xpos++) {
      this.head = this.newHead({
        xpos,
        prev: this.head,
      })
    }
    this.head = this.newHead({
        xpos: 4,
        prev: this.head,
        mining: 3000,
    })
    this.head.$once('mined', this.round)
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
