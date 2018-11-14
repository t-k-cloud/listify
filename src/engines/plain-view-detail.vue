<template>
<pre>{{prettyJson}}</pre>
</template>

<script>
export default {
  props: ['json'],
  computed: {
    prettyJson: function () {
      return JSON.stringify(this.json, null, 2);
    }
  }
}
</script>
