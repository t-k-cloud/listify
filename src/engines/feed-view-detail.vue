<template>
<span>
  {{json.title}}
  <br/>
  <a target="_blank" v-bind:href="json.link" @click.stop=""> {{json.link}} </a>
  <p v-html="convert_html(json.desc)"></p>
</span>
</template>

<script>
var absolutify = require('absolutify')

export default {
  props: ['json'],
  methods: {
    convert_html: function(content) {
      const fields = this.json.link.split('/')
      const link_root = [fields[0], fields[2]].join('//')
      console.log('[link root] ' + link_root)
      return absolutify(content, link_root)
    }
  }
}
</script>

<style scoped>
a {
  font-size: 1.4em;
}
</style>
