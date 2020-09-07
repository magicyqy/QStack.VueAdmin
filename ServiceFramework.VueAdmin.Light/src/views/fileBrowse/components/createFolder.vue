<template>
    <div>
        <el-dialog
                class="simple-dialog"
                title="新建目录"
                :visible.sync="tempVisible"
                width="500px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                @close="close"
                append-to-body
        >
            <el-form :rules="rules" :model="tempData" ref="ruleForm" label-width="70px" class="demo-ruleForm">
                <el-form-item label="目录名" prop="folderName">
                    <el-input type="text" placeholder="请输入目录名" v-model="tempData.folderName"
                              maxlength="100" show-word-limit >
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="close">取 消</el-button>
              <el-button type="primary" @click="createFolder('ruleForm')">
            <span>立即创建</span>
      </el-button>
    </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import fileApi from '@/api/file'
import { Form } from 'element-ui'
  @Component({
    name: 'CreateFolder'
  })
  export default class extends Vue {
    @Prop({ default: false }) private dialogVisible!: boolean
    @Prop({ default: '/' }) private parentPath!: string
    private tempVisible= false
    private tempData= {
      folderName: ''
    }
    private rules= {
      folderName: [
        { required: true, message: '请输入文件夹名称', trigger: 'blur' },
        { min: 1, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
      ]
    }

    @Watch('dialogVisible')
    private onDialogVisibleChange(value:boolean) {
      this.tempVisible=value
    }
    private createFolder(formName:string) {
      (this.$refs[formName] as Form).validate((valid) => {
        if (valid) {
          fileApi.createFolder({
            dir:true,
            path: this.parentPath,
            name: this.tempData.folderName
          }).then(res => {
            this.$message.success('创建成功')
            this.close()
            this.$emit('created')
          })
        } else {
          return false
        }
      })
    }
    private close() {
      this.tempData.folderName = '';
      (this.$refs['ruleForm'] as Form).clearValidate()
      this.$emit('close')
    }

  }
  
</script>

<style scoped>

</style>
