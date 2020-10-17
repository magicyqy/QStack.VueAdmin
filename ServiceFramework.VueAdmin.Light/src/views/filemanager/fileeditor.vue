<template>
   <ace-editor/>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import AceEditor from "./components/editor.vue";
  @Component({
    name: 'FileEditor',
    components: {
      AceEditor
    }
  })
  export default class extends Vue { }
</script>

<style scoped>
</style>
