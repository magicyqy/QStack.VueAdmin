<template>
    <div class="file-item" :title="file.name">
        <div class="file-head">
            <el-image v-if="checkImg(file.name)" class="image" :src="file.url" :key="file.url"
                      fit="contain" :preview-src-list="[file.url]" :alt="file.name"></el-image>
            <el-image v-else class="image" :src="file.dir?fileTypeIconList['dir']:(fileTypeIconList[file.suffix] || getTypeImgByFileName(file.name))"
                      fit="contain" :alt="file.name"></el-image>
        </div>
        <div class="file-name" >
            <span >{{file.name}}</span>
        </div>
    </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import { isImg, fileTypeImgList} from '@/utils/file'
  @Component({
    name: 'FileItem'
  })
  export default class extends Vue {
    @Prop({ default: {} }) private file!: Object | null

    get fileTypeIconList() {
      return fileTypeImgList
    }

    private getTypeImgByFileName(fileName:string) {
      let type = fileTypeImgList.other
      if (fileName) {
        let index1 = fileName.lastIndexOf(".")
        if (index1 !== -1) {
          let suffix = fileName.substring(index1 + 1, fileName.length)
          type = (fileTypeImgList as any)[suffix] || type
        }
      }
      return type
    }
    private checkImg(name:string) {
      return isImg(name)
    }
  }
   
</script>

<style scoped lang="scss">
    .file-item {
        position: relative;
        display: inline-block;
        width: 105px;
        height: 100px;
        overflow: hidden;
        padding: 10px 10px 0 10px;
        margin-right: 5px;

        .file-head {
            height: 60px;
            width: 100%;
            overflow: hidden;
            text-align: center;
            .image{
                height: 60px;
            }
            img {
                width: auto;
                height: auto;
                max-width: 100%;
                max-height: 100%;
                border-radius: 2px;
            }
        }

        .file-name {
            height: 30px;
            line-height: 30px;
            width: 100%;
            overflow: hidden;
            text-align: center;
            font-size: 13px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
</style>
