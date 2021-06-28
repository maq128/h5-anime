<template>
  <div class="block" :style="cssProps" :class="{flash}">
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 50 50">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#fff" />
        </marker>
      </defs>
      <g>
        <rect x="-50" y="-80" width="50" height="30" stroke="#fff" :fill="flash ? '#f00' : '#888'"/>
        <rect x="-50" y="-50" width="100" height="100" stroke="#fff" :fill="flash ? '#f00' : '#888'"/>
        <line x1="-55" y1="0" :x2="prevX" :y2="prevY" stroke="#fff" fill="#fff" marker-end="url(#arrowhead)"/>
        <foreignObject x="-50" y="-80" width="50" height="30">
          <div class="tag" xmlns="http://www.w3.org/1999/xhtml">
            {{ mining > 0 ? '?' : miner }}
          </div>
        </foreignObject>
        <foreignObject x="-50" y="-50" width="100" height="100">
          <div class="ledger" xmlns="http://www.w3.org/1999/xhtml">
            <img v-if="mining > 0" src="../assets/mining.gif"/>
            <template v-else>
              <p :class="miner=='A'?'miner':''">A: {{ A }}</p>
              <p :class="miner=='B'?'miner':''">B: {{ B }}</p>
              <p :class="miner=='C'?'miner':''">C: {{ C }}</p>
            </template>
          </div>
        </foreignObject>
      </g>
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
      flash: false, // 是否需要闪光效果（表示即将分叉）
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
        '--block-width': this.width + 'px',
        '--block-height': this.height + 'px'
      }
    }
  },
  mounted () {
    if (this.mining > 0) {
      setTimeout(() => {
        this.mining = 0
        this.flash = false
        setTimeout(() => {
          this.$emit('mined')
        }, 500)
      }, this.mining)
    }
  }
}
</script>

<style scoped>
.block {
  position: absolute;
  left: var(--block-x);
  top: var(--block-y);
  background-color: transparent;
  width: 0;
  height: 0;
}
.block.flash {
  background-color: red;
}
svg {
  overflow: visible;
  position: relative;
  left: -50px;
  top: -50px;
}
.tag {
  color: white;
  text-align: center;
  line-height: 30px;
  font-size: 25px;
}
.ledger p {
  margin: 0.4em;
  color: white;
  font-size: 18px;
}
.ledger p.miner {
  color: gold;
  font-weight: bold;
}
</style>
