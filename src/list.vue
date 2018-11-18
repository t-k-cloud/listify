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
  <div style="display: flex; flex-wrap: wrap;" v-if="!singleJsonFile">
    <div style="">
      <select v-model="sortby">
        <option v-for="key in sortable_keys"
        @click="sortBy()" v-bind:value="key">
          Sort by "{{key}}"
        </option>
      </select>
      <input type="checkbox" v-model="descending">Desc</input>
    </div>
    <div style="">
      <input type="checkbox" v-model="show_folder_dele">DirBtn</input>
    </div>
    <div style="margin-left: auto;">
      <button @click="openDir()">Open dir</button>
      <delay-btn @click="deleAll()" label="Delete all" @fire="deleAll()"/>
    </div>
  </div>

  <hr/>

  <div style="position: relative;">
  <div v-for="(i, idx) in sorted_items" :key="mk_item_key(idx, i)">
    <!-- here ":key" prevents vue re-use dom elements -->
    <div class="item" @click="click_item(i, idx)">
      <component v-bind:is="bindViewComponent" v-bind:json="i"></component>
    </div>
    <div v-if="!i._dir">
      <div style="display: flex" v-show="idx == clicked_idx">
        <input class="item-btn" type="button" value="Clone" @click="clone(idx)"
         v-if="env.allow_clone"/>
        <input class="item-btn" type="button" value="Detail" @click="detail(idx)"
         v-if="env.detailed && !singleJsonFile"/>
        <delay-btn class="item-btn" label="Delete" @fire="dele(idx)"
         @active="dele_active($event)" @clear="dele_clear($event)"/>
      </div>
    </div>
    <div v-else>
      <div style="display: flex" v-if="show_folder_dele">
        <delay-btn class="item-btn" label="Delete folder" @fire="dele(idx)"
         @active="dele_active($event)" @clear="dele_clear($event)"/>
      </div>
    </div>
    <hr/>
  </div>
  </div>

<pre v-show="debug" style="white-space: pre-wrap;">
{{items}}
{{env}}
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
      /* set default sort key */
      if (this.items.length > 0)
        this.sortby = this.env.sortable_keys[0];
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
        this.clicked_idx = -1
      })
    },
    openDir: function () {
      var link = '/droppy/#/'
      link += this.path_arr.join('/')
      console.log('[open] ' + link)
      window.open(link, '_blank');
    },
    deleAll: function () {
      console.log("delete all")
      var restList = []
      var vm = this
      this.items.forEach((item, idx) => {
        if (item._file) { // not a dir
          var rest = '/delete/'
          rest += vm.path_arr.join('/')
          rest += '/' + item._file
          restList.push(rest)
        }
      })
      restList.forEach((rest, idx) => {
        axios.get(rest).
        then((res) => { vm.update() })
      })
    },
    clone: function (idx) {
      const item = this.items[idx]
      var path = '/clone/'
          path += this.path_arr.join('/')
          path += '/' + item._file
      this.$router.push({path})
    },
    detail: function (idx) {
      const item = this.items[idx]
      this.$router.push({
        path: this.path + '/' + item._file
      })
    },
    mk_item_key: function (idx, j) {
      return j._file || j._dir
    },
    dele_active: function (ev) {
      var btn_elm = ev.toElement
      var item_elm = btn_elm.parentElement.parentElement.parentElement
      item_elm.style['background-color'] = "grey"
    },
    dele_clear: function (ev) {
      var btn_elm = ev.toElement
      var item_elm = btn_elm.parentElement.parentElement.parentElement
      item_elm.style['background-color'] = "white"
    },
    dele: function (idx) {
      const item = this.items[idx]
      var rest = '/delete/'
      rest += this.path_arr.join('/')
      if (!this.singleJsonFile) {
        const basename = item._file || item._dir
        rest += '/' + basename
      }
      console.log('[delete] ' + rest)
      var vm = this
      axios.get(rest).
      then((res) => { vm.update() })
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
      if (this.env.sortable_keys)
        return this.env.sortable_keys.includes(key);
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
      'show_folder_dele': false,
      'sortby': '',
      'clicked_idx': -1,
      'items': [],
      env: {},
      debug: false
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
      var ret = []
      if (this.items.length == 0) return []
      this.items.forEach((item, idx) => {
        Object.keys(item).forEach((k) => {
          if (this.allow_sort(k))
            ret.push(k)
        })
      })
      return ret
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
  padding-top: 10px;
  padding-bottom: 10px;
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
input.item-btn {
  min-height: 30px;
  flex: 1;
  margin-top: 20px;
}
</style>
