<template>
  <el-card class="box-card" style="width:95%;margin:5px auto;">
    <el-form :model="userform" ref="form">
      <el-input :value="userform.groupId||''" autocomplete="off" type="hidden"></el-input>
      <el-form-item label="所属用户组:" label-width="120px">
        <div>{{userform.groupName||''}}</div>

      </el-form-item>
      <el-form-item label="名称:" label-width="120px">
        <el-input v-model="userform.name" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="代号:" label-width="120px">
        <div>{{userform.code}}</div>
        <!--<el-input v-model="userform.code" autocomplete="off" ></el-input>-->
      </el-form-item>
      <el-form-item label="手机:" label-width="120px">
        <el-input v-model="userform.mobile" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="Email:" label-width="120px">
        <el-input v-model="userform.email" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="状态:" label-width="120px">
        <div>{{userState}}</div>

      </el-form-item>
      <el-form-item label="描述:" label-width="120px">
        <el-input v-model="userform.describe" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div class="dialog-footer" style="text-align:center;">
      <el-button type="primary" @click="comfirmEdit">update</el-button>
      <el-button type="primary" @click="pwdDialogVisible=!pwdDialogVisible">修改密码</el-button>
    </div>
    <PasswordForm :dialog-visible.sync="pwdDialogVisible" :targetUser="userform" :is-current="true"  />
  </el-card>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
  import { Form } from 'element-ui'
  import { postUser, emptyUser, UserState, getUserInfo } from '@/api/users'
  import { UserModule } from '@/store/modules/user'
  import { PasswordForm } from './components'

  @Component({
    name: 'UserDetail',
    components: { PasswordForm}

  })
  export default class extends Vue {
    private userform = Object.assign({}, emptyUser)
    private pwdDialogVisible=false
   
    async created() {
       await this.getUser()
    }
    private async getUser() {
      const { data } = await getUserInfo({})
      this.userform = Object.assign({},data)
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
      })
    }

   
    get enumToMap() {
      let map = Object.entries(UserState).filter(e => !isNaN(e[0] as any)).map(e => ({ name: e[1], value: Number(e[0]) }));
      return map;
    }

    get userCode() {
      return this.userform.code
    }
    get userState() {
      return UserState[this.userform.state]
    }
  }
</script>

<style scoped>
</style>
