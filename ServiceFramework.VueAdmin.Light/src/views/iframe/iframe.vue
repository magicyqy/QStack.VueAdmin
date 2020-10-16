<template>
  <div class="iframe-container">
    <iframe :src="src" scrolling="auto" frameborder="0" class="frame" :onload="onloaded()">
    </iframe>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { ElLoadingComponent as ElLoading } from 'element-ui/types/loading'
  import { Route } from 'vue-router'
  @Component({
    name: 'IFrame'
  })
  export default class extends Vue {
    private src = ""
    private loading: any=null

    mounted() {
      //this.resetSrc(this.$store.state.iframe.iframeUrl);
    }

    @Watch('$route', { immediate: true })
    private onRouteChange(route: Route) {
     
      // 如果是跳转到嵌套页面，切换iframe的url
      this.resetSrc(process.env.VUE_APP_BASE_HOST + route.path);
   }
  
    private   resetSrc(url:string) {
      this.src = url
      this.load()
    }
    private  load() {
      this.loading = this.$loading({
        lock: true,
        text: "loading...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.5)",
        // fullscreen: false,
        target: document.querySelector("#main-container ") as HTMLElement
      })
    }
    private onloaded() {
      if (this.loading) {
        this.loading.close()
      }
    }
  }

</script>

<style scoped>
  .iframe-container {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    
  }
  .frame {
    width: 100%;
    height: 100%;
  }
</style>
