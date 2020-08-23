<template>
  <div class="app-container">
    <el-form ref="postForm"
             :model="postForm"
             label-width="120px">
      <el-form-item label="标题">
        <el-input v-model="postForm.name" />
      </el-form-item>
      <el-form-item label="图片">
        <el-col :span="11">
          <el-input v-model="postForm.imageUrl" />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="imageSuccessCover">选择<i class="el-icon-upload el-icon--right"></i></el-button>
          <!--<editor-image-upload :color="uploadButtonColor"
                               class="editor-upload-btn"
                               @successCBK="imageSuccessCover" />-->
        </el-col>
      </el-form-item>
      <el-form-item label="缩略图">
        <el-col :span="11">
          <el-input v-model="postForm.imageThumbUrl" />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="imageSuccessThumb">选择<i class="el-icon-upload el-icon--right"></i></el-button>
          <!--<editor-image-upload :color="uploadButtonColor"
                               class="editor-upload-btn"
                               @successCBK="imageSuccessThumb" />-->
        </el-col>
      </el-form-item>
      <el-form-item label="类别">
        <catagoryDropdown v-model="postForm.productCategoryId" />
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model="postForm.price" />
      </el-form-item>
      <el-form-item label="折扣价">
        <el-input v-model="postForm.rebatePrice" />
      </el-form-item>
      <el-form-item label="成本价">
        <el-input v-model="postForm.purchasePrice" />
      </el-form-item>
      <el-form-item label="规格">
        <el-input v-model="postForm.purchasePrice" />
      </el-form-item>
      <el-form-item prop="content"
                    style="margin-bottom: 20px;">
        <tinymce v-if="tinymceActive"
                 ref="editor"
                 v-model="postForm.productContent"
                 :height="400" />
      </el-form-item>
      <el-form-item label="seoTitle">
        <el-input v-model="postForm.seoTitle" />
      </el-form-item>
      <el-form-item label="seoKeyWord">
        <el-input v-model="postForm.seoKeyWord" />
      </el-form-item>
      <el-form-item label="seoDescription">
        <el-input v-model="postForm.seoDescription" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="postForm.state"
                   placeholder="">
          <el-option label="已上架"
                     :value="1" />
          <el-option label="未上架"
                     :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label-width="120px"
                    label="创建时间:"
                    class="postInfo-container-item">
        <el-date-picker v-model="postForm.createDate"
                        type="datetime"
                        format="yyyy-MM-dd HH:mm:ss"
                        placeholder="Select date and time" />
      </el-form-item>
      <el-form-item label="轮播图片">
        <el-card class="box-card">
          <!--<el-button type="primary" >选择<i class="el-icon-upload el-icon--right"></i></el-button>-->
          <div class="el-upload__tip">只能选择图片文件，限选3张</div>
          <div>
            <ul class="el-upload-list el-upload-list--picture">
              <li v-for="(item, index) in postForm.productImages" :key="item.id+index" :tabindex="index" class="el-upload-list__item is-success">
                <img :src="item.imageUrl"  class="el-upload-list__item-thumbnail">
                <label  class="el-upload-list__item-status-label"><i class="el-icon-upload-success el-icon-check"></i></label><i class="el-icon-close" @click="deleteProductImage(item,index)"></i><i class="el-icon-close-tip">按 delete 键可删除</i><!----><!---->
              </li>
              <li class="el-upload-list__item is-success"><div tabindex="0" class="el-upload el-upload--picture-card" @click="onSuccess"><i class="el-icon-plus"></i></div></li>
            </ul>
              <!--<ul class="el-upload-list el-upload-list--picture-card">
                <li v-for="(item, index) in postForm.productImages" :key="item.id+index" class="el-upload--picture-card" style="margin-right:5px;border:none;">
                  <el-image class="image el-upload--picture-card" :src="item.imageUrl" :key="item.imageUrl" style="border:1px;"
                            fit="contain" :preview-src-list="[item.imageUrl]"></el-image>
                  <label class="el-upload-list__item-status-label"><i class="el-icon-upload-success el-icon-check"></i></label><i class="el-icon-close"></i><i class="el-icon-close-tip">按 delete 键可删除</i>
                </li>
                <li><div tabindex="0" class="el-upload el-upload--picture-card" @click="onSuccess"><i class="el-icon-plus"></i></div></li>
              </ul>-->
          </div>
          <!--<el-upload class="upload-demo"
     :with-credentials='true'
     :action="postAction"
     :on-success="onSuccess"
     :before-remove="beforeRemove"
     multiple
     :limit="3"
     :on-exceed="handleExceed"
     :file-list="fileList">
  <el-button size="small" type="primary">点击上传</el-button>
  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
  </el-upload>-->
        </el-card>
      </el-form-item>
      <el-form-item label="下载">
        <el-card>
          <el-card v-for="(domain, index) in postForm.productDownloads" :key="domain.id+index" style="margin-top:5px;">

            <el-button :id="domain.id+index" style=" padding: 3px 0;top: -10px; position: relative; left: 0px;" icon="el-icon-close" type="text" @click="deleteDowload(domain,index)"></el-button>

            <el-form-item label="地址">

              <el-input v-model="domain.downloadUrl"></el-input>
            </el-form-item>
            <el-form-item label="分享码">

              <el-input v-model="domain.validCode"></el-input>
            </el-form-item>
            <el-form-item label="描述">

              <el-input v-model="domain.extDesc"></el-input>
            </el-form-item>
          </el-card>
          <el-button size="small" @click="addDownload">添加</el-button>
        </el-card>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
                   @click="onSubmit">
          保存
        </el-button>
        <!--<el-button @click="onCancel">
        关闭
      </el-button>-->
      </el-form-item>
    </el-form>
    <el-dialog class="text-file-browser"
               title="文件浏览器"
               :visible.sync="fileBrowserVisible"
               width="820px">
      <file-list :height="450" :callback="true" @callback="fileSelected" :base-path="'/wwwroot/upload'" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
  import { SettingsModule } from '@/store/modules/settings'
  import { TagsViewModule, ITagView } from '@/store/modules/tags-view'
  import Tinymce from '@/components/Tinymce/index.vue'
  import UploadImage from '@/components/UploadImage/index.vue'
  import EditorImageUpload, { IUploadObject } from '@/components/Tinymce/components/EditorImage.vue'
  import  catagoryDropdown  from './catagoryDropdown.vue'
  import { isValidURL, getParent } from '@/utils/validate'
  import { getProduct, defaultProductData, postProduct } from '@/api/product'
  import { IProductDownload, IProductImage } from '../../../api/types'
  import FileList from "@/views/fileBrowse/components/fileList.vue"
  import { isImg, isVideo } from '@/utils/file'
  @Component({
    name: 'ProductDetail',
    components: {
     
      Tinymce,
      UploadImage,
      catagoryDropdown,
      EditorImageUpload,
      FileList
    }
  })
  export default class extends Vue {
    @Prop({ default: false }) private isEdit!: boolean
    private rules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      productCategoryId: [{ required: true, message: '请输入类别', trigger: 'blur' }]
      //,
      //articleContentHtml: [{ validator: this.validateRequire }],
      //sourceUrl: [{ validator: this.validateSourceUrl, trigger: 'blur' }]
    }
    private fileBrowserVisible = false
    private postForm = Object.assign({}, defaultProductData)
    private tinymceActive = true
    private fileList:object[]=[]
   
    get postAction() {
      return process.env.VUE_APP_BASE_API_UPLOAD
    }
    get uploadButtonColor() {
      return SettingsModule.theme
    }


   async created() {
      if (this.isEdit) {
        const id = this.$route.params && this.$route.params.id

        await this.fetchData(parseInt(id))
      }
     document.title = `编辑商品- ${this.postForm.id}`
     let tagView = Object.assign({}, this.$route) as ITagView
     tagView.tagTitle = document.title;
     TagsViewModule.updateVisitedView(tagView)
    }
    deactivated() {
      this.tinymceActive = false
    }

    activated() {
      this.tinymceActive = true
    }

    private async fetchData(id: number) {
      try {


        const { data } = await getProduct(id)
        this.postForm = data
        this.loadImages(this.postForm.productImages);
        //const title = this.lang === 'zh' ? '编辑文章' : 'Edit Article'
        // Set tagsview title 
     
      } catch (err) {
        console.error(err)
      }
    }
    private loadImages(productImages: IProductImage[]) {
      productImages.map(p => this.fileList.push({ name: p.imageUrl }))
    }

    private async onSubmit() {
      let { data } = await postProduct(this.postForm)
      this.$message({ message: 'submit success ', type: 'success' })
      if (!this.isEdit)
        this.$router.push({
          path: '/shop/productedit/' + data
        })
    }
    private onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
   
    }
       
    private async handleExceed(files: any, fileList: any) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    }
    private async beforeRemove(file: any, fileList: any) {
      
      return this.$confirm(`确定移除 ${file.name}？`).then(() => {
        
        this.postForm.productImages.splice(this.postForm.productImages.findIndex(i => i.imageUrl == file.name), 1)

      }).catch(() => Promise.reject())

      
          
    }
    private async onSuccess() {
      this.fileBrowserVisible = true;
      //file.name = response.data.url
      this.currentImage = 'productImages'
      //console.log(fileList)
      //this.postForm.productImages.push({
      //  id:0,
      //  productId: this.postForm.id,
      //  imageUrl: response.data.url,
      //  uploadFileId: response.data.id
      //})
      
    }

    private async addDownload() {
      this.postForm.productDownloads.push({ id: 0, productId: this.postForm.id, downloadUrl: '', validCode: '', extDesc:''})
    }
    private async deleteDowload(item:IProductDownload,index:number) {
      this.postForm.productDownloads.splice(index, 1)
    }

    private currentImage = '';
    //封面图片
    private imageSuccessCover() {
      this.currentImage ='imageUrl'
      this.fileBrowserVisible = true
      
    }
    //缩略图
    private imageSuccessThumb() {
     
      this.currentImage ='imageThumbUrl'
      this.fileBrowserVisible = true
    }
    private deleteProductImage(item: any, index: number) {

      this.postForm.productImages.splice(index)
    }
    private fileSelected(data: any) {

      let file = data || []
      if (this.currentImage == 'productImages') {
        if (file.length > 3)
          return
        file.forEach((item: any) => {
          if (this.postForm.productImages.length == 3)
            return
          this.postForm.productImages.push({
            id:0,
            productId: this.postForm.id,
            imageUrl: item.url,
            uploadFileId:0
          })
          
        })
      }
      else
        this.$set(this.postForm, this.currentImage, file[0].url)
      this.fileBrowserVisible = false
      this.currentImage=''
    }
  }
</script>

<style lang="scss" scoped>
  .el-upload-list{
    display:flex;
  }
    .el-upload-list li{
      width:148px;
      height:148px;
      margin-left:5px;
      padding:0px;
    }
      .el-upload-list li img {
        width: 148px;
        height: 148px;
         z-index: 0;
         margin-left: 0px;
 
    }
    .line {
      text-align: center;
    }
</style>
