<template>
  <div class="createPost-container">
    <el-form ref="postForm"
             :model="postForm"
             :rules="rules"
             class="form-container">
      <sticky :z-index="10"
              :class-name="'sub-navbar '+showStateName(postForm.state)">
        <comment-dropdown v-model="postForm.disableComment" />
        <el-button v-loading="loading"
                   style="margin-left: 10px;"
                   type="success"
                   @click="submitForm">
          发布
        </el-button>
        <el-button v-loading="loading"
                   type="warning"
                   @click="draftForm">
          存草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-form-item style="margin-bottom: 10px;">
          <el-radio v-model="postForm.articleType" :label="0">原创</el-radio>
          <el-radio v-model="postForm.articleType" :label="1">转发</el-radio>
        </el-form-item>
        <el-row>
          <!--<warning />-->

          <el-col :span="24">
            <el-form-item style="margin-bottom: 20px;"
                          prop="title">
              <material-input v-model="postForm.title"
                              :maxlength="100"
                              name="name"
                              required>
                标题
              </material-input>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px"
                                label="作者:"
                                class="postInfo-container-item">
                    <el-input  size="mini" style="text-overflow: ellipsis;padding-right: 30px;" v-model="postForm.author"></el-input>
                    <span style="position: absolute;right: -5px;top:5px;bottom:5px;line-height: 28px;display:inline-block;background: #fff;border: 1px solid #DCDFE6;padding: 0 10px;border-radius: 0 4px 4px 0;cursor:pointer;" @click="handleSelectUser(postForm.author)"><i class="el-icon-more"></i></span>
                    <!--<el-select v-model="postForm.author"
             :remote-method="getRemoteUserList"
             filterable
             default-first-option
             allow-create
             remote
             placeholder="Search user">
    <el-option v-for="(item, index) in userListOptions"
               :key="item+index"
               :label="item"
               :value="item" />
  </el-select>-->
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label-width="60px"
                                label="类别:"
                                class="postInfo-container-item">
                    <el-cascader v-model="catagory" ref="cascader"
                                 :options="cascaderOptions"
                                 :props="cascaderProps"
                                 @change="handleChange"></el-cascader>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label-width="120px"
                                label="创建时间:"
                                class="postInfo-container-item">
                    <el-date-picker v-model="timestamp"
                                    type="datetime"
                                    format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="Select date and time" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
        <el-form-item style="margin-bottom: 20px;"
                      label-width="70px"
                      label="标签:">
          <el-select v-model="tagValues" style="width:100%;"
                     multiple
                     filterable
                     allow-create
                     default-first-option
                     placeholder="请选择文章标签">
            <el-option v-for="item in tagList"
                       :key="item.id"
                       :label="item.name"
                       :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 20px;"
                      label-width="70px"
                      label="摘要:">
          <el-input v-model="postForm.summary"
                    :rows="1"
                    type="textarea"
                    class="article-textarea"
                    autosize
                    placeholder="Please enter the content" />
          <span v-show="abstractContentLength"
                class="word-counter">{{ abstractContentLength }}words</span>
        </el-form-item>

        <el-form-item style="margin-bottom: 20px;"
                      label-width="70px"
                      label="来源:">
          <el-input v-model="postForm.sourceUrl"
                    :rows="1"
                    type="textarea"
                    class="article-textarea"
                    autosize
                    placeholder="Please enter the content" />

        </el-form-item>
        <el-form-item prop="content"
                      style="margin-bottom: 20px;">
          <tinymce v-if="tinymceActive"
                   ref="editor"
                   v-model="postForm.articleContentHtml"
                   :height="400" />
        </el-form-item>

        <el-form-item prop="coverUrl" label="封面:"
                      style="margin-bottom: 30px;">
          <upload-image v-model="postForm.coverUrl" />
        </el-form-item>
      </div>
    </el-form>
    <el-dialog :visible="userCompVisible" width="65%">
      <UserComponent :componentVisible.sync="userCompVisible" :selectedItems.sync="selectedUsers" :component-mode="true" />
    </el-dialog>

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue,Watch } from 'vue-property-decorator'
  import { isValidURL,  getParent } from '@/utils/validate'
  import { getArticle, defaultArticleData, saveAriticle, getCatagories,getTags } from '@/api/articles'
  import { getUsers } from '@/api/users'
  import { AppModule } from '@/store/modules/app'
  import { TagsViewModule, ITagView } from '@/store/modules/tags-view'
  import MaterialInput from '@/components/MaterialInput/index.vue'
  import Sticky from '@/components/Sticky/index.vue'
  import Tinymce from '@/components/Tinymce/index.vue'
  import UploadImage from '@/components/UploadImage/index.vue'
  import Warning from './Warning.vue'
  import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'
  import { Form, Cascader, Tag } from 'element-ui'
  import { ITag, IUser } from '@/api/types'
  import { default as UserComponent } from '@/views/sys/user.vue'
  @Component({
    name: 'ArticleDetail',
    components: {
      CommentDropdown,
      PlatformDropdown,
      SourceUrlDropdown,
      MaterialInput,
      Sticky,
      Tinymce,
      UploadImage,
      Warning,
      UserComponent

    }
  })
  export default class extends Vue {
    @Prop({ default: false }) private isEdit!: boolean
    private userCompVisible = false
    private selectedUsers: IUser[] = []
    private cascaderOptions:any = []
    private cascaderProps = {
      value: 'id',
      label: 'name',
      children: 'children',
      checkStrictly: true
    }
    private tagValues:any=null
    private tagList: ITag[] = []

    private validateRequire = (rule: any, value: string, callback: Function) => {
      if (value === '') {
        if (rule.field === 'coverUrl') {
          this.$message({
            message: 'Upload cover image is required',
            type: 'error'
          })
        } else {
          this.$message({
            message: rule.field + ' is required',
            type: 'error'
          })
        }
        callback(new Error(rule.field + ' is required'))
      } else {
        callback()
      }
    }

    private validateSourceUrl = (rule: any, value: string, callback: any) => {
      if (value) {
        if (isValidURL(value)) {
          callback()
        } else {
          this.$message({
            message: 'Invalid URL',
            type: 'error'
          })
          callback(new Error('Invalid URL'))
        }
      } else {
        callback()
      }
    }

    private postForm = Object.assign({}, defaultArticleData)
    private loading = false
    private userListOptions = []
    private rules = {
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      categoryId: [{ required: true, message: '请输入类别', trigger: 'blur' }]
      ,
      articleContentHtml: [{ validator: this.validateRequire }],
      sourceUrl: [{ validator: this.validateSourceUrl, trigger: 'blur' }]
    }

    private tempTagView?: ITagView
    private tinymceActive = true

    get abstractContentLength() {
      return this.postForm.summary.length
    }

    get lang() {
      return AppModule.language
    }

    // set and get is useful when the data
    // returned by the backend api is different from the frontend
    // e.g.: backend return => "2013-06-25 06:59:25"
    //       frontend need timestamp => 1372114765000
    get timestamp() {
      //return (+new Date(this.postForm.createDate))
      return this.postForm.createDate
    }

    set timestamp(value) {
      this.postForm.createDate = value  
    }

    async created() {
      this.fetchCatagory()
      this.fetchTags()
      if (this.isEdit) {
        const id = this.$route.params && this.$route.params.id
     
        await this.fetchData(parseInt(id))
      }
      // Why need to make a copy of this.$route here?
      // Because if you enter this page and quickly switch tag, may be in the execution of this.setTagsViewTitle function, this.$route is no longer pointing to the current page
      // https://github.com/PanJiaChen/vue-element-admin/issues/1221
      this.$nextTick(() => {
        this.tempTagView = Object.assign({}, this.$route)
        const title = this.lang === 'zh' ? '编辑文章' : 'Edit Article'
        // Set tagsview title
        this.setTagsViewTitle(title)
        // Set page title
        this.setPageTitle(title)
      })
      
    }

    deactivated() {
      this.tinymceActive = false
    }

    activated() {
      this.tinymceActive = true
    }

    private async fetchCatagory() {
      const { data } = await getCatagories()
      this.cascaderOptions = data
    }
    private async fetchTags() {
      const { data } = await getTags()
      this.tagList = data
    }
    private async fetchData(id: number) {
      try {
       

        const { data }= await getArticle(id)
        this.postForm = data
        if (this.postForm.tags)
          this.tagValues = this.postForm.tags.map(v=>v.id)
       
      } catch (err) {
        console.error(err)
      }
    }

    private setTagsViewTitle(title: string) {
      const tagView = this.tempTagView 
    
      if (tagView) {
        tagView.title = `${title}-${this.postForm.id}`
        tagView.tagTitle = tagView.title
        TagsViewModule.updateVisitedView(tagView)
      }
    }

    private setPageTitle(title: string) {
      document.title = `${title} - ${this.postForm.id}`
    }

    private async submitForm() {
      (this.$refs.postForm as Form).validate(async valid => {
        if (valid) {
          //console.log(this.postForm)
          this.loading = true

          this.postForm.state = 1
          let { data }= await saveAriticle(this.postForm)
          this.$notify({
            title: 'Success',
            message: 'The post published successfully',
            type: 'success',
            duration: 2000
          })
         
          if (!this.isEdit)
            this.$router.push({
              path: '/article/edit/' + data
            })
          // Just to simulate the time of the request
          setTimeout(() => {
            this.loading = false
           
          }, 0.5 * 1000)
        } else {
          console.error('Submit Error!')
          return false
        }
      })
    }

    private async draftForm() {
      if (this.postForm.articleContentHtml.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: 'Title and detail content are required',
          type: 'warning'
        })
        return
      }
      this.postForm.state = 0
      const { data }= await saveAriticle(this.postForm)
      this.$message({
        message: 'The draft saved successfully',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      if(!this.isEdit)
        this.$router.push({
          path: '/article/edit/'+data
        })
    }

    private async getRemoteUserList(name: string) {
      const { data } = await getUsers({ name })
      if (!data) return
      this.userListOptions = data.map((v: any) => v.name)
    }

    private async handleChange(value: any) {
    
    }
    private async handleItemChange(val: any) {
          
    }

    private showStateName(state: number) {
      
      return state == 0 ? "draft" : "";
    }

    get catagory(): Array<number> {
      if (!this.postForm.catagoryId)
        return [];
      return getParent(this.cascaderOptions, this.postForm.catagoryId).map(v=>v.id)
    }

    set catagory(value) {
      this.postForm.catagoryName=(this.$refs.cascader as any).getCheckedNodes()[0].label
      this.postForm.catagoryId = value[value.length - 1]
      
    }
    @Watch('tagValues')
    getTagvalues(newTags:(number|string)[]) {
      
      let tags: ITag[] = []
      newTags.forEach(v => {
        let arr = this.tagList.filter(t => t.id === v)
      
        if (arr&&arr.length>0)
          tags.push(arr[0])
        else
          tags.push({ id: 0, name: v.toString() })

      })
      
      this.postForm.tags=tags
    }

    // 弹出选择用户对话框
    private currentUser: string | null = null
    private handleSelectUser(item:string) {
       this.userCompVisible=true

    }
    @Watch('selectedUsers')
    private onSelectedUsersChange(val: IUser[]) {
      if(val&&val.length>0)
         this.postForm.author=val[0].name

    }
  }
</script>

<style lang="scss">

  .article-textarea {
    textarea

  {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
  }
</style>

<style lang="scss" scoped>

  .createPost-container {
    position: relative;
    .createPost-main-container

  {
    padding: 40px 45px 20px 50px;
    .postInfo-container

  {
    position: relative;
    @include clearfix;
    margin-bottom: 10px;
    .postInfo-container-item

  {
    float: left;
  }

  }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
  }
</style>
