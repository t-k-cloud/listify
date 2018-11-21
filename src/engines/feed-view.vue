<template>
<div class="item-view">
  {{json.title}}
  <br/>
  <span class="small">fetch time: {{update_short_str(json['fetch-time'])}}</span>
  <br/>
  <a target="_blank" v-bind:href="json.link" @click.stop=""> {{json.link}} </a>
</div>
</template>

<script>
export default {
  props: ['json'],
  methods: {
	update_short_str: function(str) {
		if (str)
			return str.split(' ')[0]
		else
			return ''
	}
  }
}
</script>

<style scoped>
div.item-view {
	user-select: none;
}
a {
  font-size: 1.4em;
}
span.small {
  font-size: 0.8em;
  color: grey;
}
</style>
