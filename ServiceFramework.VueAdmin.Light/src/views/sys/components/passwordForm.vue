<template>
  <el-dialog :title="title+'-用户：'+(targetUser?targetUser.name:'')" :visible.sync="innerVisible" width="50%">
    <el-form :label-position="labelPosition" label-width="100px"
          ref="form"   :model="form" :rules="rules"
             >
    
      <el-form-item label="旧密码" v-if="isCurrent" prop="oldPassword">
        <el-input v-model="form.oldPassword" placeholder="输入旧密码" show-password></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" placeholder="输入新密码" show-password></el-input>
      </el-form-item>
      <el-form-item label="" prop="newPassword1">
        <el-input v-model="form.newPassword1" placeholder="再次输入新密码" show-password></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="innerVisible = false">取 消</el-button>
      <el-button type="primary" @click="comfirmPwd">确定</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
  import { Form} from 'element-ui'
  import {  changePassword,reSetPassword} from '@/api/users'
  import { IUser} from '@/api/types'
  @Component({
    name: 'PasswordForm'
  })
  export default class extends Vue {
    @Prop({ default: null }) private targetUser!: IUser | null
    @Prop({ default: false }) private isCurrent!: boolean
    @Prop({ default: false }) private dialogVisible!: boolean

    private title = '重置密码'
    //private dialogVisible = false
    private labelPosition = 'top'

    private form = {
      userId: 0,
      oldPassword: '',
      newPassword: '',
      newPassword1: ''
    }

    private rules = {
      oldPassword: [{ required: this.isCurrent, message: '请输入旧密码', trigger: 'blur' }],
      newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
      newPassword1: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }],
    }
    created() {

    }


    private async comfirmPwd() {
      (this.$refs.form as Form).validate(async valid => {
          if (!valid)
            return
          if (this.isCurrent)
            await changePassword(this.form)
          else
            await reSetPassword(this.form)
          this.$message({
            message: 'change password successfully!',
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
    @Watch('targetUser')
    private onTargetUserChange(value: any) {
      //console.log(value)
      this.form.userId=value?value.id:0
    }
  }
</script>

<style scoped>
</style>
