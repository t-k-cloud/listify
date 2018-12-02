<template>
<v-app>
  <div>
  <v-container id="navbar" style="word-break: break-all">
    <v-layout row wrap class="subheading">
      <v-icon>home</v-icon> &nbsp;
      <span v-for="(bread, idx) in path_arr">
        <span v-if="idx == path_arr.length - 1">
          <a class="clickable" @click="update(); scrolltop()">
            {{bread}}
          </a>
        </span>
        <span v-else>
          <router-link class="clickable" v-bind:to="get_navi_addr(idx)">
            {{bread}}
          </router-link> /
        </span>
      </span>
      <span style="margin-left: 10px"> (page {{page}}) </span>
    </v-layout>
  </v-container>

  <v-container id="navbar-next">
    <v-layout row wrap justify-space-between v-show="!singleJsonFile">
      <v-flex d-flex md9>
        <v-select small :items="sortable_keys" label="Sort" v-model="sortby"/>
        <v-checkbox label="desc" v-model="descending"/>
        <v-checkbox label="debug" v-model="debug"/>
      </v-flex>
      <v-flex d-flex md3>
        <v-btn small @click="openDir()" top>Droppy</v-btn>
        <delay-btn class="item-btn" label="Empty folder" top @fire="deleAll()"/>
      </v-flex>
    </v-layout>
  </v-container>

  <v-container grid-list-xl>
  <v-layout column>
  <v-flex v-for="i in locate(sorted_items)" :key="mk_item_key(i)">
    <!-- here ":key" prevents vue re-use dom elements -->
    <v-card>
    <v-card-text v-bind:class="{clickable: !singleJsonFile}"
                 style="word-break: break-all" @click="click_item(i)">
      <component v-bind:is="bindViewComponent" v-bind:json="i"></component>
    </v-card-text>
    <v-card-actions v-if="!singleJsonFile">
      <v-layout justify-end row v-if="!i._dir">
        <v-btn small @click="clone(i)" v-if="env.allow_clone">clone</v-btn>
        <delay-btn class="item-btn" label="Delete" @fire="dele(i)"/>
      </v-layout>
      <v-layout justify-end row v-else>
        <delay-btn class="item-btn" label="Delete folder" @fire="dele(i)"/>
      </v-layout>
    </v-card-actions>
    </v-card>
  </v-flex>
  </v-layout>
  </v-container>
  </div>

  <v-container fill-height>
  <v-layout/>
    <v-flex>
      <v-pagination v-model="page" circle
        :total-visible="5" :length="total_pages"
      ></v-pagination>
    </v-flex>
  </v-layout>
  </v-container>

  <v-snackbar v-model="snackbar" @click="snackbar = false" multi-line>
    <span style="user-select: none">{{ snackbar_text }}</span>
  </v-snackbar>

<pre v-if="debug">
{{items}}
</pre>

</v-app>
</template>

<script>
import axios from 'axios' /* AJAX request lib */

const prefix_uri = '/listify'
const MAX_ITEMS_PER_PAGE = 15

export default {
  methods: {
    set_unset: function () {
      /* set default view-engine if not set */
      if (!this.env['view-engine'])
        this.env['view-engine'] = "plain-view"
      /* set default sort key */
      if (this.sortby === '' && this.env.sortable_keys)
        this.sortby = this.env.sortable_keys[0];
      /* set page */
      this.page = parseInt(this.$route.query['page']) || 1
    },
    scrolltop: function () {
      window.scrollTo(0, 0);
    },
    update: function () {
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
      var link = '/droppy/#/'
      link += this.path_arr.join('/')
      // console.log('[open] ' + link)
      window.open(link, '_blank');
    },
    mk_item_key: function (j) {
      return j._file || j._dir
    },
    clone: function (item) {
      var path = prefix_uri + '/clone/'
          path += this.path_arr.join('/')
          path += '/' + item._file
      this.$router.push({path})
    },
    dele: function (item) {
      var rest = prefix_uri + '/delete/'
      rest += this.path_arr.join('/')
      const basename = item._file || item._dir
      rest += '/' + basename
      var vm = this
      axios.get(rest).
      then((res) => {
        vm.update()
        vm.snackbar = true
        vm.snackbar_text = `Deleted: ${res.data.basename}`
      })
    },
    deleAll: function () {
      // console.log("delete all")
      var restList = []
      var vm = this
      this.items.forEach((item, idx) => {
        if (item._file) { // not a dir
          var rest = prefix_uri + '/delete/'
          rest += vm.path_arr.join('/')
          rest += '/' + item._file
          restList.push(rest)
        }
      })
      restList.forEach((rest, idx) => {
          axios.get(rest).
          then((res) => {
            this.clicked_idx = -1;
            vm.update()
            vm.snackbar = true
            vm.snackbar_text = `Deleted: ${res.data.basename}`
          })
      })
    },
    get_navi_addr: function (idx) {
      var prefix_arr = this.path_arr.slice(0, idx + 1)
      return prefix_uri + '/list/' + prefix_arr.join('/')
    },
    click_item: function (item) {
      if (item._dir) {
        this.$router.push({
          path: this.path + '/' + item._dir
        })
      } else if (this.env.detailed && !this.singleJsonFile) {
        this.$router.push({
          path: this.path + '/' + item._file
        })
      }
    },
    allow_sort: function (key) {
      if (this.env.sortable_keys)
        return this.env.sortable_keys.includes(key);
      else
        return true;
    },
    locate: function (items) {
      if (this.debug)
        return items
      const begin = (this.page - 1) * MAX_ITEMS_PER_PAGE
      const end = Math.min(items.length, begin + MAX_ITEMS_PER_PAGE)
      return items.slice(begin, end)
    }
  },
  mounted: function () {
    this.update()

    window.addEventListener('scroll', (event) => {
      this.scrollY = Math.round(window.scrollY);
    });
  },
  beforeRouteUpdate: function (to, from, next) {
    this.name = to.params.name
    next()
    this.update()
  },
  watch: {
    page: function (val) {
      this.$router.push({query: { page: val}});
    },
    scrollY: function (val) {
      var navbar = document.getElementById("navbar")
      var next = document.getElementById("navbar-next")
      if (navbar === null)
        return
      // console.log(`${window.pageYOffset} >= ${navbar.offsetHeight}`)
      if (window.pageYOffset > navbar.offsetHeight) {
        navbar.classList.add('stick-top')
        next.style.cssText = `margin-top: ${navbar.offsetHeight}px`
      } else {
        navbar.classList.remove('stick-top')
        next.style.cssText = `margin-top: 0`
      }
    }
  },
  data: function () {
    return {
      'descending': false,
      'snackbar': false,
      'snackbar_text': '',
      'sortby': '',
      'page': 1,
      'scrollY': 0,
      'items': [],
      env: {},
      debug: false
    }
  },
  computed: {
    total_pages: function () {
      let pages = this.items.length / MAX_ITEMS_PER_PAGE
      return Math.ceil(pages)
    },
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
      var arr = path.split('/')
      arr.splice(0, 3)
      arr = arr.map(x => decodeURIComponent(x))
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
          if (this.allow_sort(k) && !ret.includes(k))
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
#navbar {
  background-color: white;
  box-shadow: 0px 5px 5px #aaaaaa;
}
div.stick-top {
  width: 100%;
  left: 50%;
  transform: translate(-50%);
  z-index: 99999;
  position: fixed;
  top: 0;
}
.clickable {
  cursor: pointer;
}
</style>
