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
    </v-layout>
  </v-container>

  <v-container>
    <v-layout row wrap justify-space-between v-show="!singleJsonFile">
      <v-flex d-flex md9>
        <v-select small :items="sortable_keys" label="Sort" v-model="sortby"/>
        <v-checkbox label="desc" v-model="descending"/>
        <v-checkbox label="debug" v-model="debug"/>
      </v-flex>
      <v-flex d-flex md3>
        <v-btn @click="openDir()" top>Open in Droppy</v-btn>
      </v-flex>
    </v-layout>
  </v-container>

  <v-container grid-list-xl>
  <v-layout column>
  <v-flex v-for="(i, idx) in locate(sorted_items)" :key="mk_item_key(idx, i)">
    <!-- here ":key" prevents vue re-use dom elements -->
    <v-card>
    <v-card-text v-bind:class="{clickable: !singleJsonFile}"
                 style="word-break: break-all" @click="click_item(i, idx)">
      <component v-bind:is="bindViewComponent" v-bind:json="i"></component>
    </v-card-text>
    <v-card-actions v-if="!singleJsonFile">
      <v-layout justify-end row v-if="!i._dir">
        <v-btn small @click="clone(idx)" v-if="env.allow_clone">clone</v-btn>
        <delay-btn class="item-btn" label="Delete" @fire="dele(idx)"/>
      </v-layout>
      <v-layout justify-end row v-else>
        <delay-btn class="item-btn" label="Delete folder" @fire="dele(idx)"/>
      </v-layout>
    </v-card-actions>
    </v-card>
  </v-flex>
  </v-layout>
  </v-container>
  </div>

  <v-container fill-height>
  <v-layout/>
    <v-flex v-show="total_pages > 1">
      <v-pagination
        v-model="page"
        :length="total_pages"
      ></v-pagination>
    </v-flex>
  </v-layout>
  </v-container>

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
      if (this.page > this.total_pages)
        this.page = this.total_pages
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
    clone: function (idx) {
      const item = this.items[idx]
      var path = prefix_uri + '/clone/'
          path += this.path_arr.join('/')
          path += '/' + item._file
      this.$router.push({path})
    },
    mk_item_key: function (idx, j) {
      return j._file || j._dir
    },
    dele: function (idx) {
      const item = this.items[idx]
      var rest = prefix_uri + '/delete/'
      rest += this.path_arr.join('/')
      if (!this.singleJsonFile) {
        const basename = item._file || item._dir
        rest += '/' + basename
      }
      // console.log('[delete] ' + rest)
      var vm = this
      axios.get(rest).
      then((res) => {
        vm.update()
      })
    },
    get_navi_addr: function (idx) {
      var prefix_arr = this.path_arr.slice(0, idx + 1)
      return prefix_uri + '/list/' + prefix_arr.join('/')
    },
    click_item: function (item, idx) {
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
      this.$router.push({query: { page: this.page}});
    },
    scrollY: function (val) {
      var navbar = document.getElementById("navbar")
      if (navbar === null)
        return
      // console.log(`${window.pageYOffset} >= ${navbar.offsetTop}`)
      if (window.pageYOffset > navbar.offsetTop) {
        navbar.classList.add('stick-top')
      } else {
        navbar.classList.remove('stick-top')
      }
    }
  },
  data: function () {
    return {
      'descending': false,
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
