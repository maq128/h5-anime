<template>
  <div class="block" :style="cssProps">
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g>
        <rect x="0" y="-30" width="50" height="30" stroke="#fff" fill="#888"/>
        <rect x="0" y="0" width="100" height="100" stroke="#fff" fill="#888"/>
        <line x1="-50" y1="50" x2="-5" y2="50" stroke="#fff" fill="none"/>
        <line x1="-50" y1="50" x2="-40" y2="45" stroke="#fff" fill="none"/>
        <line x1="-50" y1="50" x2="-40" y2="55" stroke="#fff" fill="none"/>
        <foreignObject x="0" y="-30" width="50" height="30">
          <div class="tag" xmlns="http://www.w3.org/1999/xhtml">
            {{ miner }}
          </div>
        </foreignObject>
        <foreignObject width="100" height="100">
          <div class="ledger" xmlns="http://www.w3.org/1999/xhtml">
            <p class="miner">A: {{ A }}</p>
            <p>B: {{ B }}</p>
            <p>C: {{ C }}</p>
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
      C: this.ledger.C
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
    cssProps() {
      return {
        '--block-x': this.x + 'px',
        '--block-y': this.y + 'px',
        '--block-width': this.width + 'px',
        '--block-height': this.height + 'px'
      }
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
  width: var(--block-width);
  height: var(--block-height);
}
svg {
  overflow: visible;
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
