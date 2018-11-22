<template>
<div>
<h2>{{ $route.path }}</h2>
<div v-for="k in Object.keys(json)">
  <p>
    <b>{{k}}</b>
    <a @click="quote(k)">quote</a>
  </p>
  <input type="search" v-model="json[k]"/>
</div>
<div style="display: flex; margin-top: 25px">
  <input type="button" value="save"  @click="save()"/>
  <input type="button" value="reset" @click="reset()"/>
</div>
<pre>{{resp}}</pre>
<pre v-if="debug" style="white-space: pre-wrap;">
{{hierarchy_json}}
</pre>
</div>
</template>

<script>
import axios from 'axios' /* AJAX request lib */
const uuid = require('uuid/v1') /* UUID lib */

const prefix_uri = '/listify'

export default {
  methods: {
    linear: function (json) {
      var j = {}
      Object.keys(json).forEach((k, i) => {
        j[k] = JSON.stringify(json[k])
      })
      return j
    },
    update: function () {
      var path = this.path_arr.join('/')
      path = prefix_uri + '/list/' + path
      console.log('[update] ' + path)
      var vm = this
      /* send GET request */
      axios.get(path).
      then((res) => {
        const data = res.data
        // console.log(j)
        if (data.list.length > 0) {
          var j = data.list[0]
          j._file = uuid() + '.json'
          vm.reset_json = {...j} // copy JSON
          vm.json = vm.linear(j)
        }
      })
    },
    quote: function (k) {
      this.json[k] = `"${this.json[k]}"`
    },
    save: function () {
      const fname = this.hierarchy_json._file
      var dir_arr = this.path_arr.slice()
      dir_arr.pop()
      var path = dir_arr.join('/')
      path = prefix_uri + '/save/' + path + '/' + fname
      var vm = this
      console.log('[save] ' + path)
      /* send POST request */
      axios.post(path, this.hierarchy_json).
      then((res) => { vm.resp = res.data }).
      catch((err) => { vm.resp = err; })
    },
    reset: function () {
      const r = confirm('Sure to reset?')
      if (r === true) {
        this.reset_json._file = uuid() + '.json'
        this.json = this.linear(this.reset_json)
      }
    }
  },
  mounted: function () {
    this.update()
  },
  computed: {
    path_arr: function () {
      const path = this.$route.path
      const arr = path.split('/')
      arr.splice(0, 2)
      return arr
    },
    hierarchy_json: function () {
      var j = {}
      Object.keys(this.json).forEach((k, i) => {
        try {
          j[k] = JSON.parse(this.json[k])
        } catch (e) {}
      })
      return j
    }
  },
  data: function () {
    return {
      debug: true,
      resp: '[yet to save]',
      reset_json: {},
      json: {}
    }
  }
}
</script>
<style scoped>
input {
  flex: 1;
  width: 100%;
  min-height: 25px;
  font-size: 17px;
}
a {
  color: blue;
  float: right;
}
</style>
