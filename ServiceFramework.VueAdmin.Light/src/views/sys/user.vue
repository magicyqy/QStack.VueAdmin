<template>
  <div>
    <el-container class="app-container">
      <el-aside width="300px" style="background-color: rgb(238, 241, 246); padding:15px;">
        <el-tree :data="grouplist" ref="tree" style="background-color: rgb(238, 241, 246);"
                 show-checkbox
                 node-key="id"
                 :props="defaultProps"
                 default-expand-all
                 :expand-on-click-node="false" @node-click="nodeclick"
                 @check="setSelectedNode">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
            <span v-if="!componentMode">
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
            </span>
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
          <el-form-item v-if="!componentMode">
            <el-button type="primary" icon="el-icon-user" @click="editUser(null)">添加用户</el-button>
            <el-button type="primary" icon="el-icon-custom-user" @click="changeGroup">移  组</el-button>
            <el-button type="primary" icon="el-icon-coordinate" @click="chooseRoles">分配角色</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="listLoading" ref="table"
                  :data="list"
                  border
                  fit
                  @select="selectRow"
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
                           label="用户名">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center"
                           label="代号">
            <template slot-scope="scope">
              <span>{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center"
                           label="分组">
            <template slot-scope="scope">
              <span>{{ scope.row.groupName }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" width="80"
                           label="状态">
            <template slot-scope="scope">
              <span>{{ scope.row.state|stateFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" width="100" v-if="!componentMode"
                           label="创建">
            <template slot-scope="scope">
              <span>{{ scope.row.createDate }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center"
                           label="角色">
            <template slot-scope="scope">
              <span>{{ ...scope.row.roles.map(r=>r.name) }}</span>
            </template>
          </el-table-column>



          <el-table-column align="center" v-if="!componentMode"
                           label="Actions"
                           width="200">
            <template slot-scope="scope">
              <el-button type="primary" title="编辑"
                         size="mini"
                         icon="el-icon-edit" @click="editUser(scope.row)">
              </el-button>
              <el-button type="primary" title="重置密码"
                         size="mini"
                         icon="el-icon-lock" @click="editPassword(scope.row)">
              </el-button>
              <el-button type="primary" title="删除"
                         size="mini"
                         icon="el-icon-delete" @click="delUser(scope.row)">
              </el-button>
            </template>
          </el-table-column>




        </el-table>

        <pagination v-show="total>0"
                    :total="total"
                     layout="prev, pager, next"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.size"
                    @pagination="getList" />


        
        <el-dialog :title="'分配角色-当前用户：'+(selectedRow?selectedRow.name:'')" :visible.sync="userRoleDialogVisible" width="50%">
          <el-row>
            <el-col :span="22"> <el-transfer :titles="['角色', '已分配角色']" v-model="user_roles" :data="roles" :props="trasferProps"></el-transfer></el-col>
            <el-col :span="2">
              <el-button type="primary"
                         @click="comfirmUR">确定</el-button>
            </el-col>
          </el-row>
        </el-dialog>
      </el-main>


      <UserForm :dialog-visible.sync="dialogVisible" :operator="operator" :targetUser="userform" @submitFinished="userFormFinished" />
      <GroupForm :dialog-visible.sync="groupDialogVisible" :targetGroup="groupform" @submitFinished="groupFormFinished" />
      <PasswordForm :dialog-visible.sync="pwdDialogVisible" :targetUser="selectedRow" :is-current="false" @submitFinished="selectedRow=null" />
    </el-container>
    <div v-if="componentMode" style="text-align:right;">
      <el-button type="primary" @click="innerComponetVisible=!innerComponetVisible">取消</el-button>
      <el-button type="primary" @click="componentsCloseNotify">确定</el-button>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue,Prop } from 'vue-property-decorator'
  import { getUsers,  deleteUser, postUser ,postUserRoles, emptyUser,UserState} from '@/api/users'
  import { IGroup, IUser, IRole } from '@/api/types'
  import Pagination from '@/components/Pagination/index.vue'
  import { TreeData, TreeNode } from 'element-ui/types/tree'
  import { Form,  Tree, Table, Row } from 'element-ui'
  import { Operators } from '@/utils/validate'
  import { emptyGroup,  getGroups, postGroup, deleteGroup } from '@/api/group'
  import { getRoles, } from '@/api/role'
  import { treeNode } from 'element-ui/types/table'
  import { PasswordForm,UserForm ,GroupForm} from './components'
  @Component({
    name: 'UserList',
    components: {
      Pagination,
      PasswordForm,
      UserForm,
      GroupForm
    },
    filters: {
      stateFilter: (type: number) => {

        return UserState[type]
      }

    }
  })
  export default class extends Vue {
    @Prop({ default: false }) private componentMode!: boolean
    @Prop({ default: () => [] }) private selectedItems!: IUser[]
    @Prop({ default: false }) private componentVisible!: boolean
    private defaultProps = {
      children: 'children',
      label: 'name',
      disabled:(data:TreeData,node:treeNode)=>data.id==-1
    };
    private groupDialogVisible = false
    private dialogVisible = false
    private pwdDialogVisible=false
    private total = 0
    private list: IUser[] = []
    private root= { id: -1, parentId: null, name: '用户组', children: []}
    private grouplist:any[]= []
    private selectedGroup: IGroup|null = null
    private userform = Object.assign({}, emptyUser)
    private groupform = Object.assign({},emptyGroup)
    private listLoading = true
    private operator=0
    private listQuery = {
      page: 1,
      size: 20,
      name: '',
      groupId:0,
      dateRange: ''
    }
    
    async created() {
      await  this.getList()
      await this.getGroups()
    }
    

    private async getList() {
      this.listLoading = true
      var searchOptions: any = {
        columns: [
          { name: 'name', search: { value: this.listQuery.name, Opeartor: Operators.Contains } },
          { name: 'groupId', search: { value: this.listQuery.groupId > 0 ? this.listQuery.groupId.toString():null, Opeartor: Operators.Equal }}
        ],
        order: [],
        pageIndex: this.listQuery.page,
        pageSize: this.listQuery.size
      }
      const { data } = await getUsers(searchOptions)

      this.list = data.data
      this.total = data.totalCount
      this.selectedRow = null
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    }
    private async getGroups() {
      const { data } = await getGroups({})
      this.root.children = data
      this.grouplist.length=0
      this.grouplist.push(this.root)
    }


    private async onSubmit() {
      await this.getList()

    }
  

    //用户
    private async editUser(row: IUser) {
     
      if (!this.selectedGroup && !row) {
        this.$message('请选择用户组')
        return
      }
      this.dialogVisible = true
      if (row) {
        this.userform=row
        this.operator = 1       
      }
      else {
        this.userform = Object.assign({}, emptyUser)
        this.userform.groupId = this.selectedGroup!.id
        this.userform.groupName = this.selectedGroup!.name
        this.operator = 0
      }

    }
    private async delUser(row: IUser) {
      this.$confirm('此操作将冻结用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.id)
        this.getList()
      }).catch(() => {

      })
     
    }
    private async changeGroup() {
      if (!this.selectedGroup ) {
        this.$message('请选择用户组')
        return
      }
      if (!this.selectedRow) {
        this.$message('请选择用户')
        return
      }
      if (this.selectedRow.groupId == this.selectedGroup.id) {
        this.$alert("用户已在当前选择组")
        return
      }
      this.$confirm(`确定移动用户：${this.selectedRow.name},从 ${this.selectedRow.groupName}=>${this.selectedGroup.name}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        let user = this.selectedRow as IUser
        user.groupId = this.selectedGroup!.id
        await postUser(user);
        this.getList()
      }).catch(() => {

      })
    }
    private editPassword(row: any) {
      this.pwdDialogVisible = true
      this.selectedRow=row
    }
    private async userFormFinished() {
      await this.getList()
    }
    //用户组
    private async setSelectedNode(data:TreeData, obj:any) {
      
      (this.$refs.tree as Tree).setCheckedNodes([]);
      
      if (this.selectedGroup==null||data.id !== this.selectedGroup!.id) {
        (this.$refs.tree as Tree).setChecked(data.id, true, false);
         this.selectedGroup = data as IGroup
      }
      else {
        
         this.selectedGroup=null
      }

     
    }
    private async edit(data: TreeData, operate: number) {
      this.groupDialogVisible = true
     
      if (operate != 0)
        this.groupform = Object.assign({}, data as IGroup)
      else {
        this.groupform = Object.assign({}, emptyGroup)
        this.groupform.parentId = (data as IGroup)!.parentId
        this.groupform.parentName = (data as IGroup)!.name
      }
      this.operator = operate
    }
    private async remove(node: TreeNode<number, TreeData>, data: TreeData) {
      const parent = node.parent
      const children = parent!.data.children

      if (data && data.children!.length > 0) {
        this.$message('存在子节点')
        return
      }
      await deleteGroup(data.id)
      this.$notify({
        title: 'Success',
        message: 'delete  successfully',
        type: 'success',
        duration: 2000
      })
      this.getGroups()
    }
    private async nodeclick(data: TreeData) {
      this.listQuery.groupId = (data as IGroup).id
      await this.getList()
    }
    private async groupFormFinished() {
      await this.getGroups()
    }
    //角色分配
    private selectedRow: any = null;
    private userRoleDialogVisible=false
    private user_roles:number[] = []
    private roles: IRole[]= []
    private trasferProps = {
      key: 'id',
      label:'name'
    }
    private selectRow(selection: any, row: any) {
      if (this.componentMode)
        return
      (this.$refs.table as Table).clearSelection();
      if (this.selectedRow && this.selectedRow.id === row.id) {
     
        this.selectedRow = null

      }
      else {
        (this.$refs.table as Table).toggleRowSelection(row, true);
        this.selectedRow =row
      }

    }
    private async chooseRoles() {
      if (!this.selectedRow) {
        this.$message('请选择用户')
        return
      }
      this.userRoleDialogVisible = true;     
      const { data } = await getRoles({ pageIndex: 1, pageSize: 100 })
      this.user_roles = (this.selectedRow.roles as IRole[]).map(i => i.id)     
      let ids = this.user_roles
      this.roles =data.data as  IRole[]
    }

    private async comfirmUR() {      
       
        await postUserRoles({ userId: this.selectedRow.id, roleIds: this.user_roles})
        this.$notify({
          title: 'Success',
          message: 'save  successfully',
          type: 'success',
          duration: 2000
        })
      
      this.userRoleDialogVisible = false;
      await this.getList()
    }

    //页面作为组件相关
    get innerComponetVisible() {
      return this.componentVisible
    }
    set innerComponetVisible(val: boolean) {
      this.$emit("update:componentVisible", val)
    }
    private componentsCloseNotify() {
      let selections = (this.$refs.table as any).selection as IRole[]
      //let ids = selections.map(i => i.id)
      this.$emit("update:selectedItems", selections)
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
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .el-table{
      ::v-deep th.is-leaf .el-checkbox {
    display: none;
  }}
   
</style>
