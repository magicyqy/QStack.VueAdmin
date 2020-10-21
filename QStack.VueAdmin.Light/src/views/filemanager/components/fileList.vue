<template>
    <div class="file-list" @click="fileOtherClick">
        <div class="file-list-top">
            <el-button size="small" type="primary" @click.stop="uploadFile">上传文件</el-button>
            <el-button size="small" @click="createFolder">新建目录</el-button>
            <el-button size="small" type="danger" icon="el-icon-delete" :disabled="canCallBack"
                       @click.stop="deleteResource">删除
            </el-button>
            <el-button size="small" @click="listFile">刷新</el-button>
        </div>
        <el-breadcrumb class="file-crumb" separator-class="el-icon-arrow-right">
            <el-breadcrumb-item v-for="item in breadcrumbItem"
                                style="cursor: pointer !important;">
                <a @click.stop="breadcrumbClick(item.path)">{{item.name}}</a>
            </el-breadcrumb-item>
            <span v-if="breadcrumbItem.length>1"
                  @click.stop="breadcrumbClick(breadcrumbItem[breadcrumbItem.length-2].path)"
                  class="no-select" style="float: right;cursor: pointer;margin-right: 4px;">
                <i class="el-icon-back"/>返回
            </span>
        </el-breadcrumb>
        <!--80是顶部和底部的大概高度，顶部的button固定为small-->
        <div    v-loading="loading" class="file-list-center" ref="fileListCenter" :style="{height: (height-100) +'px'}">
            <file-item :file="file" @click.stop.native="fileClick(file,index,$event)" v-for="(file,index) in fileList"
                       @dblclick.stop.native="fileDBClick(file,index,$event)"
                       @contextmenu.prevent.native="openMenu(file,$event)"
                       :class="{'file-item-checked':checkSelected(file.name)}">
            </file-item>
            <ul v-show="menuVisible" :style="{left:left+'px',top:top+'px'}"   class="contextmenu">
                <li>打开</li>
                <li>复制链接</li>
                <li @click="deleteResource">删除</li>
                <li>属性</li>
            </ul>
            <!--文件列表为空-->
            <div v-if="this.fileList.length===0" class="no-file">
                <i class="el-icon-upload" style="font-size: 67px;color: #C0C4CC;"></i>
                <p>暂无文件，点击上传吧~</p>
                <el-tag size="small" style="cursor: pointer" @click.stop="uploadFile">上传文件</el-tag>
            </div>
        </div>
        <div class="file-list-tip">
            <span v-if="fileSelectedList.length===0">{{fileList.length}}项</span>
            <span v-if="fileSelectedList.length>0">已选中{{fileSelectedList.length}}项</span>
            <template v-if="fileSelectedList.length===1">
                <span>，信息:</span>
                <span v-if="fileSelectedList[0].size&&fileSelectedList[0].size>0">大小:{{formatFileSize(fileSelectedList[0].size)}}</span>
                <span>修改时间:{{fileSelectedList[0].updateTime}}</span>
            </template>
            <el-button v-if="callback" @click.stop="selectedCallBack" :disabled="canCallBack" class="callback-btn"
                       type="primary"
                       size="small">确认选择
            </el-button>
        </div>
        <!--创建文件夹-->
        <create-folder :parent-path="currentPath" :dialog-visible="createFolderVisible"
                       @close="createFolderVisible = false" @created="listFile"/>
        <!--上传文件-->
        <upload-file :parent-path="currentPath" :dialog-visible="uploadFileVisible"
                     @uploaded="listFile"
                     @close="uploadFileVisible = false"/>
    </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import { Route } from 'vue-router'
    import {formatFileSize} from '@/utils/file'
    import CreateFolder from "./createFolder.vue"
  import UploadFile from "./uploadFile.vue"
    import fileApi from '@/api/file'
  import FileItem from "./fileItem.vue"
import { watch } from 'fs'
  @Component({
    name: 'FileList',
    components: {
      FileItem, CreateFolder, UploadFile
    }
  })
  export default class extends Vue {
    @Prop({ default: 300 }) private height!: number 
    @Prop({ default: false }) private callback!: boolean
    @Prop({ default: '/' }) private basePath!: string 
    private menuVisible=false
    private left=0
    private top= 0
    private createFolderVisible=false
    private uploadFileVisible=false
    private currentPath = this.basePath
    private fileList= []
    private fileSelectedList:any[]= []
    private rightClickFile:any= null
    private confirmDelete = false
    private formatFileSize = formatFileSize
    private loading=true
    get checkSelected() {
      var that=this
      return function (name:string) {
        let exist = false
        for (let i = 0; i < that.fileSelectedList.length; i++) {
          if (that.fileSelectedList[i].name === name) {
            exist = true
            break
          }
        }
        return exist
      }
    }
    created() {
      //console.log(this.basePath)
      if (this.callback)
         this.currentPath = this.basePath
    }
    get canCallBack() {
      return this.fileSelectedList.length === 0
    }
    get breadcrumbItem() {
      let result = []
      let items = this.currentPath.split("/")
      for (let i = 0; i < items.length; i++) {
        if (i === 0) {
          result.push({
            path: '/',
            name: '根目录'
          })
        } else if (items[i] && items[i] !== '') {
          result.push({
            path: items.slice(0, i + 1).join("/"),
            name: items[i]
          })
        }
      }
      //console.log(result)
      return result
    }
    @Watch('menuVisible')
    private onMenuVisibleChange(value:boolean) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
    @Watch('fileSelectedList')
    private onFileSelectedListChange(value:any) {
      if (value.length > 0) {
        document.body.addEventListener('click', this.fileOtherClick)
      } else {
        document.body.removeEventListener('click', this.fileOtherClick)
      }
    }
    @Watch('$route', { immediate: true })
    private onRouteChange(route: Route) {
   
      this.init()
    }

  
    private init() {
      if (!this.callback&&this.$router.currentRoute.query.filePath) {
        this.currentPath =this.$router.currentRoute.query.filePath as string
        this.currentPath = this.breadcrumbItem[this.breadcrumbItem.length - 1].path
      } else {
        this.currentPath = this.basePath
      }
      this.listFile()
    }

    private listFile() {
      this.loading = true
      fileApi.listFile({ prefix: this.currentPath }).then(res => {
        this.fileList = res.data || []
        this.loading = false
      })
    }

    private fileClick(file:any, index:any, event:any) {
      this.menuVisible = false
      if (event.ctrlKey) {
        this.fileCtrlClick(file, index)
      } else {
        this.fileSelectedList = []
        let temp = JSON.parse(JSON.stringify(file))
        temp.index = index
        this.fileSelectedList.push(temp)
      }
    }
     private fileDBClick(file:any, index:any, event:any) {
      this.menuVisible = false
      this.fileSelectedList = []
       if (file.dir) {
         if (this.currentPath.endsWith("/")) {
           this.breadcrumbClick(this.currentPath + file.name)
         } else {
           this.breadcrumbClick(this.currentPath + '/' + file.name)
         }
       }
       else {
         const query = { ...this.$route.query }        
         this.$router.push({ path: '/filemanager/fileeditor', query: { filePath: query.filePath + '/' + file.name } });
       }
     }

    private breadcrumbClick(path: string) {
      this.currentPath = path
      if (!this.callback&&path !== this.$router.currentRoute.query.filePath) {
        this.$router.push({
          query: {
            filePath: path,
          }
        });
       
      }
      else
        this.listFile()
    }
    private fileCtrlClick(file:any, index:number) {
      let exist = false
      for (let i = 0; i < this.fileSelectedList.length; i++) {
        if (this.fileSelectedList[i].index === index) {
          exist = true
          this.fileSelectedList.splice(i, 1)
          break
        }
      }
      if (!exist) {
        let temp = JSON.parse(JSON.stringify(file))
        temp.index = index
        this.fileSelectedList.push(temp)
      }
    }

    private fileOtherClick() {
      if (!this.confirmDelete) {
        this.fileSelectedList.splice(0)
      }
    }

    private selectedCallBack() {
      this.$emit('callback', JSON.parse(JSON.stringify(this.fileSelectedList.filter(item => !item.dir))))
    }

    private deleteResource() {
      this.confirmDelete = true
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let source = []
        this.fileSelectedList.forEach(item => {
          source.push(`${this.currentPath}/${item.name}`)
        })
        if (this.rightClickFile) {
          source.push(`${this.currentPath}/${this.rightClickFile!.name}`)
          this.rightClickFile = null
        }
        fileApi.deleteResource(Array.from(new Set(source))).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.fileSelectedList = []
          this.listFile()
        })
        this.confirmDelete = false
      }).catch(() => {
        this.confirmDelete = false
      })
    }
    private uploadFile() {
      this.uploadFileVisible = true
    }

    private createFolder() {
      this.createFolderVisible = true
    }
    private openMenu(file:any, e:any) {
      if (!this.checkFileExistList(file)) {
        this.fileSelectedList = []
      }
      this.rightClickFile = file
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.clientWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }
    
      this.top = e.clientY - 180 + (this.$refs.fileListCenter as Element).scrollTop
      this.menuVisible = true
    }

    private closeMenu() {
      this.menuVisible = false
    }

   private checkFileExistList(file:any) {
      for (let i = 0; i < this.fileSelectedList.length; i++) {
        if (file.name === this.fileSelectedList[i].name) {
          return true
        }
      }
      return false
    }

  }
   
</script>
<style lang="scss" scoped>
    .file-list {
        height: 100%;
        position: relative;

        .file-list-top {

        }

        .file-crumb {
            line-height: 14px;
            overflow: hidden;
            margin-top: 15px;

            ::v-deep .el-breadcrumb__item {

            }
        }

        .file-list-center {
            margin: 10px 0;
            overflow-y: auto;
            box-sizing: border-box;
            position: relative;

            .file-item-checked {
                border: 1px solid #1ed0ff;
                padding: 9px 9px 0 9px;
                border-radius: 1px;
                background: #daf5ff;
            }

            .no-file {
                width: 100%;
                position: absolute;
                top: 10%;
                text-align: center;

                p {
                    font-size: 13px;
                }
            }
        }

        .file-list-tip {
            position: relative;
            padding-left: 5px;
            font-size: 14px;
            color: #ababce;

            > span {
                margin-right: 5px;
                line-height: 26px;
            }

            .callback-btn {
                position: absolute;
                right: 10px;
            }
        }
    }

    .contextmenu {
        margin: 0;
        background: #fff;
        z-index: 3000;
        position: absolute;
        list-style-type: none;
        padding: 5px 0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 400;
        color: #333;
        box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);

        li {
            margin: 0;
            padding: 7px 16px;
            cursor: pointer;

            &:hover {
                background: #eee;
            }
        }
    }
</style>
