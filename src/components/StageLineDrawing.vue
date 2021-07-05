<template>
  <div>
    <div class="stage" :style="cssProps">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 50 760 430">
        <path ref="path" fill="none" stroke="white" stroke-width="3" d="M188,269C188,269,246,271,258,271C270,271,276,269,278,261C278,260,278,260,278,259C278,255,277,252,274,249C272,247,287,244,287,235C287,228,282,223,282,223C282,223,295,219,295,208C295,203,294,198,291,194C288,190,300,187,300,177C300,168,292,158,278,158L231,158C237,141,239,124,240,107C240,87,229,74,217,74C208,74,210,85,208,96C206,114,200,131,190,146C182,157,162,179,140,185C125,189,113,200,113,215L113,285L138,285L138,162L80,162L80,248"></path>
      </svg>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import anime from 'animejs'

export default {
  name: 'StageLineDrawing',

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
  },

  mounted () {
    anime({
      targets: this.$refs.path,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 3000,
      direction: 'alternate',
      loop: true
    });
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
</style>
