<template>
<div>
  <h1>
    list view: {{ path_arr().join('/') }}
  </h1>
  <div v-for="i in items">
    {{i}}, {{brief_view}}
  </div>
</div>
</template>

<script>
// <item-view v-bind:json="i" v-bind:engine="brief_view"/>
export default {
  data: function () {
    return {
      'items': [
        {
          'title': 'todo',
          'description': 'this is a todo list',
          'time': '1234-12-32',
        },
        {
          'title': 'post',
          'description': 'A post here',
          'time': '1989-12-12',
        },
        {
          'title': 'reminder',
          'description': 'some reminder here',
          'time': '89-12-12',
        },
      ],
      'brief_view': 'item-test'
    }
  },
  methods: {
    path_arr: function () {
      const path = this.$route.path
      const arr = path.split('/')
      arr.splice(0, 2)
      return arr
    }
  }
}
</script>
