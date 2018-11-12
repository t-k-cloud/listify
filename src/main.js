import Vue from 'vue'

Vue.config.productionTip = false

var mainVue = new Vue({
  template: '<app></app>'
})

mainVue.$mount('#app')
