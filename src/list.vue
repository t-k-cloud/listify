<template>
<div>
  <h1>
    list view: {{ path_arr().join('/') }}
  </h1>
  <div v-for="i in items">
    <component v-bind:is="bindViewComponent" v-bind:json="i"></component>
  </div>
</div>
</template>

<script>
// <item-view v-bind:json="i" v-bind:engine="brief_view"/>

export default {
  props: ['detailed'],
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
      'view-engine': 'plain-view'
    }
  },
  methods: {
    path_arr: function () {
      const path = this.$route.path
      const arr = path.split('/')
      arr.splice(0, 2)
      return arr
    }
  },
  computed: {
    bindViewComponent: function () {
      if (this.detailed)
        return 'detail-' + this['view-engine']
      else
        return 'brief-' + this['view-engine']
    }
  }
}
</script>
