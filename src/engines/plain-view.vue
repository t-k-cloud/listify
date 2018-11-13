<template>
<span>
  <span v-if="json._dir">
  ({{json.unread}} unread)
  </span>

  <span v-else>
  [ {{json.title}}, {{json.description}} {{json.time}} ] <br/>
  {{json.url}}
  </span>
</span>
</template>

<script>
export default {
  props: ['json']
}
</script>
