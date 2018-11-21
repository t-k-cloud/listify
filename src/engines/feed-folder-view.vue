<template>
<span>
  <div v-if="json._dir">
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
      <div>
        {{json.title}}
        <span class="extra-small"> {{json.url}} </span>
      </div>
      <div>
        <span class="small">
          unread: {{json._dir_num_files - 2}},
          failed: {{json.failed}},
          last-update: {{json['last-update']}}
        </span>
      </div>
    </div>
    <div>
      <a target="_blank" v-bind:href="json.url" @click.stop=""> {{json.url}} </a>
    </div>
  </div>
  <div v-else>
    {{json}}
  </div>
</span>
</template>

<script>
export default {
  props: ['json']
}
</script>

<style scoped>
a {
  font-size: 1.4em;
}
span.small {
  font-size: 0.8em;
  color: grey;
}
span.extra-small {
  font-size: 0.6em;
  color: grey;
}
</style>
