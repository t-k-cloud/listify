/* 
 * The default export for the vue NPM package is
 * runtime only, as here we need the template compiler,
 * we include vue in the following way, which includes
 * both the runtime and the template compiler.
 */
import Vue from 'vue/dist/vue.esm.js'
/* close console.log on production tips */
Vue.config.productionTip = false

import Router from 'vue-router'
import Sorry from './sorry.vue'
import ListView from './list.vue'

/* import view engines */
import plainView from './engines/plain-view.vue'
Vue.component('brief-plain-view', plainView)

const components = {
  plainView
}

/* router settings */
Vue.use(Router)

var routes = new Router({
  mode: 'hash',
  routes: [
    { path: '/list/*', component: ListView, props: {detailed: false} },
    { path: '/detail/*', component: ListView, props: {detailed: true} },
    { path: '/edit/*', component: ListView },
    { path: '/private', component: Sorry, props: {why: "this is private place!"}  },
    { path: '*',        component: Sorry, props: {why: "404 not found!"}  }
  ]
})

/* mount Vue */
new Vue({
  router: routes,
  template: '<router-view></router-view>',
  components: components
}).$mount('#app')
