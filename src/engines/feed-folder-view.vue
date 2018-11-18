<template>
<span>
  <span v-if="json._dir">
    {{json.title}}
    <span class="small"> {{json.url}} </span>
    <span style="float: right">
      (unread: {{json.unread}}) (failed: {{json.failed}})
    </span>
    <br/>
    <a target="_blank" v-bind:href="json.url" @click.stop=""> {{json.url}} </a>
  </span>
  <span v-else>
  {{json}}
  </span>
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
  font-size: 0.6em;
  color: grey;
}
</style>
