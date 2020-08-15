<template>
    <div>
        <el-dialog
                class="simple-dialog"
                title="上传文件"
                :visible.sync="tempVisible"
                width="700px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                @close="close"
                append-to-body
        >
            <el-upload :class="{'editor-slide-upload': showDrag}"
                       ref="upload"
                       :disabled="operation"
                       action="https://httpbin.org/post"
                       :drag="showDrag" multiple
                       :on-change="onChange"
                       :limit="20"
                       :show-file-list="false"
                       :auto-upload="false">
                <template v-if="fileList.length===0">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，最多可选20个，或<em>点击上传</em></div>
                </template>
                <template v-else>
                    <el-button :disabled="operation" slot="trigger" size="small" type="primary">选取文件</el-button>
                    <el-button :disabled="operation" style="margin-left: 10px;" size="small" type="success"
                               @click="submitUpload">上传到服务器
                    </el-button>
                    <div slot="tip" class="el-upload__tip">最多可选20个</div>
                </template>
            </el-upload>
            <div style="max-height: 300px;overflow-y: auto;padding-right: 10px">
                <ul class="upload-file-list">
                    <li v-for="(file,index) in fileList" :key="index">
                        <p class="file-name">
                            <img v-lazy="getTypeImgByFileName(file.data.name)||getTypeImgByFileName" alt=""/>
                            <span>{{file.data.name}}</span>
                        </p>
                        <p class="file-size">{{formatFileSize(file.data.size)}}</p>
                        <p class="file-delete" :class="{'none': operation}" @click="fileDelete(file)">
                            <i title="移除" class="el-icon-close"/>
                        </p>
                        <p v-if="operation&&file.isTip" class="file-tip">{{file.tip}}</p>
                        <el-progress :text-inside="false" :stroke-width="56"
                                     :percentage="file.percentage"
                                     :show-text="operation&&file.uploadedSize>0&&!file.isTip">
                        </el-progress>
                    </li>
                </ul>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import axios from 'axios'
  import request from '@/utils/request'
  import md5 from 'js-md5'
  import {   UserModule } from  '@/store/modules/user'
  import { formatFileSize, getTypeImgByFileName } from '@/utils/file'
//import { Upload } from 'element-ui'
  @Component({
    name: 'UploadFile'
  })
  export default class extends Vue {
    @Prop({ default: false }) private dialogVisible!: boolean
    @Prop({ default: '/' }) private parentPath!: string
    private multipart=true   //是否开启分片上传
    private splitSize=2 * 1024 * 1024   //以5M为单位大小进行分片
    private bigFileSize=50 * 1024 * 1024   //超过10M就进行分片上传（需要后台支持）
    private uploadPool=5  //同时上传的请求，最小值1
    private uploadingNum=0  //正在请求上传的数量，不要改，结合uploadPool使用
    private operation=false   //上传中
    private tempVisible= false
    private tempData= {
      folderName: ''
    }
    private getTypeImgByFileName = getTypeImgByFileName
    private formatFileSize = formatFileSize
    private fileList: any[] = []

    get showDrag() {
      return this.fileList.length === 0
    }
    @Watch('dialogVisible')
    private onDialogVisibleChange(value: boolean) {
      this.tempVisible = value
    }
   
    private async submitUpload() {
      if (this.operation) {
        return;
      }
      this.operation = true
      for (const file of this.fileList) {
        file.tip = '连接中...'
        file.isTip = true
        if (this.multipart && file.data.size > this.bigFileSize) {
          const totalShard = parseInt(((file.data.size + this.splitSize - 1) / this.splitSize).toString())
          if (totalShard > 1) {
            //获取上传的唯一id，可以从服务器获取，根据文件大小，文件名称，其他参数组合成一个唯一的id
            let uploadId = this.getUploadId(file);
            //从服务器获取已上传的有哪些分片，如果上传了该分片，旧不要上传了
            file.isTip = false
            for (let i = 1; i <= totalShard; i++) {
              let start = (i - 1) * this.splitSize
              let end = start + this.splitSize
              if (end >= file.size) {
                end = file.size + 1
              }
              let shardData = file.data.raw.slice(start, end)
              let tempFormData = new FormData()
              tempFormData.append("uploadId", uploadId.toString())
              tempFormData.append("totalShard", totalShard.toString())
              tempFormData.append("shard", i.toString())
              tempFormData.append("data", shardData)
              this.shardUpload(tempFormData, file)
              //虚拟的同步判断，防止发送大量的ajax请求，因为shardUpload方法未加同步机制
              await this.virtualSleep()
            }
            //发送合并请求
            await this.mergeShardFile(uploadId, file)
          } else {
            await this.uploadOne(file)
          }
        } else {
          await this.uploadOne(file)
        }
      }
      this.fileList = []
      this.operation = false
      this.$emit('uploaded')
    }
    private async uploadOne(file:any) {
      let formData = new FormData()
      formData.append('prefix', this.parentPath)
      formData.append('file', file.data.raw)
      await axios.post('/system/file', formData, {
        baseURL: process.env.VUE_APP_BASE_API,
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization':"Bearer "+ UserModule.token },
        onUploadProgress: (evt) => {
          file.isTip = false
          file.percentage = evt.loaded / evt.total * 100 | 0
          file.uploadedSize = evt.loaded
          if (evt.loaded === evt.total) {
            file.isTip = true
            file.tip = '数据接收中...'
          }
        }
      }).then(() => {
        file.isTip = false
      }).catch(() => {
        this.operation = false
      })
    }
    private shardUpload(formData:any, file:any) {
      this.uploadingNum = this.uploadingNum + 1
      request({
        url: '/system/file/shard',
        method: 'post',
        data: { data: formData, NOSERI: true, notLoading: true },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        file.uploadedSize += formData.get("data").size
        file.percentage = (file.uploadedSize / file.size * 100 | 0)
        this.uploadingNum = this.uploadingNum - 1
      })
    }
    private virtualSleep() {
      let _this = this
      return new Promise(function(resolve) {
        let interval = setInterval(function() {
          if (_this.uploadingNum < _this.uploadPool) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
    }
    private mergeShardFile(uploadId:string, file:any) {
      file.tip = '文件合并中...'
      file.isTip = true
      let data = {
        prefix: this.parentPath,
        uploadId: uploadId,
        fileName: file.data.name,
        notLoading: true
      }
      return new Promise(function(resolve) {
        let interval = setInterval(function() {
          if (file.uploadedSize >= file.size) {
            clearInterval(interval)
            request({
              url: '/system/file/mergeShard',
              method: 'post',
              data
            }).then(() => {
              file.tip = '已完成'
              file.isTip = false
              resolve()
            }).catch(() => {
              file.tip = '合并文件异常...'
              file.isTip = true
            })
          }
        }, 100)
      })
    }
    private getUploadId(file:any) {
      //这里通过name，size生成唯一id
      return md5(file.data.name + file.data.size)
    }
    private onChange(file:any) {
      if (this.operation) {
        return;
      }
      let tempFile = {
        size: file.size,
        uploadedSize: 0,
        percentage: 0,
        isTip: true,
        tip: '等待上传...',
        data: file
      }
      if (this.fileList.length >= 20) {
        this.$message.error("最多选择20个文件")
        return
      }
      this.fileList.push(tempFile);
      (this.$refs.upload as any).uploadFiles = []
    }
    private fileDelete(file:any) {
      for (let i = 0; i < this.fileList.length; i++) {
        if (file.data.uid === this.fileList[i].data.uid) {
          this.fileList.splice(i, 1)
          break
        }
      }
    }
    private close() {
      this.fileList = []
      this.operation = false
      this.$emit('close')
    }
  }
   
</script>

<style lang="scss" scoped>
    .editor-slide-upload {
        ::v-deep .el-upload {
            width: 100% !important;
        }

        ::v-deep .el-upload-dragger {
            width: 100% !important;
        }
    }

    .upload-file-list {
        padding: 0;
        position: relative;

        li {
            position: relative;
            background-color: #f0f0f0;
            height: 56px;
            overflow: hidden;
            margin-bottom: 7px;
            animation-name: fadeIn2;
            animation-duration: 0.7s;
            animation-iteration-count: 1;
            animation-delay: 0s;

            p {
                margin: 0;
                display: block;
                position: absolute;
                z-index: 1;

                &.file-name {
                    padding-top: 10px;
                    padding-left: 10px;

                    img {
                        vertical-align: middle;
                        display: inline-block;
                        border: 0;
                        margin-right: 3px;
                        border-radius: 2px;
                        height: 24px;
                    }

                    span {
                        color: #313131;
                        display: inline-block;
                    }
                }

                &.file-size {
                    color: #888888;
                    padding-left: 38px;
                    position: absolute;
                    overflow: hidden;
                    top: 30px;
                }

                &.file-delete {
                    color: #969696;
                    cursor: pointer;
                    position: absolute;
                    right: 10px;
                    font-size: 12px !important;
                    line-height: 56px;

                    i {
                        font-weight: bold;

                        &:hover {
                            color: #181818;
                        }
                    }
                }

                &.file-tip {
                    color: #969696;
                    cursor: pointer;
                    position: absolute;
                    right: 10px;
                    font-size: 12px !important;
                    line-height: 56px;
                }

                &.none {
                    display: none;
                }
            }
        }

        ::v-deep .el-progress-bar {
            position: relative;
            padding: 0;
            margin: 0;
        }

        ::v-deep .el-progress__text {
            position: absolute;
            right: 10px;
            font-size: 14px !important;
            line-height: 56px;
        }

        ::v-deep .el-progress-bar__outer {
            border-radius: 1px;
        }

        ::v-deep .el-progress-bar__inner {
            background: rgba(103, 194, 58, .4) !important;
            border-radius: 1px;
        }
    }
</style>
