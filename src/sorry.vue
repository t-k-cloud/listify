<template>
<div>
  <h1>
    Sorry, {{why}}
  </h1>
  <div v-if="joke">
    <joke class="joke"></joke>
  </div>
</div>
</template>

<script>
export default {
  props: ['why', 'joke'],
  data: function () {
    return {}
  }
}
</script>

<style scoped>
.joke {
  color: grey;
}
</style>
