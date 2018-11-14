<template>
<div>
  <h3 style="word-wrap: break-word">
  <span v-for="(p, idx) in path_arr">
    <span v-if="idx == path_arr.length - 1">
      <a class="dir" @click="update()">{{p}}</a>
    </span>
    <span v-else>
      <router-link class="dir" v-bind:to="get_navi_addr(idx)">{{p}}</router-link> /
    </span>
  </span>
  </h3>
  <div style="position: relative;" v-if="!singleJsonFile">
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
         v-if="env.detailed && !singleJsonFile"/>
        <input style="flex: 1" type="button" value="Dele" @click.stop="dele(idx)"/>
    </div>
    <hr/>
  </div>
  </div>

<pre v-show="env.debug" style="white-space: pre-wrap;">
{{items}}
</pre>

</div>
</template>

<script>
import axios from 'axios' /* AJAX request lib */

export default {
  methods: {
    set_unset: function () {
      /* set default view-engine if not set */
      if (!this.env['view-engine'])
        this.env['view-engine'] = "plain-view"
      /* set default_sort_key if not set */
      if (this.env.default_sort_key)
        this.sortby = this.env.default_sort_key;
      else if (this.items.length > 0) {
        this.sortby = Object.keys(this.items[0])[0];
      }
    },
    update: function () {
      console.log('[update] ' + this.path)
      var vm = this
      axios.get(this.path).
      then((res) => {
        const j = res.data
        // console.log(j)
        vm.env = j['env']
        vm.items = j['list']
        vm.set_unset()
      })
    },
    openDir: function () {
      console.log("open dir")
    },
    deleAll: function () {
      console.log("delete all")
    },
    clone: function (idx) {
      console.log("clone " + idx)
    },
    detail: function (idx) {
      const item = this.items[idx]
      this.$router.push({
        path: this.path + '/' + item._file
      })
    },
    dele: function (idx) {
      console.log("dele " + idx)
    },
    get_navi_addr: function (idx) {
      var prefix_arr = this.path_arr.slice(0, idx + 1)
      return '/list/' + prefix_arr.join('/')
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
    this.update()
  },
  beforeRouteUpdate: function (to, from, next) {
    this.name = to.params.name
    next()
    this.update()
  },
  watch: {
    descending: function (val) {
      this.clicked_idx = -1
    },
    sortby: function (val) {
      this.clicked_idx = -1
    }
  },
  data: function () {
    return {
      'descending': false,
      'sortby': '',
      'clicked_idx': -1,
      'items': [],
      env: {}
    }
  },
  computed: {
    singleJsonFile: function () {
      const l = this.path_arr.length
      const base = this.path_arr[l - 1]
      if (base.split('.').pop() === 'json')
        return true
      else
        return false
    },
    bindViewComponent: function () {
      if (this.singleJsonFile)
        return this.env['view-engine'] + '-detail'
      else
        return this.env['view-engine']
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
      if (this.items.length == 0) return []
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
  background-color: #eff0f1;
}
.dir:hover {
  cursor: pointer;
}
.dir, .div:visited {
  color: blue;
}
</style>
