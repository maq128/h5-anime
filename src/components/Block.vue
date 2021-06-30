<template>
  <div class="block" :style="cssProps">
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 50 50" :class="minerName">
      <defs>
        <marker :id="`arrowhead-${minerName}`" :class="minerName" markerWidth="12" markerHeight="7" refX="12" refY="3.5" orient="auto">
          <polyline points="0 0, 12 3.5, 0 7" fill="transparent" />
        </marker>
      </defs>
      <path fill="#3a3a3f" stroke="#222225" stroke-width="1" d="M -10 -50 v -15 c 0 -10, 0 -10, -10 -10 h -20 c -10 0, -10 0, -10 10 v 15 Z"/>
      <path fill="#2d2d32" stroke="#222225" stroke-width="1" d="M 0 -50 h -40 c -10 0, -10 0, -10 10 v 80 c 0 10, 0 10, 10 10 h 80 c 10 0, 10 0, 10 -10 v -80 c 0 -10, 0 -10, -10 -10 Z"/>
      <path v-if="flash" class="flash" fill="#333" stroke-width="1" d="M -50 0 v 40 c 0 10, 0 10, 10 10 h 80 c 10 0, 10 0, 10 -10 v -80 c 0 -10, 0 -10, -10 -10 h -50 v -15 c 0 -10, 0 -10, -10 -10 h -20 c -10 0, -10 0, -10 10 Z"/>
      <path v-else fill="transparent" stroke-width="1" d="M -50 0 v 40 c 0 10, 0 10, 10 10 h 80 c 10 0, 10 0, 10 -10 v -80 c 0 -10, 0 -10, -10 -10 h -50 v -15 c 0 -10, 0 -10, -10 -10 h -20 c -10 0, -10 0, -10 10 Z"/>
      <line x1="-55" y1="0" :x2="prevX" :y2="prevY" :marker-end="`url(#arrowhead-${minerName})`"/>
      <foreignObject x="-50" y="-75" width="40" height="25">
        <div class="tag" xmlns="http://www.w3.org/1999/xhtml">
          <span :class="minerName">{{ minerName == 'M' ? '?' : miner }}</span>
        </div>
      </foreignObject>
      <foreignObject x="-50" y="-50" width="100" height="100">
        <div class="ledger" xmlns="http://www.w3.org/1999/xhtml">
          <div v-if="minerName != 'M'" class="content">
            <p><span class="A">●</span><span class="name">A</span><span class="balance">{{ A }}</span><span v-if="miner=='A'" class="A">+1</span></p>
            <p><span class="B">●</span><span class="name">B</span><span class="balance">{{ B }}</span><span v-if="miner=='B'" class="B">+1</span></p>
            <p><span class="C">●</span><span class="name">C</span><span class="balance">{{ C }}</span><span v-if="miner=='C'" class="C">+1</span></p>
          </div>
          <transition name="mined" appear>
            <img v-if="minerName == 'M'" class="content" src="../assets/mining.gif"/>
          </transition>
        </div>
      </foreignObject>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Block',
  data () {
    return {
      A: this.ledger.A,
      B: this.ledger.B,
      C: this.ledger.C,
      flash: false, // 分叉预警效果
    }
  },
  props: {
    x: {
      type: Number,
      default: 100
    },
    y: {
      type: Number,
      default: 100
    },
    width: {
      type: Number,
      default: 100
    },
    height: {
      type: Number,
      default: 100
    },
    prev: {
      type: Object,
      default: null
    },
    mining: {
      type: Number,
      default: 0
    },
    miner: {
      type: String,
      default: 'A'
    },
    ledger: {
      type: Object,
      default: () => {
        return {
          A: 0,
          B: 0,
          C: 0
        }
      }
    }
  },
  computed: {
    prevX() {
      return this.prev ? this.prev.x - this.x + 55 : -160 + 50
    },
    prevY() {
      return this.prev ? this.prev.y - this.y : 0
    },
    cssProps() {
      return {
        '--block-x': this.x + 'px',
        '--block-y': this.y + 'px',
      }
    },
    minerName() {
      return this.mining > 0 ? 'M' : this.miner
    }
  },
  mounted () {
    if (this.mining > 0) {
      this.mined = new Promise((resolve) => {
        setTimeout(() => {
          this.mining = 0
          this.flash = false
          setTimeout(() => {
            // 这里使用 requestAnimationFrame() 是因为：
            // 当窗口隐藏时，anime 动画都会被锁止，所以 'mined' 消息也应该被锁止，
            // 以避免主动画流程被异常推进。
            requestAnimationFrame(resolve)
          }, 500)
        }, this.mining)
      })
    } else {
      this.mined = Promise.resolve()
    }
  }
}
</script>

<style scoped lang="less">
.block {
  position: absolute;
  left: var(--block-x);
  top: var(--block-y);
  background-color: transparent;
  width: 0;
  height: 0;
}
.block .A {
  stroke: #72caf3;
  color: #72caf3;
}
.block .B {
  stroke: #8273f8;
  color: #8273f8;
}
.block .C {
  stroke: #4484f5;
  color: #4484f5;
}
.block .M {
  stroke: #7f8187;
  color: #7f8187;
}
.block .flash {
  stroke: #f6ca5d;
  color: #f6ca5d;
  filter: drop-shadow( 0 0 5px gold );
}
svg {
  overflow: visible;
  position: relative;
  left: -50px;
  top: -50px;
}
.tag {
  color: #3179dd;
  text-align: center;
  line-height: 25px;
  font-size: 15px;
  font-weight: bold;
}
.ledger {
  overflow: hidden;
  position: relative;
  left: 1px;
  top: 1px;
  width: 98px;
  height: 98px;

  .content {
    position: absolute;
    left: 0px;
    top: 0px;

    p {
      margin: 0.4em;
      color: white;
      font-size: 15px;
      line-height: 25px;

      .miner {
        color: gold;
        font-weight: bold;
      }

      .name {
        display: inline-block;
        padding: 0 0.5em;
        color: #989898;
      }

      .balance {
        display: inline-block;
        padding: 0 0.2em;
        color: white;
      }
    }
  }

  .mined-enter-active, .mined-leave-active {
    transition: left 1s ease 0s;
  }
  .mined-enter {
    left: -100px;
  }
  .mined-enter-to, .mined-leave {
    left: 0px;
  }
  .mined-leave-to {
    left: 100px;
  }
}
</style>
