<template>
  <div v-if="$route.path == path || $route.path == '/'" class="main-menu-item">
    <span v-if="$route.path == path">
      <span class="clickable" @click="$router.push({path:'/'})">&lt;返回</span>
      &nbsp;
      <span>{{ title }}</span>
    </span>
    <span v-if="$route.path == '/'">
      <span class="clickable" @click="$router.push({path})">{{ title }}</span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'MainMenuItem',

  data () {
    return {
    }
  },

  props: {
    title: {
      type: String
    },
    path: {
      type: String
    },
  }
}
</script>

<style scoped>
.main-menu-item {
  padding: 1em;
  color: white;
  background-color: #1b1b22;
  text-align: left;
  margin-top: 0.2em;
}
.main-menu-item::before {
  content: '';
  display: inline-block;
  width: 0.3em;
  height: 1.2em;
  vertical-align: middle;
  margin-right: 0.5em;
  background-color: #2f6392;
}
.clickable {
  cursor: pointer;
}
</style>
