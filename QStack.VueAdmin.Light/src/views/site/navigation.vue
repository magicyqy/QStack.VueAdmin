<template>
  <div class="app-container">
    <el-button type="text"
               size="mini"
               @click="edit(null,0)">
      添加
    </el-button>
    <el-input v-model="filterText"
              placeholder="Filter keyword"
              style="margin-bottom:30px;" />
    <el-tree :data="data2"
             node-key="id"
             :props="defaultProps"
             default-expand-all
             :expand-on-click-node="false">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>{{ data.flowNo }}</span>
        <span>
          <el-button type="text"
                     size="mini"
                     @click="() => edit(data,0)">
            添加
          </el-button>
          <el-button type="text"
                     size="mini"
                     @click="() => edit(data,1)">
            编辑
          </el-button>
          <el-button type="text"
                     size="mini"
                     @click="() => remove(node, data)">
            删除
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog :title="d_title" ref="editDialog"
               :visible.sync="dialogVisible"
               width="30%"
               :before-close="handleClose">
      <el-form v-model="form">
        <el-form-item label="导航名称" label-width="120px">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>

      </el-form>
      <el-form v-model="form">
        <el-form-item label="导航地址" label-width="120px">
          <el-input v-model="form.url" autocomplete="off"></el-input>
      </el-form-item>
        </el-form>
      <el-form v-model="form">
          <el-form-item label="排序" label-width="120px">
            <el-input v-model.number="form.flowNo" autocomplete="off" ></el-input>
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
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { Tree as ElTree, Dialog as ELDialog } from 'element-ui'
  import { TreeData, TreeNode } from 'element-ui/types/tree'
  import { getMenus, postMenu, deleteMenu } from '@/api/siteSetting'
  @Component({
    name: 'NavigationMenu'
  })
  export default class extends Vue {
    private form = {
      id: 0,
      name: '',
      url: '',
      flowNo:0,
      parentId: null,
      operate: 0
    }
    private filterText = '';
    private data2 = [];
    private defaultProps = {
      children: 'children',
      label: 'name'
    };
    private d_title = ''
    private d_titles = ['添加', '编辑', '删除']
    private dialogVisible = false
    created() {
      this.fetchCatagory()
    }
    private async fetchCatagory() {
      const { data } = await getMenus()
      this.data2 = data
    }
    @Watch('filterText')
    private onFilterTextChange(value: string) {
      (this.$refs.tree2 as ElTree).filter(value)
    }

    private filterNode(value: string, data: TreeData) {
      if (!value) { return true }
      return data.label && data.label.indexOf(value) !== -1
    }
    //private id = 1000
    private async edit(data: TreeData, operate: number) {
      this.dialogVisible = true
      this.d_title = this.d_titles[operate]
      if (operate != 0)
        this.form = Object.assign(this.form, data, {operate: operate })
      else
        this.form = { id: 0, name: '', parentId: data == null ? null : data!.id,url:'',flowNo:0,operate: operate }

      //const newChild = { id: this.id++, label: 'testtest', children: [] }
      //if (!data.children) {
      //  this.$set(data, 'children', [])
      //}
      //data.children!.push(newChild)
    }

    private async remove(node: TreeNode<number, TreeData>, data: TreeData) {
      const parent = node.parent
      const children = parent!.data.children

      if (data && data.children!.length > 0) {
        this.$message('存在子节点')
        return
      }
      this.edit(data, 2)
      //const index = children!.findIndex(d => d.id === data.id)
      //children!.splice(index, 1)
    }

    private async comfirmEdit() {

      if (this.form.operate != 2 && this.form.name == '') {

        return
      }
      if (this.form.operate != 2)
        await postMenu(this.form);
      else
        await deleteMenu(this.form.id)
      this.$notify({
        title: 'Success',
        message: `${this.d_titles[this.form.operate]} successfully`,
        type: 'success',
        duration: 2000
      })
      this.dialogVisible = false
      this.fetchCatagory()
    }

    private async handleClose() {

    }
  }
</script>

<style lang="scss" scoped>

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>

