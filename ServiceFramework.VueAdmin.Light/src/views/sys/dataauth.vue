<template>
  <div>
    <el-container class="app-container">
      <!--<el-aside width="300px" style="background-color: rgb(238, 241, 246); padding:5px;">
      <el-card shadow="never">
        <div slot="header" class="clearfix">
          <el-button style="float: right; padding: 3px 0" type="text">添加规则</el-button>
        </div>
        <div v-for="o in 4" :key="o" class="text item">
          {{'列表内容 ' + o }}
          <el-divider></el-divider>
        </div>
      </el-card>
    </el-aside>-->
      <el-main>
        <el-form :inline="true" ref="searchForm" class="demo-form-inline">
          <el-form-item label="实体仓库">
            <el-select v-model="selectedDaoRepository" placeholder="请选择" :disabled="isEdit" >
              <el-option v-for="item in daoRepositories"
                         :key="item.name"
                         :label="item.name"
                         :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="实体对象">
            <el-select v-model="selectedEntityType" placeholder="请选择" :disabled="isEdit">
              <el-option v-for="item in entityList"
                         :key="item.entityType"
                         :label="item.name"
                         :value="item.entityType">
              </el-option>
            </el-select>
          </el-form-item>

          <div v-if="ruleFormVisible">
            <rule-item :isDelete="false" :rule-level="0" :rule-form="ruleForm"></rule-item>
            <el-input v-model="ruleForm.title" placeholder="请输入规则描述"></el-input>
          </div>

        </el-form>


      </el-main>
      <el-footer>
        <el-button type="primary" icon="el-icon-finished" @click="saveRule">保存规则</el-button>
        <el-button type="primary" icon="el-icon-camera" @click="generate">生成预览</el-button>
      </el-footer>
    </el-container>
    <div style="margin:50px;">
      <el-form ref="preForm" class="demo-form-inline">
        <el-form-item label="表达式预览 ( 表达式含有环境变量时,会使用当前登陆用户的关联变量值参与计算 ) ">
          <el-input type="textarea" v-loading="preloading"
                    :rows="5"
                    readonly
                    v-model="previewExpression">
          </el-input>
          </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts">
  import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
  import ruleItem from './components/ruleitem.vue'
  import { IEntity, IProperty, IRuleGroup } from '@/api/types'
  import { getDataAuthRule, getDaoRepositoies, getEntityPropertyList, postRuleGroup, generateExpresssion, newRuleGroup} from '@/api/dataauth'

  @Component({
    name: 'addRule',
    components: {
      ruleItem
    },
    filters: {

    }
  })
  export default class extends Vue {
    //@Prop({ default: null }) private dataSource!: [string, object]
    private propertyDatas: IProperty[]=[]
    private daoRepositories: { name: string, entities: IEntity[] }[] = []
    private selectedDaoRepository: string = ''
    private selectedEntityType: string = ''    
    private ruleForm: IRuleGroup = newRuleGroup()
    private ruleFormVisible = false
    private previewExpression=''
    private preloading=false
    private isEdit=false
    get entityList() {
      let daos = this.daoRepositories.filter(r => r.name == this.selectedDaoRepository)
      if (daos.length > 0)
        return daos[0].entities
      return []
    }
    
    @Watch('selectedDaoRepository')
    private onSelectedDaoRepositoryChange(val: string) {
      if (this.isEdit)
        return;
      this.selectedEntityType = ''
     
    }
    @Watch('selectedEntityType')
    private async onSelectedEntityTypeChange(val: string) {
      if (this.isEdit)
        return;
      if (val && val != '') {
        this.ruleFormVisible = true
        this.ruleForm = newRuleGroup(val)

        this.ruleForm.repository = this.selectedDaoRepository

      }
      else {
        this.ruleForm = newRuleGroup()
        this.ruleFormVisible = false
      }
     
    }
    async created() {
      const id = this.$route.params && this.$route.params.id
      this.isEdit=Number(id) > 0
      //this.ruleForm = this.dataSource ? JSON.parse(this.dataSource[0]) : Object.assign({}, this.ruleFormC)
      const { data } = await getDaoRepositoies({})
      this.daoRepositories = data
     
      if (this.isEdit) {
        await getDataAuthRule(id)
          .then(async res => {
            this.ruleForm = res.data
            this.selectedDaoRepository = this.ruleForm.repository
           
            this.ruleFormVisible = true
            this.$nextTick(() => { this.selectedEntityType = this.ruleForm.entityType })

            await this.generate()

          })

      }
      
    }
    

    private async getEntityPropertyList(isFirstLevel:boolean) {
      const { data } = await getEntityPropertyList({ entityType: this.selectedEntityType, isFirstLevel:isFirstLevel });
      this.propertyDatas = data;
    }
    
    private async saveRule() {
      const { data }= await postRuleGroup(this.ruleForm)
      this.ruleForm.id = data
      this.$message.success("save successfully")
      this.$router.replace('/sys/dataauth/'+data)
   
    }

    private async generate() {
      this.preloading = true      
      const { data } = await generateExpresssion(this.ruleForm)     
      this.previewExpression=data      
      this.preloading=false
      
    }
  }
</script>

<style lang="scss">
  .dialog-mini .el-select {
    width: 100%;
  }

  .rule-group-box {
    .ellipsis

  {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .ruleSpan {
    cursor: pointer;
    color: #409eff;
  }

  .custom-dialog {
    .el-dialog

  {
    height: 70%;
    .el-dialog__body

  {
    height: calc(100% - 35px - 40px);
  }

  }
  }

  .custom-card {
    height: 100%;
    .el-card__body

  {
    height: calc(100% - 34px);
    overflow: auto;
  }

  }

  .flex-row {
    width: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .flex-item {
    flex:1;
    overflow: hidden;
  }

  .VMB {
    &::before

  {
    content: "";
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }

  .VM {
    display: inline-block;
    vertical-align: middle;
  }

  }
  }

  .part-box {
    width: 200px;
    border: 1px solid #e4e4e4;
  }

  .table-box {
    border: 1px solid #e4e4e4;
    border-left: 0;
  }

  .rule-group-box {
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 10px;
    .rule-groups

  {
    .rule-head

  {
    padding: 5px 10px;
    background: #e4e4e4;
    .sellect-operation

  {
    width: 120px;
  }

  }

  .rule-form {
    padding-bottom: 0;
    border: 1px solid #e4e4e4;
    border-radius: 0 0 0 5px;
    border-top: 0;
    padding-left: 10px;
    padding-right: 10px;
    .el-form

  {
    padding-top: 0;
  }

  }
  }

  .add-rule-group {
    text-align: center;
    border: 1px solid #e4e4e4;
    border-radius: 0px 5px 5px 0;
    font-size: 60px;
    font-weight: bold;
    padding: 0 30px;
    border-left: 0;
    cursor: pointer;
    color: #999999;
    i: hover

  {
    color: #4a4b4b;
  }

  }
  }

 </style>
