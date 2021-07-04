import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

let router = new Router({
  routes: [{
      path: '/',
      component: null,
    }, {
      path: '/bitcoin-forks',
      component: resolve => { require(['@/components/StageBitcoinForks.vue'], resolve) }
    }, {
      path: '/audio-subtitles',
      component: resolve => { require(['@/components/StageAudioSubtitles.vue'], resolve) }
    }, {
      path: '*',
      component: null
  }]
})

export default router
