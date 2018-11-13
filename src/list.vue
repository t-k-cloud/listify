<template>
<div>
  <h3 style="word-wrap: break-word"> {{ '/' + path_arr.join('/') }} </h3>
  <div style="position: relative;">
    <select v-model="sortby">
      <option v-for="key in sortable_keys"
      @click="sortBy()" v-bind:value="key">
        Sort by "{{key}}"
      </option>
    </select>
    <input type="checkbox" v-model="descending">Desc</input>
    <div style="position: absolute; right: 0; top: 0">
      <button @click="openDir()">Open dir</button>
      <button @click="deleAll()">Delete all</button>
    </div>
  </div>

  <hr/>

  <div style="position: relative;">
  <div v-for="(i, idx) in sorted_items" class="item" @click="click_item(i, idx)">
    <span class="dir" v-if="i._dir">
      {{i._dir}}/
    </span>
    <component v-bind:is="bindViewComponent" v-bind:json="i"></component>
    <div style="display: flex" v-if="!i._dir && idx == clicked_idx">
        <input style="flex: 1" type="button" value="Clone" @click.stop="clone(idx)"/>
        <input style="flex: 1" type="button" value="Detail" @click.stop="detail(idx)"
         v-if="env.detailed"/>
        <input style="flex: 1" type="button" value="Dele" @click.stop="dele(idx)"/>
    </div>
    <hr/>
  </div>
  </div>

<pre v-show="env.debug">
{{items}}
</pre>

</div>
</template>

<script>
export default {
  methods: {
    clone: function (idx) {
      console.log("clone " + idx)
    },
    detail: function (idx) {
      console.log("detail " + idx)
    },
    dele: function (idx) {
      console.log("dele " + idx)
    },
    click_item: function (item, idx) {
      if (item._dir)
        this.$router.push({
          path: this.path + '/' + item._dir
        })
      else if (this.clicked_idx == idx)
        this.clicked_idx = -1;
      else
        this.clicked_idx = idx;
    },
    allow_sort: function (key) {
      if (this.env.no_sort_keys)
        return !this.env.no_sort_keys.includes(key);
      else
        return true;
    }
  },
  mounted: function () {
    if (this.env.default_sort_key) {
      console.log(this.env.default_sort_key)
      this.sortby = this.env.default_sort_key;
    }
  },
  props: ['detailed'],
  data: function () {
    return {
      'descending': false,
      'sortby': '',
      'clicked_idx': -1,
      'items': [
        {
          'title': 'todo',
          'description': 'this is a todo list',
          'url': 'https://google.com',
          'time': 1234,
        },
        {
          'title': 'post',
          'description': 'A post here, bla bla bla bla',
          'url': 'https://baidu.com',
          'time': 1989,
        },
        {
          'unread': 3,
          '_dir': 'others'
        },
        {
          'title': 'reminder',
          'description': 'some reminder here',
          'url': 'https://dodo.com',
          'time': 3721,
        },
      ],
      env: {
        'no_sort_keys': ['title', 'description'],
        'default_sort_key': 'time',
        'debug': false,
        'refresh': 0,
        'detailed': true,
        'view-engine': 'plain-view'
      }
    }
  },
  computed: {
    bindViewComponent: function () {
      if (this.detailed)
        return 'detail-' + this.env['view-engine']
      else
        return 'brief-' + this.env['view-engine']
    },
    path_arr: function () {
      const path = this.$route.path
      const arr = path.split('/')
      arr.splice(0, 2)
      return arr
    },
    path: function () {
      const path = this.$route.path
      /* strip trailing slash */
      return path.replace(/\/$/, "")
    },
    sortable_keys: function () {
      var set = {}
      this.items.forEach((item, idx) => {
        Object.keys(item).forEach((k) => {
          if (this.allow_sort(k)) set[k] = true
        })
      })
      return Object.keys(set)
    },
    sorted_items: function (items) {
      var vm = this;
      return this.items.sort(function (a, b) {
        const a_val = a[vm.sortby] || '0'
        const b_val = b[vm.sortby] || '0'
        if (vm.descending)
          return (a_val < b_val) ? 1 : -1
        else
          return (a_val < b_val) ? -1 : 1
      })
    }
  }
}
</script>
<style>
div.item {
  padding-top: 30px;
}
div.item:active {
  background-color: grey;
}
span.dir {
  color: blue;
}
</style>
