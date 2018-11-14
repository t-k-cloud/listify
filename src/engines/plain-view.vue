<template>
<span>
  <span v-if="json._dir">
  {{json}}
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
