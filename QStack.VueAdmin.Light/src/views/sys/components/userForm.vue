<template>
  <el-dialog  ref="userDialog"
             :visible.sync="innerVisible"
             width="60%">
    <el-form :model="userform"  ref="form">
      <el-input :value="userform.groupId||''" autocomplete="off" type="hidden"></el-input>
      <el-form-item label="所属用户组" label-width="120px">
        <el-input :value="userform.groupName||''" autocomplete="off" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="名称" label-width="120px">
        <el-input v-model="userform.name" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="代号" label-width="120px">
        <el-input v-model="userform.code" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="手机" label-width="120px">
        <el-input v-model="userform.mobile" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="Email" label-width="120px">
        <el-input v-model="userform.email" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="状态" label-width="120px">
        <el-select v-model="userform.state" placeholder="请选择">
          <el-option v-for="item in enumToMap"
                     :key="item.value"
                     :label="item.name"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述" label-width="120px">
        <el-input v-model="userform.describe" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="序号" label-width="120px">
        <el-input v-model.number="userform.sequence" autocomplete="off"></el-input>
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
  import {  postUser, emptyUser, UserState } from '@/api/users'
  import { IUser } from '@/api/types'
  @Component({
    name: 'UserForm'
  })
  export default class extends Vue {
    @Prop({ default: null }) private targetUser!: IUser | null
    @Prop({ default: 0 }) private operator!: number //操作类型：0添加，1编辑，2删除
    @Prop({ default: false }) private dialogVisible!: boolean
    private d_title = ''
    private d_titles = ['添加', '编辑', '删除']
 
    //private dialogVisible = false
    private labelPosition = 'top'

    private userform = Object.assign({}, emptyUser)

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
        await postUser(this.userform)
        this.$message({
          message: 'save successfully!',
          type: 'success'
        })
        
        this.$emit("submitFinished")
        this.innerVisible=false
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
    @Watch('targetUser')
    private onTargetUserChange(value: any) {
      this.userform = Object.assign({},value)
    }
    get enumToMap() {
      let map = Object.entries(UserState).filter(e => !isNaN(e[0] as any)).map(e => ({ name: e[1], value: Number(e[0]) }));
      return map;
    }
  }
</script>

<style scoped>
</style>
