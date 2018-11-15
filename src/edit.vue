<template>
<div>
<h3>Edit JSON</h3>
</div>
</template>

<script>
import axios from 'axios' /* AJAX request lib */

export default {
  methods: {
  },
  mounted: function () {
  },
  beforeRouteUpdate: function (to, from, next) {
    this.name = to.params.name
    next()
    this.update()
  },
  watch: {
  },
  data: function () {
    return {
    }
  },
  computed: {
  }
}
</script>
<style>
</style>
