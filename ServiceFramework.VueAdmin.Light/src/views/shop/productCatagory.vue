<template>
  <div class="app-container">
    <!--<el-button type="text"
               size="mini"
               @click="edit(null,0)">
      添加
    </el-button>-->
    <el-input v-model="filterText"
              placeholder="Filter keyword"
              style="margin-bottom:30px;" />
    <el-tree :data="data2"
             node-key="id" ref="tree"
             :props="defaultProps"
             default-expand-all
             :expand-on-click-node="false">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
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

    <el-dialog :title="d_title" ref="editDialog"
               :visible.sync="dialogVisible" 
               width="60%"
               :before-close="handleClose">
      <el-form v-model="form">
        <el-form-item label="类别名称" label-width="120px">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Code" label-width="120px">
          <el-input v-model="form.code" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="url" label-width="120px">
          <el-input v-model="form.url" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="seoTitle" label-width="120px">
          <el-input v-model="form.seoTitle" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="seoKeyWord" label-width="120px">
          <el-input v-model="form.seoKeyWord" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="seoDescription" label-width="120px">
          <el-input v-model="form.seoDescription" autocomplete="off"></el-input>
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
  import { getCatagories, postCatagory, deleteCatagory } from '@/api/product'
  @Component({
    name: 'ProductCatagory'
  })
  export default class extends Vue {
    private form = {
      id: 0,
      name: '',
      url: '',
      code:'',
      seoTitle: '',
      seoKeyWord: '',
      seoDescription: '',
      parentId: null,
      operate: 0
    }
    private root = { id: -1, parentId: null, name: '全部', code: '', children: [] }
    private filterText = '';
    private data2:any = [];
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
      const { data } = await getCatagories()
      this.root.children = data
      this.data2.push(this.root)
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
        this.form = {
          id: data.id, name: (data as any).name, parentId: (data as any).parentId, operate: operate, url: '',
          seoTitle: (data as any).seoTitle,
          seoKeyWord: (data as any).seoKeyWord,
          seoDescription: (data as any).seoDescription,
          code:(data as any).code
        }
      else
        this.form = {
          id: 0, name: '', parentId: data == null ? null : data!.id, operate: operate, url: '',
          seoTitle: '',
          seoKeyWord: '',
          seoDescription: '',
          code: this.gencode(data as any)
        }

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
        await postCatagory(this.form);
      else
        await deleteCatagory(this.form.id)
      this.$notify({
        title: 'Success',
        message: 'The ${this.d_titles[this.form.operate]} successfully',
        type: 'success',
        duration: 2000
      })
      this.dialogVisible = false
      this.fetchCatagory()
    }
    private gencode(node: { id: number, code: string } | null) {
      let treenode = (this.$refs.tree as ElTree).getNode(node!.id)
      if (treenode.childNodes && treenode.childNodes.length > 0) {
        let numArr = treenode.childNodes.map(i => Number((i.data as { id: number, code: string }).code))
        let max = Math.max(...numArr)
        return `${max + 1}`
      }
      return node!.code == '' ? '101' : node!.code + '001'
    }
    private async handleClose() {
      this.dialogVisible = false

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

