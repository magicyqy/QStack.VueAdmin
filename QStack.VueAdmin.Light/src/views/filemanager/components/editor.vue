<template>
  <div id="editor-container">
    <div class="bar">
      <button @click="back" title="关闭" id="close" class="action">
        <i class="el-icon-close"></i>
      </button>

      <div class="title">
        <span>{{ filename }}</span>
      </div>

      <!--<button @click="save" v-show="user.perm.modify" :aria-label="$t('buttons.save')" :title="$t('buttons.save')" id="save-button" class="action">
        <i class="material-icons">save</i>
      </button>-->
    </div>

    <div id="breadcrumbs">
      <span title="home"><i class="el-icon-s-home"></i></span>

      <span v-for="(link, index) in breadcrumbs" :key="index">
        <span class="chevron"><i class="el-icon-arrow-right"></i></span>
        <span>{{ link.name }}</span>
      </span>
    </div>

    <form id="editor"></form>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import fileApi  from '@/api/file'
  //import buttons from '@/utils/buttons'
  import url from '@/utils/url'
  import ace from 'ace-builds' 
  import modelist from 'ace-builds/src-noconflict/ext-modelist'
  import 'ace-builds/webpack-resolver'
  import { TagsViewModule, ITagView } from '@/store/modules/tags-view'
  //import { theme } from '@/utils/constants'
  @Component({
    name: 'AceEditor'
  })
  export default class extends Vue {
    private filepath = ''
    private filename = ''
   
    get breadcrumbs() {
      let parts = this.filepath.split('/')
      //console.log(parts)
      if (parts[0] === '') {
        parts.shift()
      }

      if (parts[parts.length - 1] === '') {
        parts.pop()
      }

      let breadcrumbs = []

      for (let i = 0; i < parts.length; i++) {
        breadcrumbs.push({ name: decodeURIComponent(parts[i]) })
      }

      //breadcrumbs.shift()

      if (breadcrumbs.length > 3) {
        while (breadcrumbs.length !== 4) {
          breadcrumbs.shift()
        }

        breadcrumbs[0].name = '...'
      }
      //console.log(breadcrumbs)
      return breadcrumbs
    }

    created() {
      
      this.filepath = this.$route.query.filePath as string
      window.addEventListener('keydown', this.keyEvent)
      this.$nextTick(() => {
        //this.$set(this.$route.meta, 'title', this.filepath)
        document.title = this.filepath
      })
      
      
    }

    beforeDestroy() {
      window.removeEventListener('keydown', this.keyEvent)
      if (this.editor)
        this.editor.destroy();

    }
    async mounted() {
     
      const { data } = await fileApi.getFileContent({ filepath: this.filepath })
      const fileContent = data.content||'';

      this.editor = ace.edit('editor', {
        value: fileContent,
        showPrintMargin: false,
        readOnly:  data.type === 'textImmutable',
        theme: 'ace/theme/chrome',
        mode: modelist.getModeForPath(data.name).mode,
        wrap: true
      })

      //if (theme == 'dark') {
        //editor.setTheme("ace/theme/twilight");
      //}
    }

    private back() {
      TagsViewModule.closeCurrentView(this.$route)
     
    }
    private keyEvent(event: KeyboardEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return
      }

      if (String.fromCharCode(event.which).toLowerCase() !== 's') {
        return
      }

      event.preventDefault()
      this.save()
    }
    private removePrefix(url:string) {
      if (url.startsWith('/filemanager/index')) {
        url = url.replace('/filemanager/index','')
      }

      if (url === '') url = '/'
      if (url[0] !== '/') url = '/' + url
      return url
    }

    private async save() {
      const button = 'save'
      

      try {
        await fileApi.put({
          path: this.$route.path,
          content: this.editor.getValue()
        })
        this.$message.success("save succesfully")
      } catch (e) {
        this.$message.error(e.message || e);
      }
    }
  }

</script>
<style scoped>
  /* EDITOR */

  #editor-container {
    background-color: #fafafa;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
    overflow: hidden;
  }

    #editor-container .bar {
      width: 100%;
      text-align: right;
      display: flex;
      padding: 0.5em;
      height: 3.7em;
      background-color: #fff;
      border-bottom: 1px solid rgba(0, 0, 0, 0.075);
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    }

    #editor-container .title {
      margin-right: auto;
      padding: 0 1em;
      line-height: 2.7em;
      overflow: hidden;
      word-break: break-word;
    }

  #previewer .title span {
    font-size: 1.2em;
  }

  #previewer .loading {
    height: 100%;
    width: 100%;
  }

  #editor-container #editor {
    height: calc(100vh - 8.2em);
  }

  #editor-container #breadcrumbs {
    height: 2.3em;
    padding: 0 1em;
  }

    #editor-container #breadcrumbs span {
      font-size: 12px;
    }
  .action {
    display: inline-block;
    cursor: pointer;
    -webkit-transition: all .2s ease;
    transition: all .2s ease;
    border: 0;
    margin: 0;
    color: #546e7a;
    border-radius: 50%;
    background: transparent;
    padding: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
    vertical-align: middle;
    text-align: left;
    position: relative;
  }
    .action:hover {
      background-color: rgba(0,0,0,.1);
     
    }
    .action i, #breadcrumbs i {
      padding: .4em;
      -webkit-transition: all .1s ease-in-out;
      transition: all .1s ease-in-out;
      border-radius: 50%;
      font-weight: 400;
      font-style: normal;
      font-size: 24px;
    }
  #editor-container #breadcrumbs span {
    font-size: 12px;
  }

  #breadcrumbs, #breadcrumbs span {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    color: #6f6f6f;
  }
</style>
