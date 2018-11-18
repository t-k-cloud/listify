<template>
<span>
  <h2>{{json.title}}</h2>
  <a target="_blank" v-bind:href="json.link" @click.stop=""> {{json.link}} </a>
  <br/><br/>
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

<style>
img { max-width: 100%; max-height: 500px; }
</style>
