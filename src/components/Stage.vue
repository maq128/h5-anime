<template>
  <div class="stage" :style="cssProps" ref="stage">
    <!--
    <template v-for="(block) in blocks">
      <component :is="BlockClass" :key="block.name"></component>
    </template>
    -->
  </div>
</template>

<script>
import Vue from 'vue'
import Block from './Block.vue'
export default {
  name: 'Stage',
  data () {
    return {
      blocks: []
    }
  },
  components: {
    // Block
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
    play () {
      this.removeAll()
      var ledger = {
        A: 10,
        B: 6,
        C: 9
      }
      for (var i=0; i< 5; i++) {
        var miner = 'ABC'[Math.floor(Math.random() * 3)]
        var propsData = {
          x: 100 + i * 160,
          y: 200,
          miner,
          ledger
        }
        // this.blocks.push(propsData)
        var block = new this.BlockClass({ propsData })
        block.$mount()
        this.$refs.stage.appendChild(block.$el)
      }
    },
    removeAll () {
      console.log(this.$children)
    }
  },
  created () {
    this.BlockClass = Vue.extend(Block)
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
