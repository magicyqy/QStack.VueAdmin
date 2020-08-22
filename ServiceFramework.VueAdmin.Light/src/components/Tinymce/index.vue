<template>
  <div :class="{fullscreen: fullscreen}"
       class="tinymce-container"
       :style="{width: containerWidth}">
    <tinymce-editor :id="id"
                    v-model="tinymceContent"
                    :init="initOptions" />
    <el-dialog class="text-file-browser"
               title="文件浏览器"
               :visible.sync="fileBrowserVisible"
               width="820px">
      <file-list :height="450" :callback="true" @callback="fileSelected" :base-path="'/wwwroot/upload'" />
    </el-dialog>
    <div class="editor-custom-btn-container">
      <editor-image-upload :color="uploadButtonColor"
                           class="editor-upload-btn"
                           @successCBK="imageSuccessCBK" />
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
// Docs: https://armour.github.io/vue-typescript-admin-docs/features/components/rich-editor.html#tinymce
import 'tinymce/tinymce'
import 'tinymce/themes/silver' // Import themes
import 'tinymce/themes/mobile'
import 'tinymce/plugins/advlist' // Any plugins you want to use has to be imported
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/autosave'
import 'tinymce/plugins/code'
import 'tinymce/plugins/codesample'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/hr'
import 'tinymce/plugins/image'
import 'tinymce/plugins/imagetools'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/noneditable'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/paste'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/print'
import 'tinymce/plugins/save'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/spellchecker'
import 'tinymce/plugins/tabfocus'
import 'tinymce/plugins/table'
import 'tinymce/plugins/template'
import 'tinymce/plugins/textpattern'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/visualchars'
  import 'tinymce/plugins/wordcount'
  import '@/components/Tinymce/plugins/filebrowse'
  //import '@/components/Tinymce/plugins/clipboard.min.js'
  import '@/components/Tinymce/plugins/prism.js'
  import '@/components/Tinymce/plugins/prism.css'
import TinymceEditor from '@tinymce/tinymce-vue' // TinyMCE vue wrapper
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { AppModule } from '@/store/modules/app'
import { SettingsModule } from '@/store/modules/settings'
import EditorImageUpload, {IUploadObject } from './components/EditorImage.vue'
import { plugins, toolbar } from './config'
import FileList from "@/views/fileBrowse/components/fileList.vue"
import { isImg, isVideo } from '@/utils/file'
const defaultId = () => 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')

@Component({
  name: 'Tinymce',
  components: {
    EditorImageUpload,
    FileList,
    TinymceEditor
  
  }
})
export default class extends Vue {
  @Prop({ required: true }) private value!: string
  @Prop({ default: defaultId }) private id!: string
  @Prop({ default: () => [] }) private toolbar!: string[]
  @Prop({ default: 'file edit insert view format table' }) private menubar!: string
  @Prop({ default: '360px' }) private height!: string | number
  @Prop({ default: 'auto' }) private width!: string | number

  private fileBrowserVisible=false
  private hasChange = false
  private hasInit = false
  private fullscreen = false
  // https://www.tiny.cloud/docs/configure/localization/#language
  // and also see langs files under public/tinymce/langs folder
  private languageTypeList: { [key: string]: string } = {
    en: 'en',
    zh: 'zh_CN',
    es: 'es',
    ja: 'ja',
    ko: 'ko_KR'
  }

  get language() {
    return this.languageTypeList['zh']
  }

  get uploadButtonColor() {
    return SettingsModule.theme
  }

  get tinymceContent() {
    return this.value
  }

  set tinymceContent(value) {
    this.$emit('input', value)
  }

  get containerWidth() {
    const width = this.width
    // Test matches `100`, `'100'`
    if (/^[\d]+(\.[\d]+)?$/.test(width.toString())) {
      return `${width}px`
    }
    return width
  }

  get initOptions() {
   
    return {
      selector: `#${this.id}`,
      height: this.height,
      body_class: 'panel-body ',
      object_resizing: false,
      toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
      menubar: this.menubar,
      plugins: plugins,
      language: this.language,
      language_url: this.language === 'en' ? '' : `${process.env.BASE_URL}tinymce/langs/${this.language}.js`,
      skin_url: `${process.env.BASE_URL}tinymce/skins`,
      content_css: `${process.env.BASE_URL}tinymce/skins/content/default/content.css`,
      emoticons_database_url: `${process.env.BASE_URL}tinymce/emojis.min.js`,
      end_container_on_empty_block: true,
      powerpaste_word_import: 'clean',
      code_dialog_height: 450,
      code_dialog_width: 1000,
      advlist_bullet_styles: 'square',
      advlist_number_styles: 'default',
      imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io','localhost','magicyqy.cn','www.magicyqy.cn'],
      default_link_target: '_blank',     
      link_title: false,//相对路径
      relative_urls: false,
      //remove_script_host: false,
      //document_base_url: "http://localhost:5000/",
      nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin     
      init_instance_callback: (editor: any) => {
        if (this.value) {
          editor.setContent(this.value)
        }
        this.hasInit = true
        let that=this
        editor.fileBrowser = function(){
          that.fileBrowserVisible = true
        }
        editor.on('NodeChange Change KeyUp SetContent', () => {
          this.hasChange = true
          this.$emit('input', editor.getContent())
        })
      },
      setup: (editor: any) => {
        editor.on('FullscreenStateChanged', (e: any) => {
          this.fullscreen = e.state
        })
      }
    }
  }

  @Watch('language')
  private onLanguageChange() {
    const tinymceManager = (window as any).tinymce
    const tinymceInstance = tinymceManager.get(this.id)
    if (this.fullscreen) {
      tinymceInstance.execCommand('mceFullScreen')
    }
    if (tinymceInstance) {
      tinymceInstance.destroy()
    }
    this.$nextTick(() => tinymceManager.init(this.initOptions))
  }

  private imageSuccessCBK(arr: IUploadObject[]) {
    const tinymce = (window as any).tinymce.get(this.id)
    arr.forEach(v => {
      tinymce.insertContent(`<img class="wscnph" src="${v.url}" >`)
    })
  }
  private fileSelected(data: any) {
    const tinymce = (window as any).tinymce.get(this.id)
    let _this = this
    let file = data || []
    file.forEach((item:any) => {
      if (isImg(item.url)) {
        tinymce.insertContent(`<img src="${item.url}"  alt="${item.name}" style="max-width: 100%;max-height: auto;" />`);
      } else if (isVideo(item.url)) {
        tinymce.insertContent(`<video controls="controls" style="max-width: 100%;">
                  <source src="${item.url}" /></video>`)
      } else {
        tinymce.insertContent(`<p><a href="${item.url}" target="_blank" rel="noopener">${item.name}</a></p>`)
      }
    })
    this.fileBrowserVisible = false
  }
}
</script>

<style lang="scss" scoped>
 
.tinymce-container {
  position: relative;
  line-height: normal;

  .mce-fullscreen {
    z-index: 10000;
  }
}

.editor-custom-btn-container {
  position: absolute;
  right: 6px;
  top: 6px;

  &.fullscreen {
    z-index: 10000;
    position: fixed;
  }
}

.editor-upload-btn {
  display: inline-block;
}

textarea {
  visibility: hidden;
  z-index: -1;
}
</style>
