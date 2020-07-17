<template>
  <div class="app-container">
    <el-form :inline="true" v-model="listQuery" ref="searchForm" class="demo-form-inline">
      <el-form-item label="名称">
        <el-input v-model="listQuery.name"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button @click="resetForm('searchForm')">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row v-if="!componentMode">
      <el-button type="primary" @click="edit()">添加</el-button>
    </el-row>
    <el-table v-loading="listLoading" ref="roletable"
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
                       label="name">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="code">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="describe">
        <template slot-scope="scope">
          <span>{{ scope.row.describe }}</span>
        </template>
      </el-table-column>



      <el-table-column v-if='!componentMode' align="center"
                       label="Actions"
                       width="200">
        <template slot-scope="scope">
          <el-button type="primary" title="编辑"
                     size="mini"
                     icon="el-icon-edit" @click="edit(scope.row)">
          </el-button>
          <el-button type="primary" title="权限"
                     size="mini"
                     icon="el-icon-menu" @click="toPage(scope.row)">
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
    <el-dialog :title="d_title" ref="editDialog"
               :visible.sync="dialogVisible"
               width="60%"
               >
      <el-form v-model="form">
        <el-form-item label="名称" label-width="120px">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="代号" label-width="120px">
          <el-input v-model="form.code" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" label-width="120px">
          <el-input v-model="form.describe" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="序号" label-width="120px">
          <el-input v-model.number="form.sequence" autocomplete="off"></el-input>
        </el-form-item>
       
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="comfirmEdit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Vue,Prop } from 'vue-property-decorator'
  import { getRole, getRoles, deleteRole,postRole } from '@/api/role'
  import {  IRole } from '@/api/types'
  import Pagination from '@/components/Pagination/index.vue'
  import { Form, Popover, Table } from 'element-ui'
  import { dateformatter } from '@/utils/validate'
  @Component({
    name: 'RoleList',
    components: {
 
      Pagination
    }
  })
  export default class extends Vue {
    @Prop({ default: false }) private componentMode!: boolean
    @Prop({ default: () => [] }) private selectedItems!: IRole[]
    @Prop({ default: false }) private componentVisible!: boolean
    private d_title = ''
    private d_titles = ['添加', '编辑', '删除']
    private dialogVisible = false
    private total = 0
    private list: IRole[] = []
    private emptyForm: IRole = {
      id: 0,
      name: '',
      code: '',
      describe: '',
      sequence:0
    }
    private form = Object.assign({},this.emptyForm)
    private listLoading = true
    private listQuery = {
      page: 1,
      size: 20,
      name: '',
      dateRange: ''
    }
    created() {
      this.getList()
    }

   
    private async getList() {
      this.listLoading = true
      var searchOptions: any = {
        columns: [
          { name: 'name', search: { value: this.listQuery.name, Opeartor: 6 } }
        
        ],
        order: [],
        pageIndex: this.listQuery.page,
        pageSize: this.listQuery.size
      }
      const { data } = await getRoles(searchOptions)

      this.list = data.data
      this.total = data.totalCount
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    }
  

    private resetForm(formName: string) {
      (this.$refs[formName] as Form).resetFields();
    }
   
    private async onSubmit() {
      await this.getList()

    }
    private async comfirmEdit() {
     
      await postRole(this.form)
      this.$notify({
        title: 'Success',
        message: 'The ${this.d_titles[this.form.operate]} successfully',
        type: 'success',
        duration: 2000
      })
      this.dialogVisible = false
      this.getList()
    }
   
    private async edit(row: IRole) {
    
      this.dialogVisible = true
      if (row)
        this.form = Object.assign(this.form, row)
      else
        this.form = Object.assign({},this.emptyForm)
     
    }
    private async del(row: IRole) {
      this.$confirm('此操作将永久删除记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteRole(row.id)
        await this.getList()
      }).catch(() => {
        
      })
    
    }

    private async toPage(row: IRole){
      sessionStorage.setItem('current_rolepermission_' + row.id, JSON.stringify(row))
      this.$router.push('/sys/rolepermission/'+row.id)
    }

    //页面作为组件相关
    get innerComponetVisible() {
      return this.componentVisible
    }
    set innerComponetVisible(val: boolean) {   
      this.$emit("update:componentVisible",val)
    }
    private componentsCloseNotify() {
      let selections = (this.$refs.roletable as any).selection as IRole[]
      //let ids = selections.map(i => i.id)
      this.$emit("update:selectedItems", selections)
      this.innerComponetVisible=false
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
