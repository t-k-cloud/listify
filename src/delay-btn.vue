<template>
<div>
<v-btn small color="error" @click="onclick($event)" v-bind="$attrs">
  {{val}}
</v-btn>
</div>
</template>

<script>
import 'vuetify/dist/vuetify.min.css'

export default {
  props: ['label', 'cntdown'],
  data: function () {
    return {
      'counting': false,
      'cur_number': 0,
      'intval': null
    }
  },
  computed: {
    val: function () {
      if (this.counting)
        return `Cancel (${this.cur_number})`
      else
        return this.label
    }
  },
  methods: {
    onclick: function (ev) {
      if (!this.counting) {
        this.$emit('active', ev)
        this.counting = true
        this.cur_number = this.cntdown || 3
        var vm = this

        if (this.cur_number == 0) {
          /* immediate */
          vm.$emit('fire')
          vm.counting = false
        } else {
          /* delay */
          this.intval = setInterval(function () {
            vm.cur_number --
            if (vm.cur_number <= 0) {
              clearInterval(vm.intval)
              vm.$emit('fire')
              vm.counting = false
            }
          }, 1000);
        }
      } else {
        this.$emit('clear', ev)
        this.counting = false
        clearInterval(this.intval)
      }
    }
  }
}
</script>
<style>
</style>
