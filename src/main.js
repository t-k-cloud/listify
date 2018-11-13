import Vue from 'vue'
import VueRouter from 'vue-router'
import Component_sayhello from './sayhello.vue'

Vue.config.productionTip = false

var mainVue = new Vue({
  template: '<app></app>',
  components: {
    //'app': Component_sayhello
  },
  render: h => h(Component_sayhello)
})

mainVue.$mount('#app')
