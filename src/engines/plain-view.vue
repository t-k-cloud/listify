<template>
<div>
[ {{json.title}}, {{json.description}} {{json.time}} ]
</div>
</template>

<script>
export default {
  props: ['json'],
  data: function () {
    return {}
  }
}
</script>
