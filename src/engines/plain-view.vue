<template>
<span>
  <span v-if="json._dir">
  {{json._dir}}/
  </span>

  <span v-else>
  {{json._file}}
  </span>
</span>
</template>

<script>
export default {
  props: ['json']
}
</script>
