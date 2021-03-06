<template>
  <div>
    <div class="stage" :style="cssProps" ref="stage">
    </div>
    <div class="footbar">
      <button @click="goSbf()" :class="{'in-progress':inSbf}" :disabled="inSbf || inDbf">单块分叉过程</button>
      <button @click="goDbf()" :class="{'in-progress':inDbf}" :disabled="inSbf || inDbf">双块分叉过程</button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import anime from 'animejs'

import Block from './Block.vue'

export default {
  name: 'StageBitcoinForks',

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
    },
  },

  methods: {
    goSbf () {
      if (this.inSbf || this.inDbf) return
      this.inSbf = true
      if (this.head.mining) {
        // 分叉预警
        this.head.flash = true
      }
    },

    goDbf () {
      if (this.inSbf || this.inDbf) return
      this.inDbf = true
      if (this.head.mining) {
        // 分叉预警
        this.head.flash = true
      }
    },

    async sbf () {
      // 短分叉上只有一个矿工
      var shortMiner = this.head.miner == 'C' ? 'B' : 'C'
      // 其余两个矿工在长分叉上
      var longMiners = 'ABC'.split(shortMiner).join('')

      // 长分叉追加 mining block
      this.head = this.newHead({
        xpos: this.head.xpos + 1,
        prev: this.head,
        miners: longMiners,
        mining: 5000,
      })

      // 长分叉上扬
      anime({
        targets: [this.head.prev, this.head],
        y: [this.head.y, this.head.y - 80],
        easing: 'easeOutExpo',
      })

      // 新增短分叉
      var fork = this.head.prev.prev
      var shortLedger = { ...this.head.prev.ledger }
      var shortHead = this.newHead({
        xpos: fork.xpos + 1,
        ypos: 1,
        prev: fork,
        miners: shortMiner,
        ledger: shortLedger,
      })

      // 短分叉追加 mining block（挖矿时间要长很多）
      shortHead = this.newHead({
        xpos: shortHead.xpos + 1,
        ypos: 1,
        prev: shortHead,
        miners: shortMiner,
        ledger: shortLedger,
        mining: 50000,
      })

      // 整体向左平移一格
      await this.shiftLeft()

      // 长分叉出块后追加 mining block
      await this.head.mined
      this.head = this.newHead({
        xpos: this.head.xpos + 1,
        ypos: -1,
        prev: this.head,
        miners: longMiners,
        mining: 5000,
      })

      // 整体向左平移一格
      await this.shiftLeft()

      // 短分叉消失
      await anime({
        targets: [shortHead.$el, shortHead.prev.$el],
        opacity: [1.0, 0.0],
        easing: 'linear',
        duration: 2000,
        delay: anime.stagger(500),
      }).finished

      // 长分叉归位
      await anime({
        targets: [this.head.prev.prev, this.head.prev, this.head],
        y: [this.head.y, this.head.y + 80],
        easing: 'easeOutExpo',
        delay: anime.stagger(100),
      }).finished

      // 等待长分叉出块后，回归正常过程
      await this.head.mined
      this.inSbf = false
      this.$nextTick(this.round)
    },

    async dbf () {
      // 短分叉上只有一个矿工
      var shortMiner = this.head.miner == 'C' ? 'B' : 'C'
      // 其余两个矿工在长分叉上
      var longMiners = 'ABC'.split(shortMiner).join('')

      // 长分叉追加 mining block
      this.head = this.newHead({
        xpos: this.head.xpos + 1,
        prev: this.head,
        miners: longMiners,
        mining: 5000,
      })

      // 长分叉上扬
      anime({
        targets: [this.head.prev, this.head],
        y: [this.head.y, this.head.y - 80],
        easing: 'easeOutExpo',
      })

      // 新增短分叉
      var fork = this.head.prev.prev
      var shortLedger = { ...this.head.prev.ledger }
      var shortHead = this.newHead({
        xpos: fork.xpos + 1,
        ypos: 1,
        prev: fork,
        miners: shortMiner,
        ledger: shortLedger,
      })

      // 短分叉追加 mining block（挖矿时间接近）
      shortHead = this.newHead({
        xpos: shortHead.xpos + 1,
        ypos: 1,
        prev: shortHead,
        miners: shortMiner,
        ledger: shortLedger,
        mining: 5300,
      })

      // 整体向左平移一格
      await this.shiftLeft()

      // 长分叉出块后追加 mining block
      await this.head.mined
      this.head = this.newHead({
        xpos: this.head.xpos + 1,
        ypos: -1,
        prev: this.head,
        miners: longMiners,
        mining: 3000,
      })

      // 短分叉出块后追加 mining block（这次的挖矿时间要长很多）
      await shortHead.mined
      shortHead = this.newHead({
        xpos: shortHead.xpos + 1,
        ypos: 1,
        prev: shortHead,
        miners: shortMiner,
        ledger: shortLedger,
        mining: 30000,
      })

      // 整体向左平移一格
      await this.shiftLeft()

      // 长分叉出块后追加 mining block
      await this.head.mined
      this.head = this.newHead({
        xpos: this.head.xpos + 1,
        ypos: -1,
        prev: this.head,
        miners: longMiners,
        mining: 5000,
      })

      // 整体向左平移一格
      await this.shiftLeft()

      // 短分叉消失
      await anime({
        targets: [shortHead.$el, shortHead.prev.$el, shortHead.prev.prev.$el],
        opacity: [1.0, 0.0],
        easing: 'linear',
        duration: 2000,
        delay: anime.stagger(500),
      }).finished

      // 长分叉归位
      await anime({
        targets: [this.head.prev.prev.prev, this.head.prev.prev, this.head.prev, this.head],
        y: [this.head.y, this.head.y + 80],
        easing: 'easeOutExpo',
        delay: anime.stagger(100),
      }).finished

      // 等待长分叉出块后，回归正常过程
      await this.head.mined
      this.inDbf = false
      this.$nextTick(this.round)
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

      ledger[miner] ++

      // 额外记录水平位置
      block.xpos = xpos

      // 加入 Vue 的组件树
      block.$mount()
      if (this.$refs.stage) {
        this.$refs.stage.appendChild(block.$el)
      }
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

      // 删除超出显示区的 tail
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

      // 新的 mining block
      this.head = this.newHead({
        xpos: 5,
        prev: this.head,
        mining: 5000,
      })

      // 整体向左平移一格
      await this.shiftLeft()

      // 如果在平移期间启动了分叉，这里补充分叉预警效果
      if (this.inSbf || this.inDbf) {
        this.head.flash = true
      }

      // 等待出块后，进入下一轮 round
      await this.head.mined
      this.$nextTick(this.round)
    },
  },

  mounted () {
    this.BlockClass = Vue.extend(Block)
    this.actors = new Set()
    this.head = null
    // 先摆 4 个 mined block
    for (var xpos=0; xpos <= 3; xpos++) {
      this.head = this.newHead({
        xpos,
        prev: this.head,
      })
    }
    // 再追加一个 mining block
    this.head = this.newHead({
        xpos: 4,
        prev: this.head,
        mining: 3000,
    })
    this.head.mined.then(this.round)
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
.footbar {
  padding: 1em;
  background-color: #1b1b22;
  text-align: center;
}
.footbar button {
  margin: 0 1em;
  padding: 1em;
  border: 1px solid #2d2d32;
  border-radius: 5px;
  background-color: #2d2d32;
  color: white;
  cursor: pointer;
}
.footbar button:hover {
  border: 1px solid #3183f2;
  color: #3183f2;
}
.footbar button:active {
  border: 1px solid #3183f2;
  background-color: #3183f2;
  color: white;
}
.footbar button[disabled] {
  border: 1px solid #2d2d32;
  color: gray;
  cursor: wait;
}
.footbar button.in-progress {
  border: 1px solid #3183f2;
  background-color: #3183f2;
  color: white;
}
</style>
