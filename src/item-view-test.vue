<template>
<div>
  <h1>
    {{json.title}}
  </h1>
</div>
</template>

<script>
export default {
  props: ['json', 'engine'],
  data: function () {
    return {}
  }
}
</script>
