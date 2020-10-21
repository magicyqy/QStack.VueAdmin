<template>
  <div class="app-container">
    <el-main>
      <el-form :inline="true" ref="searchForm" class="demo-form-inline">
        <el-form-item label="实体仓库">
          <el-select v-model="listQuery.repository" placeholder="请选择">
            <el-option v-for="item in daoRepositories"
                       :key="item.name"
                       :label="item.name"
                       :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="实体对象">
          <el-select v-model="listQuery.entityType" placeholder="请选择">
            <el-option v-for="item in entityList"
                       :key="item.entityType"
                       :label="item.name"
                       :value="item.entityType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>


    </el-main>
    <el-row v-if="!componentMode">
      <el-button type="primary" icon="el-icon-plus" @click="add">添加</el-button>
      <p>注意：同实体仓库下同一实体存在多个规则，则只有最新一个生效</p>
    </el-row>
    <el-table v-loading="listLoading" ref="table"
              :data="list"
              border
              fit
              highlight-current-row
              style="width: 100%">
      <el-table-column type="selection"
                       width="40">
      </el-table-column>
      <el-table-column width="60"
                       align="center"
                       label="ID">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="规则描述">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="修改">
        <template slot-scope="scope">
          <span>{{ scope.row.lastModifyDate }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.ruleState"
                     active-color="#13ce66"
                     inactive-color="#DCDFE6"
                     :active-value="1"
                     :inactive-value="0" @change="setState(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="仓库">
        <template slot-scope="scope">
          <span>{{ scope.row.repository }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="实体">
        <template slot-scope="scope">
          <span>{{ scope.row.entityType |entityFilter}}</span>
        </template>
      </el-table-column>


      <el-table-column v-if='!componentMode' align="center"
                       label="Actions"
                       width="200">
        <template slot-scope="scope">
          <el-button type="primary" title="编辑"
                     size="mini"
                     icon="el-icon-edit" @click="toPage(scope.row)">
          </el-button>
          <el-button type="primary" title="删除"
                     size="mini"
                     icon="el-icon-delete" @click="del(scope.row)">
          </el-button>
          
        </template>
      </el-table-column>




    </el-table>

    <pagination v-show="total>0"
                :total="total"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.size"
                @pagination="getList" />
    <div v-if="componentMode" style="text-align:right;">
      <el-button type="primary" @click="innerComponetVisible=!innerComponetVisible">取消</el-button>
      <el-button type="primary" @click="componentsCloseNotify">确定</el-button>
    </div>
    
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
  import { updateDataAuthRuleState, getDaoRepositoies, getEntityPropertyList, deleteDataAuthRule, emptyDataAuthRule, getDataAuthList} from '@/api/dataauth'
  import { IRuleGroup, IDataAuthRule, IEntity} from '@/api/types'
  import Pagination from '@/components/Pagination/index.vue'
  import { dateformatter } from '@/utils/validate'
  @Component({
    name: 'DataAuthList',
    components: {

      Pagination
    },
    filters: {
      stateFilter: (val: number) => ['Stopped', 'Using'][val],
      entityFilter: (val: string) => val.split(",")[0]
    }
  })
  export default class extends Vue {
    @Prop({ default: false }) private componentMode!: boolean
    @Prop({ default: () => [] }) private selecedIds!: number[]
    @Prop({ default: false }) private componentVisible!: boolean
   
    private total = 0
    private list: IDataAuthRule[] = []
    private emptyForm: IDataAuthRule = Object.assign({},emptyDataAuthRule)
     
    private form = Object.assign({}, this.emptyForm)
    private listLoading = true
    private daoRepositories: { name: string, entities: IEntity[] }[] = []
  
    private listQuery = {
      page: 1,
      size: 20,
      title: '',
      repository: '',
      entityType:''
    }
    async created() {
      this.$nextTick(async ()=>{ 
        const { data } = await getDaoRepositoies({})
        this.daoRepositories = data
        await this.getList()
      })
    }
    @Watch('listQuery.repository')
    private async onSelectedEntityTypeChange(val: string) {
      this.listQuery.entityType=''
    }
    get entityList() {
      let daos = this.daoRepositories.filter(r => r.name == this.listQuery.repository)
      if (daos.length > 0)
        return daos[0].entities
      return []
    }

    private async getList() {
      this.listLoading = true
      var searchOptions: any = {
        columns: [
          { name: 'title', search: { value: this.listQuery.title, Opeartor: 6 } },
          { name: 'repository', search: { value: this.listQuery.repository, Opeartor: 6 }},
          { name: 'entityType', search: { value: this.listQuery.entityType, Opeartor: 6 } }
        ],
        order: [],
        pageIndex: this.listQuery.page,
        pageSize: this.listQuery.size
      }
      const { data } = await getDataAuthList(searchOptions)

      this.list = data.data
      this.total = data.totalCount
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    }

    private async onSubmit() {
      await this.getList()

    }
    private async add() {
      this.$router.push('/sys/dataauth/0')
    }

    private async toPage(row: IDataAuthRule) {

      this.$router.push('/sys/dataauth/' + row.id)
    }
    private async del(row: IDataAuthRule) {
      this.$confirm('此操作将永久删除记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await deleteDataAuthRule(row.id)
        await this.getList()
      }).catch(() => {

      })

    }
    private async setState(row: IDataAuthRule) {
      await updateDataAuthRuleState({ ruleId: row.id, state: row.ruleState })
      this.$message.success('state change successfully')
    }

    //页面作为组件相关
    get innerComponetVisible() {
      return this.componentVisible
    }
    set innerComponetVisible(val: boolean) {
      this.$emit("update:componentVisible", val)
    }
    private componentsCloseNotify() {
      let selections = (this.$refs.able as any).selection as IDataAuthRule[]
      let ids = selections.map(i => i.id)
      this.$emit("update:selecedIds", ids)
      this.innerComponetVisible = false
    }
  }
</script>

<style lang="scss" scoped>

  .edit-input {
    padding-right: 100px;
  }

  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>
