<template>

  <el-container class="app-container">
  
    <el-main>
      <el-header>
          当前授权角色：<span>{{currentRole.name||''}}</span>
      </el-header>
      <el-form :inline="true" v-model="listQuery" ref="searchForm" class="demo-form-inline">
        
        <el-form-item>
          <el-button type="primary" icon="el-icon-finished" @click="save">保存</el-button>
         
        </el-form-item>
      </el-form>

      <el-tree :data="functionlist" ref="tree" style="background-color: rgb(238, 241, 246);"
               show-checkbox              
               node-key="id"
               :props="defaultProps"
               default-expand-all
               :expand-on-click-node="false"
               @check="setSelectedNode"
               >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>

        </span>
      </el-tree>
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { getFunction, getFunctions } from '@/api/appfunction'
  import { postPermission,getPermissions } from '@/api/role'
  import { IFunction,IRole } from '@/api/types'
  import { TreeData, TreeNode } from 'element-ui/types/tree'
import { Tree } from 'element-ui';
  @Component({
    name: 'PermissionList'
  })
  export default class extends Vue {
    private defaultProps = {
      children: 'children',
      label: 'name'
    };
    private currentRole: IRole|null = null
   
    private list: IFunction[] = []
    private root = { id: -1, parentId: null, name: '全部', code: '', children: [] }
    private functionlist: any[] = []

    private listLoading = true
  
    private listQuery = {
      page: 1,
      size: 20,
      name: '',
      code: '',
      dateRange: ''
    }
    async created() {
      let roleStr = sessionStorage.getItem('current_rolepermission_' + this.$route.params.id)
      if(roleStr)
        this.currentRole = JSON.parse(roleStr)
      await this.getTree()
     
    }
    async destroyed() {
      //sessionStorage.removeItem('current_rolepermission_' + this.$route.params.id)
    }
    async mounted() {
 
    }
    private async getTree() {
      const { data } = await getFunctions({})
      this.root.children = data
      this.functionlist.length = 0
      this.functionlist.push(this.root)

      let data1 = await getPermissions(this.currentRole!.id)
      this.$nextTick(() => {
        this.setChecked(data1.data)
      })
    }


    //用户组
    private async setSelectedNode(data: TreeData, checked: boolean, obj: any) {

    }

    private async save() {
      let nodes = (this.$refs.tree as Tree).getCheckedNodes(false,true);
      nodes = nodes.filter(n => n.id > 0);
      let keys=nodes.map(n=>n.id)
     
      await postPermission({ roleId: this.currentRole!.id, functionIds: keys })
      this.$notify({
        title: 'Success',
        message: 'save successfully',
        type: 'success',
        duration: 2000
      })
      await this.getTree()
    }

    private setChecked(list: { roliId: number, functionId: number }[]) {
      var tree = this.$refs.tree as Tree
      list.forEach(value => {
        var node = tree.getNode(value.functionId)
        if (node && node.childNodes.length== 0)
          tree.setChecked(value.functionId,true,false)
      })
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
