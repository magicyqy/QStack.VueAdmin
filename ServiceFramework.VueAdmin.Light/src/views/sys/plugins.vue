<template>
  <div style="padding:20px;">

    <el-tabs type="border-card" @tab-click="tabclick">

      <el-tab-pane label="插件管理" >

        <div style="overflow:auto;" v-for="(plugin,index) in pluginList" :key="index">
          <table style="min-width:600px;" class="el-table el-table--fit el-table--border el-table--enable-row-hover el-table--scrollable-x el-table--medium">
            <tr class="el-table-row">
              <td class="p-title">名称</td>
              <td class="p-value">{{plugin.name}}</td>
              <td class="p-title">Version</td>
              <td class="p-value">{{plugin.version}}</td>
              <td rowspan="3" style="width:180px;">
                <el-button v-if="plugin.isEnable"  :loading="isStopping" type="text" size="small" @click="disablePlugin(plugin.id)">停用</el-button>
                <el-button v-else type="text"  :loading="isStarting" size="small" @click="enablePlugin(plugin.id)">启用</el-button>
                <el-button type="text" size="small" @click="changePlugin(plugin.id)">升级</el-button>
                <el-button type="text" size="small" @click="changePlugin(plugin.id)">降级</el-button>
                <el-button type="text" size="small" :loading="isInstalling" @click="deletePlugin(plugin.id)">卸载</el-button>
              </td>
            </tr>
            <tr>
              <td class="p-title">创建时间</td>
              <td class="p-value">{{plugin.createDate}}</td>
              <td class="p-title">状态</td>
              <td class="p-value" :class="plugin.isEnable |colorFilter">{{plugin.isEnable |statusFilter }}</td>

            </tr>
            <tr>
              <td colspan="4" style="padding:10px;">
                <p>测试地址： <el-link target="_blank" type="primary" :href="plugin.testUrl | urlFilter">{{plugin.testUrl | urlFilter}}</el-link></p>
                {{plugin.displayName}}
              </td>
            </tr>
          </table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="插件安装">
        <p>
          <h5>notice:</h5> 1.插件包名称必须与入口程序集名称一致<br/>
                           2.存放目录结构建议：插件名文件夹=>版本名文件夹=>插件压缩包 
        </p>
        <el-form ref="postForm"
                 :model="postForm"
                 label-width="120px">
          <el-form-item label="安装包">
            <el-col :span="12">
              <el-input v-model="postForm.package" />
            </el-col>
            <el-col :span="12">
              <el-button type="primary" @click="uploadPlugin">选择<i class="el-icon-upload el-icon--right"></i></el-button>
            </el-col>
          </el-form-item>
          <el-form-item label="IsMigration">
            <el-switch v-model="postForm.isMigration"
                       active-color="#13ce66"
                       inactive-color="#bbbbbb">
            </el-switch>
          </el-form-item>
          <el-form-item label="">
           
            <el-button type="primary" :loading="isInstalling" @click="installPlugin">安装<i class="el-icon-orange el-icon--right"></i></el-button>
          </el-form-item>
        </el-form>
        <el-form ref="logForm"   label-width="120px">
        <el-form-item label="">
          <el-input :rows="10" type="textarea" :value="logForm.log"  placeholder="this is for the log of intall,consider of using sinalR.Todo.........."></el-input>
        </el-form-item>
        </el-form>
      </el-tab-pane>

    </el-tabs>
    <el-dialog class="text-file-browser"
               title="文件浏览器"
               :visible.sync="fileBrowserVisible"
               width="820px">
      <file-list :height="450" :callback="true" @callback="fileSelected" :base-path="'/app_data/pluginpackages'" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import FileList from "@/views/filebrowse/components/fileList.vue"
  import { IPluginInfo } from "@/api/types"
  import { getPlugins, installPlugin, disablePlugin, enablePlugin, deletePlugin } from "@/api/plugins"
import { TabPane } from 'element-ui'
  @Component({
    name: 'Plugins',
    filters: {
      statusFilter: (status: boolean) => {
        
        return status?"已启用":"已停用"
      },
      colorFilter: (status: boolean) => {
        return status ? "p-value-green" : "p-value-red"
      },
      urlFilter: (url: string) => {
        return new URL(process.env.VUE_APP_BASE_API as string).origin + url
      }

    },
    components: {
      FileList

    }
  })
  export default class extends Vue {
    private isInstalling = false
    private isStarting = false
    private isStopping=false
    private postForm = {
      package: '',
      isMigration: true
    
    }
    private logForm = {
      log:''
    }
    private pluginList: IPluginInfo[] = [];
    private fileBrowserVisible = false
    async created() {
      await this.init()
    
    }

    async init() {
      const { data } = await getPlugins();
      this.pluginList = data;
 
    }

    private fileSelected(data: any) {
      let file = data || []   
      this.$set(this.postForm, 'package', new URL(file[0].url).pathname)
      this.fileBrowserVisible = false
     
    }
    private uploadPlugin() {
      this.fileBrowserVisible = true
    }

    private async installPlugin() {
      this.isInstalling = true
      await installPlugin(this.postForm)
        .then(res  => {
          //console.log(res)
          this.logForm.log =  (res as any).message
        })
        .catch((error) => this.logForm.log=error.response.data)
        .finally(() => this.isInstalling = false)
     
    }

    private async enablePlugin(id:number) {
      this.isStarting = true
      await enablePlugin(id).finally(() => this.isStarting = false)
      this.pluginList.filter(p => p.id === id)[0].isEnable = true;
    }
    private async disablePlugin(id: number) {
      this.isStopping = true
      await disablePlugin(id).finally(() => this.isStopping = false)
      this.pluginList.filter(p => p.id === id)[0].isEnable = false;
    }
    private async changePlugin(id: number) {
      this.$alert("直接重新安装插件的指定版本即可。注意：升级降级可能会删除部分数据库内容。请谨慎操作！！！！！")
    }
    private async deletePlugin(id: number) {

      this.$confirm(`确认卸载插件：${this.pluginList.filter(p => p.id === id)[0].name}？`)
        .then(async (value) => {
          if (value === "confirm") {
            this.isInstalling=true
            await deletePlugin(id).finally(() => this.isInstalling = false)
            await this.init()
          }

        }).catch(() => { })
   
    }

    private async tabclick(tab: TabPane) {
      //console.log(tab)
      if (tab.label === '插件管理')
        await this.init()
    }
  }
</script>

<style scoped>
  .p-title{
    text-align:center;
    font-size:14px;
    font-weight:550;
    font-stretch:wider;
  }
  .p-value{
    text-align:center;
    font-size:14px;
  }
  .p-value-green {
    color: #67C23A;
  }
  .p-value-red {
    color: #F56C6C;
  }
</style>
