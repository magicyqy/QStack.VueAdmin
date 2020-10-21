<template>

  <el-container class="app-container">
    <el-aside width="250px" style="background-color: rgb(238, 241, 246); padding:15px;">
      <el-tree :data="functionlist" ref="tree" style="background-color: rgb(238, 241, 246);"
               show-checkbox
               :check-strictly="true" 
               node-key="id"
               :props="defaultProps"
               default-expand-all
               :expand-on-click-node="false"
               @check="setSelectedNode"
               @node-click="nodeclick"
                  draggable :allow-drag="()=>true" :allow-drop="()=>true"  @node-drag-end="handleDragEnd"
               >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <!--<span>
            <el-button type="text"
                       size="mini"
                       @click="() => edit(data,0)">
              添加
            </el-button>
            <el-button type="text"
                       size="mini"
                       @click="() => edit(data,1)" v-if="data.id >0">
              编辑
            </el-button>
            <el-button type="text"
                       size="mini"
                       @click="() => remove(node, data)" v-if="data.id >0">
              删除
            </el-button>
          </span>-->
        </span>
      </el-tree>
    </el-aside>
    <el-main>
      <el-form :inline="true" v-model="listQuery" ref="searchForm" class="demo-form-inline">
        <el-form-item label="名称">
          <el-input placeholder="请输入内容" v-model="listQuery.name" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="onSubmit"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-menu" @click="edit(null)">添加</el-button>
          <!--<el-button type="primary" icon="el-icon-coordinate" @click="chooseRoles">分配角色</el-button>-->
        </el-form-item>
      </el-form>

      <el-table v-loading="listLoading" ref="table"
                :data="list"
                border
                fit
                highlight-current-row
                style="width: 100%">
        <el-table-column type="selection"
                         width="55">
        </el-table-column>
        <el-table-column width="60"
                         align="center"
                         label="ID">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center"
                         label="功能名称">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="80"
                         label="类型">
          <template slot-scope="scope">
            <span>{{ scope.row.functionType|typeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center"
                         label="路径">
          <template slot-scope="scope">
            <span>{{ scope.row.path }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="60"
                         label="图标">
          <template slot-scope="scope">
            <span> <i :class="'el-icon-'+scope.row.iconUrl"></i></span>
          </template>
        </el-table-column>
        <el-table-column align="center"
                         label="描述">
          <template slot-scope="scope">
            <span>{{ scope.row.describe }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center"
                         label="Actions"
                         width="200">
          <template slot-scope="scope">
            <el-button type="primary" title="编辑"
                       size="mini"
                       icon="el-icon-edit" @click="edit(scope.row)">
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

      <el-dialog :title="d_title" ref="userDialog"
                 :visible.sync="dialogVisible"
                 width="60%">
        <el-form v-model="form">
          <el-input v-model="form.parentId" autocomplete="off" type="hidden"></el-input>
          <el-form-item label="父节点" label-width="120px">
            <el-input v-model="form.parentName" autocomplete="off" :disabled="true"></el-input>
          </el-form-item>
          <el-row>
            <el-col :span="8">
              <el-form-item label="功能名称" label-width="120px">
                <el-input v-model="form.name" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="路由名称" label-width="120px">
                <el-input v-model="form.routeName" autocomplete="off" ></el-input>
              </el-form-item>
            </el-col>
          
            <el-col :span="8">
              <el-form-item label="代号" label-width="120px">
                <el-input v-model="form.code" autocomplete="off" :readonly="true"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="16">
              <el-form-item label="路径" label-width="120px">
                <el-input v-model="form.path" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="隐藏菜单" label-width="120px">
                <el-switch v-model="form.hidden" title="只作用于菜单类型"
                           active-color="#13ce66"
                           inactive-color="#ececec">
                </el-switch>
                </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-form-item label="图标" label-width="120px">
                <!--<el-input v-model="form.iconUrl" autocomplete="off" type="hi">  </el-input>-->
                 <i :class="'el-icon-'+form.iconUrl" style="font-size:20px;" />
              </el-form-item>
            </el-col>
            <el-col :span="4"><icons v-model="form.iconUrl" /></el-col>
            <el-col :span="12">
              <el-form-item label="类型" label-width="120px">
                <el-select v-model="form.functionType" placeholder="请选择">
                  <el-option v-for="item in enumToMap"
                             :key="item.value"
                             :label="item.name"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          
          <el-form-item label="描述" label-width="120px">
            <el-input v-model="form.describe" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="序号" label-width="120px">
            <el-input v-model.number="form.sequence" autocomplete="off"></el-input>
          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="comfirmEdit(form)">确定</el-button>
        </span>
      </el-dialog>
   
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { getFunctionPage,getFunctions,postFunction,deleteFunction,emptyFunction, FunctionType } from '@/api/appfunction'
  import { IFunction } from '@/api/types'
  import Pagination from '@/components/Pagination/index.vue'
  import { TreeData, TreeNode } from 'element-ui/types/tree'
  import { Form, Popover, Tree, Table } from 'element-ui'
  import { Operators } from '@/utils/validate'
  import Icons  from '@/components/El-Icons/index.vue'
  import { treeNode } from 'element-ui/types/table'
  @Component({
    name: 'FunctionList',
    components: {
      Pagination,
      Icons
    },
    filters: {
      typeFilter: (type: number) => {
        
        return FunctionType[type]
      }

    }
  })
  export default class extends Vue {
    private defaultProps = {
      children: 'children',
      label: 'name',
      disabled: (data: TreeData, node: treeNode) => data.id == -1
    };
   
    private dialogVisible = false
    private total = 0
    private list: IFunction[] = []
    private root = { id: -1, parentId: null, name: '全部',code:'', children: [] }
    private functionlist: any[] = []
    private selectedNode: IFunction | null = Object.assign({}, emptyFunction,this.root)
    private form = Object.assign({}, emptyFunction)
   
    private listLoading = true
    private d_title = ''
    private d_titles = ['添加', '编辑', '删除']
    private listQuery = {
      page: 1,
      size: 20,
      name: '',
      code:'',
      dateRange: ''
    }
    async created() {
      await this.getList()
      await this.getTree()
    }


    private async getList() {
      this.listLoading = true
      var searchOptions: any = {
        columns: [
          { name: 'name', search: { value: this.listQuery.name, Opeartor: Operators.Contains } },
          { name: 'code', search: { value: this.listQuery.code,Opeartor:Operators.StartWith}}

        ],
        order: [{ column:'id',dir:'asc'}],
        pageIndex: this.listQuery.page,
        pageSize: this.listQuery.size,
        IncludePaths:['Parent']
      }
      const { data } = await getFunctionPage(searchOptions)

      this.list = data.data
      this.total = data.totalCount
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    }
    private async getTree() {
      const { data } = await getFunctions({})
      this.root.children = data
      this.functionlist.length = 0
      this.functionlist.push(this.root)
    }

    private resetForm(formName: string) {
      (this.$refs[formName] as Form).resetFields();
    }

    private async onSubmit() {
      await this.getList()

    }
    private async comfirmEdit(form: IFunction) {
      if (form.parentId == null)
        form.parentName=null
      await postFunction(form)
      this.getList()
      this.getTree()
      this.$notify({
        title: 'Success',
        message: 'save  successfully',
        type: 'success',
        duration: 2000
      })
   
      this.dialogVisible = false
    }

    //用户
    private async edit(row: IFunction) {
     
      if (!this.selectedNode && !row) {
        this.$message('请选择父节点')
        return
      }
      this.dialogVisible = true
 
      if (row)
        this.form = Object.assign(this.form, row)
      else {
        this.form = Object.assign({}, emptyFunction)
        this.form.parentId = this.selectedNode!.id
        if (this.form.parentId === -1)
          this.form.parentId=null
        this.form.parentName = this.selectedNode!.name
        this.form.code=this.gencode(this.selectedNode)
      
      }

    }
    private async del(row: IFunction) {
      var node = (this.$refs.tree as Tree).getNode(row.id)
      if (node && node.childNodes.length > 0) {
        this.$alert('存在子节点')
        return
      }
      this.$confirm('此操作将永久删除记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteFunction(row.id)
        this.getList()
        this.getTree()
      }).catch(() => {

      })

    }

    //用户组
    private async setSelectedNode(data: TreeData,checked:boolean, obj: any) {
      
      (this.$refs.tree as Tree).setCheckedNodes([]);

      if (this.selectedNode == null || data.id !== this.selectedNode!.id) {
        (this.$refs.tree as Tree).setChecked(data.id, true, false);
        this.selectedNode = data as IFunction
      }
      else {

        this.selectedNode = null
      }


    }

    private async nodeclick(data: TreeData) {
      this.listQuery.code = (data as IFunction).code
      await this.getList()
    }

    public async handleDragEnd(draggingNode: TreeNode<number, IFunction>, dropNode: TreeNode<number, IFunction>, dropType:any, ev:any) {
      //console.log('tree drag end: ', dropNode && dropNode.label, dropType);
      let postData = Object.assign({}, draggingNode.data)
      postData.parentId = dropNode.data.parentId
      var parentId = dropNode.data.parentId || -1
      var parent = (this.$refs.tree as Tree).getNode(parentId).data 
      postData.code = this.gencode(parent as IFunction)
      //console.log(postData)
      await this.comfirmEdit(postData)
     
    }


    get enumToMap() {
      let map = Object.entries(FunctionType).filter(e => !isNaN(e[0] as any)).map(e => ({ name: e[1], value: Number(e[0]) }));
      return map;
    }

    private gencode(node: { id: number, code: string } | null) {
      
      let treenode = (this.$refs.tree as Tree).getNode(node!.id)
      if (treenode.childNodes && treenode.childNodes.length > 0) {
        let numArr = treenode.childNodes.map(i => Number((i.data as { id: number, code: string }).code))      
        let max = Math.max(...numArr)
        return `${max+1}`
      }
      return node!.code == '' ? '101' : node!.code+'001'
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

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
