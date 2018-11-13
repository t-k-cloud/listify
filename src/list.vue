<template>
<div>
  <div style="position: relative;">
    <h3> {{ '/' + path_arr().join('/') }} </h3>
    <div style="position: absolute; right: 0; top: 0">
    <button>Open dir</button>
    <button>Sort by</button>
    <button>Delete all</button>
    </div>
  </div>
  <hr/>
  <div v-for="i in items" style="position: relative;">
    <component v-bind:is="bindViewComponent" v-bind:json="i"></component>
    <div style="position: absolute; right: 0; top: 0">
        <input v-if="!i.is_dir" type="button" value="C"/>
        <input v-if="!i.is_dir" type="button" value="X"/>
    </div>
    <hr/>
  </div>

<pre v-show="env.debug">
{{items}}
</pre>

</div>
</template>

<script>
export default {
  props: ['detailed'],
  data: function () {
    return {
      'items': [
        {
          'title': 'todo',
          'description': 'this is a todo list',
          'time': '1234-12-32',
          'is_dir': false
        },
        {
          'title': 'post',
          'description': 'A post here',
          'time': '1989-12-12',
          'is_dir': false
        },
        {
          'title': 'reminder',
          'description': 'some reminder here',
          'time': '89-12-12',
          'is_dir': true
        },
      ],
      env: {
        'debug': true,
        'refresh': 0,
        'view-engine': 'plain-view'
      }
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
        return 'detail-' + this.env['view-engine']
      else
        return 'brief-' + this.env['view-engine']
    }
  }
}
</script>
