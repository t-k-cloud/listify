/*
 * The default export for the vue NPM package is
 * runtime only, as here we need the template compiler,
 * we include vue in the following way, which includes
 * both the runtime and the template compiler.
 */
import Vue from 'vue'
/* close console.log on production tips */
Vue.config.productionTip = false

/* vuetify */
import Vuetify from 'vuetify'
import 'material-icons/iconfont/material-icons.css'
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify)

import Router from 'vue-router'
import Sorry from './sorry.vue'
import ListView from './list.vue'
import CloneView from './clone.vue'
import DelayBtn from './delay-btn.vue'
Vue.component('delay-btn', DelayBtn)

/* import view engines */
import plainView from './engines/plain-view.vue'
import plainViewDetail from './engines/plain-view-detail.vue'
Vue.component('plain-view', plainView)
Vue.component('plain-view-detail', plainViewDetail)

import feedFolderView from './engines/feed-folder-view.vue'
import feedView from './engines/feed-view.vue'
import feedViewDetail from './engines/feed-view-detail.vue'
Vue.component('feed-folder-view', feedFolderView)
Vue.component('feed-view', feedView)
Vue.component('feed-view-detail', feedViewDetail)

const components = {
  DelayBtn,
  plainView,
  feedFolderView,
}
/* =================== */

/* router settings */
Vue.use(Router)

const scrollBehavior = function (to, from, savedPosition) {
  // console.log(`Route ${from.path} => ${to.path}`)

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (savedPosition)
        resolve(savedPosition)
      else
        resolve({ x: 0, y: 0 })
    }, 500)
  })
}

const prefix_uri = '/listify'

var routes = new Router({
  mode: 'history',
  scrollBehavior,
  routes: [
    { path: prefix_uri + '/list/*', component: ListView },
    { path: prefix_uri + '/clone/*', component: CloneView },
    { path: prefix_uri + '/private',
      component: Sorry, props: {why: "this is private place!"}  },
    { path: prefix_uri + '/*',
      component: Sorry, props: {why: "404 not found!"}  }
  ]
})

/* mount Vue */
new Vue({
  router: routes,
  template: '<v-app><router-view/></v-app>',
  components: components
}).$mount('#app')
