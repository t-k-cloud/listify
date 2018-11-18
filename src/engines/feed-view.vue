<template>
<span>
  {{json.title}}
  <br/>
  <a target="_blank" v-bind:href="json.link" @click.stop=""> {{json.link}} </a>
</span>
</template>

<script>
export default {
  props: ['json']
}
</script>

<style scoped>
a {
  font-size: 1.4em;
}
</style>
