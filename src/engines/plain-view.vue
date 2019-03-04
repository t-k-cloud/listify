<template>
<span>
  <span v-if="json._dir">
  {{json._dir}}/
  </span>

  <span v-else>
  {{json._file}}
  <div v-if="detail" style="padding-top: 15px;">
    <p v-html="json.desc"></p>
  </div>
  </span>
</span>
</template>

<script>
export default {
  props: ['json', 'detail']
}
</script>
