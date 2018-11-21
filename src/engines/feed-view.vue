<template>
<span>
  {{json.title}}
  <br/>
  <span class="small">fetch time: {{json['fetch-time']}}</span>
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
span.small {
  font-size: 0.8em;
  color: grey;
}
</style>
