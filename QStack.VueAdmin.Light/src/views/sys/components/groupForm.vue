<template>
  <el-dialog :title="d_title" ref="groupDialog"
             :visible.sync="innerVisible"
             width="60%">
    <el-form :model="groupform"  ref="form">
      <el-input v-model="groupform.Id" autocomplete="off" type="hidden"></el-input>
      <el-form-item label="父节点" label-width="120px">
        <el-input v-model="groupform.name" autocomplete="off" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="名称" label-width="120px">
        <el-input v-model="groupform.name" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="代号" label-width="120px">
        <el-input v-model="groupform.code" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="描述" label-width="120px">
        <el-input v-model="groupform.describe" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="innerVisible = false">取 消</el-button>
      <el-button type="primary" @click="comfirmEdit">确定</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
  import { Form } from 'element-ui'
  import { postGroup,emptyGroup} from '@/api/group'
  import { IGroup } from '@/api/types'
  @Component({
    name: 'GroupForm'
  })
  export default class extends Vue {
    @Prop({ default: null }) private targetGroup!: IGroup | null
    @Prop({ default: 0 }) private operator!: number //操作类型：0添加，1编辑，2删除
    @Prop({ default: false }) private dialogVisible!: boolean
    private groupform = Object.assign({}, emptyGroup)
    private d_title = ''
    private d_titles = ['添加', '编辑', '删除']

   

    private rules = {
      //oldPassword: [{ required: this.isCurrent, message: '请输入旧密码', trigger: 'blur' }],
      newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
      newPassword1: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }],
    }
    created() {

    }


    private async comfirmEdit() {
      (this.$refs.form as Form).validate(async valid => {
        if (!valid)
          return
        await postGroup(this.groupform)
        this.$message({
          message: 'save successfully!',
          type: 'success'
        })
        this.innerVisible = false
        this.$emit("submitFinished")

      })
    }

    get innerVisible() {
      return this.dialogVisible
    }
    set innerVisible(val) {
      this.$emit("update:dialogVisible", val);
      (this.$refs.form as Form).resetFields();
    }
    @Watch('operator')
    private onOperatorChange(value: any) {
      this.d_title = this.d_titles[value]
    }
    @Watch('targetGroup')
    private onTargetUserChange(value: any) {
      this.groupform = Object.assign({}, value)
    }
  }
</script>

<style scoped>
</style>
