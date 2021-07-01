<template>
  <div class="content">
    <span class="message">{{ message }}</span> from {{ version }} !
  </div>
</template>

<script>
export default {
  name: 'Message',
  data () {
    return {
      message: 'Hello',
      version: ''
    }
  },
  mounted () {
    this.version = 'Vue ' + require('myData').vueVersion
  }
}
</script>

<style scoped>
.content {
  text-align: center;
  color: white;
}
.message {
  font-weight: bold;
}
</style>
