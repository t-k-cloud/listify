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
import EditView from './edit.vue'
import DelayBtn from './delay-btn.vue'
Vue.component('delay-btn', DelayBtn)

/* import view engines */
import plainView from './engines/plain-view.vue'
import plainViewDetail from './engines/plain-view-detail.vue'
Vue.component('plain-view', plainView)
Vue.component('plain-view-detail', plainViewDetail)

const components = {
  DelayBtn,
  plainView
}

/* router settings */
Vue.use(Router)

var routes = new Router({
  mode: 'hash',
  routes: [
    { path: '/list/*', component: ListView },
    { path: '/edit/*', component: EditView },
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
