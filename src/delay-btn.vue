<template>
<input style="flex: 1" type="button" v-bind:value="val" @click="onclick()"/>
</template>

<script>
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
    onclick: function () {
      if (!this.counting) {
        this.counting = true
        this.cur_number = this.cntdown || 3
        var vm = this
        this.intval = setInterval(function () {
          vm.cur_number --
          if (vm.cur_number == 0) {
            clearInterval(vm.intval)
            vm.$emit('fire')
            vm.counting = false
          }
        }, 1000);
      } else {
        this.counting = false
        clearInterval(this.intval)
      }
    }
  }
}
</script>
<style>
</style>
