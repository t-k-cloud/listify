/* 
 * The default export for the vue NPM package is
 * runtime only, as here we need the template compiler,
 * we include vue in the following way, which includes
 * both the runtime and the template compiler.
 */
import Vue from 'vue/dist/vue.esm.js'
import Router from 'vue-router'
import Sorry from './sorry.vue'
import ListView from './list.vue'

/* close console.log on production tips */
Vue.config.productionTip = false

Vue.use(Router)

var routes = new Router({
  mode: 'hash',
  routes: [
    { path: '/list/*', component: ListView },
    { path: '/edit/*', component: ListView },
    { path: '/detail/*', component: ListView },
    { path: '/private', component: Sorry, props: {why: "this is private place!", joke: false}  },
    { path: '*',        component: Sorry, props: {why: "404 not found!", joke: true}  }
  ]
})

var Joke = Vue.component('joke', {
  template: '<h3>How do robots eat guacamole? With computer chips.</h3>'
})

new Vue({
  router: routes,
  template: '<router-view></router-view>',
  components: { Joke }
}).$mount('#app')
