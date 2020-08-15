<template>
    <el-card :style="{maxHeight:customTableHeight+'px'}" style="transition: none !important;" shadow="never">
        <file-list :height="fileListHeight"/>
    </el-card>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import fileList from "./components/fileList.vue";
  @Component({
    name: 'FileManager',
    components: {
      fileList
    }
  })
  export default class extends Vue {
    private customTableHeight=200
    private fileListHeight = 300

    mounted() {
      let that = this
      window.onresize = () => {
        //37是box的header的padding，94=(84+10+10)是顶部的高度
        let tempHeaderHeight = 104
        let tempHeight = document.body.clientHeight - (tempHeaderHeight)
        this.fileListHeight = tempHeight - 40
        if (tempHeight < 300) {
          tempHeight = 300
          this.fileListHeight = 300
        }
        that.customTableHeight = tempHeight
      }
      setTimeout(function () {
        const resizeEvent = new Event('resize')
        window.dispatchEvent(resizeEvent)
      }, 100)
    }

    destroyed() {
      window.onresize = null
    }
  }
  
</script>

<style scoped>

</style>
