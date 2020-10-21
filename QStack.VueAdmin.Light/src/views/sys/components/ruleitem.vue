<template>
  <div class="rule-group-box flex-row">
    <div class="rule-groups flex-item flex-column">
      <div class="rule-head flex-row">
        <div class="flex-item">
          <el-select class="sellect-operation" size="mini" v-model="ruleForm.conditionType">
            <el-option v-for="item in conditions" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </div>
        <el-button size="mini" class="VM" type="danger" icon="el-icon-delete" v-if="isDelete" @click="deleteGroupRule(parentForm,ruleForm)">删除分组</el-button>
        <el-button size="mini" class="VM" type="primary" icon="el-icon-plus" @click="addGroupRule(ruleForm)">添加分组</el-button>
      </div>
      <div class="rule-form flex-item">
        <template v-if="ruleForm.rules && ruleForm.rules.length > 0" v-for="(rule,ruleIndex) in ruleForm.rules">
          <el-form :key="createKey(rule,ruleIndex,'form')">
            <el-form-item style="display: inline-block;margin-bottom: 0;margin-right: 5px;">
              <el-cascader size="mini" :ref="createKey(rule,ruleIndex,'cas')" v-model="rule.propertyNames" :props="casProps" separator="." clearable @change="casChange(rule,createKey(rule,ruleIndex,'cas'))"></el-cascader>

            </el-form-item>
            <template v-if="rule.ruleGroup">
              <el-form-item style="display: inline-block;margin: 5px;">
                <rule-item :key="createKey(rule.ruleGroup,ruleIndex,'rrg')" :isDelete="false" :rulelevel="rulelevel+1" :rule-form="rule.ruleGroup" :parent-form="ruleForm"></rule-item>
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item style="display: inline-block;width:150px;margin-bottom: 0;margin-right: 5px;">
                <el-select size="mini" v-model="rule.operator">
                  <el-option v-for="op in contrasts" :key="op.value" :label="op.name" :value="op.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="handleShowMore(rule.propertyNames)" style="display: inline-block;margin-bottom: 0;width:260px;margin-right: 5px;">
                <el-input :readonly="['CreateUserId', 'CreateUserName'].indexOf(rule.propertyPath) >= 0 ? false : true" size="mini" style="text-overflow: ellipsis;padding-right: 30px;" v-model="rule.filterValue"></el-input>
                <span style="position: absolute;right: -5px;top:5px;bottom:5px;line-height: 28px;display:inline-block;background: #fff;border: 1px solid #DCDFE6;padding: 0 10px;border-radius: 0 4px 4px 0;cursor:pointer;" @click="handleSelectUser(ruleForm, ruleIndex)"><i class="el-icon-more"></i></span>
              </el-form-item>
              <el-form-item v-else style="display: inline-block;margin-bottom: 0;width:260px;margin-right: 5px;">
                <el-popover ref="popover4"
                            placement="bottom"
                            width="250"
                            trigger="focus">
                  <el-input slot="reference" size="mini" v-model="rule.filterValue"></el-input>
                  <div>
                    <el-tag size="mini" style="margin: 0 10px 10px 0;cursor: pointer;" @click="handleSelectEnviroment(item.propertyPath, rule, ruleIndex)" v-for="(item, index) in envValues" :key="index">{{item.propertyPath}}</el-tag>
                  </div>
                </el-popover>
              </el-form-item>
            </template>

            <el-button type="danger" size="mini" icon="el-icon-delete" v-if="ruleForm.rules.length > 1" @click="deleteRule(ruleForm, ruleIndex)"></el-button>
            <el-button type="primary" size="mini" icon="el-icon-plus" v-if="ruleIndex === ruleForm.rules.length - 1" @click="addRule(ruleForm)"></el-button>
          </el-form>
        </template>
        <template v-if="ruleForm.nestedRuleGroup && ruleForm.nestedRuleGroup.length > 0">
          <rule-item :rulelevel="rulelevel+1" v-for="(child, index) in ruleForm.nestedRuleGroup" :key="createKey(child,index,'rg')" :rule-form="child" :parent-form="ruleForm"></rule-item>
        </template>
      </div>
    </div>
    <!-- 选择角色/用户 -->
  
    <el-dialog :visible="roleCompVisible" width="65%">
      <RoleComponent :componentVisible.sync="roleCompVisible" :selectedItems.sync="selectedRoles" :component-mode="true" />
    </el-dialog>
    <el-dialog :visible="userCompVisible" width="65%">
      <UserComponent :componentVisible.sync="userCompVisible" :selectedItems.sync="selectedUsers" :component-mode="true" />
    </el-dialog>


  </div>
</template>
<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
  import { IRuleGroup, IDataPrivilegeRule, IProperty, IGroup, IUser, IRole } from '@/api/types'
  import { ConditionType, Operators, enviromentValues, getEntityPropertyList, newRule, newRuleGroup, emptyRule, FieldType } from '@/api/dataauth'
  import { Tree, Table, Cascader } from 'element-ui'
  import { default as RoleComponent } from '@/views/sys/role.vue'
  import { default as UserComponent } from '@/views/sys/user.vue'
  @Component({
    name: 'ruleItem',
    components: {
      RoleComponent, UserComponent
    },
    filters: {
      userStatusFilter:(status:any)=> {
        var res = 'color-success'
        switch (status) {
          case 1:
            res = 'color-danger'
            break
          default:
            break
        }
        return res
      }
    }
  })
  export default class extends Vue { 
    
    @Prop({ default: null }) private ruleForm!: IRuleGroup
    @Prop({ default: 0 }) private rulelevel!: number
    @Prop({ default: null }) private parentForm!: IRuleGroup
    @Prop({ default: true }) private isDelete!: boolean
    @Prop({ default: null }) private propertyList!: IProperty[]
    private roleCompVisible = false
    private userCompVisible = false
    private selectedUsers: IUser[] = []
    private selectedRoles:IRole[]=[]
    private envValues = Object.assign({},enviromentValues)
 
    //配置级联实体属性异步加载
    private casProps = {}
    created() {
      this.casProps = {
        lazy: true,
        lazyLoad: async (node: any, resolve: Function) => {
         
          const { level } = node;
          if (level === 0) {          
            let data = await getEntityPropertyList({ entityType: this.ruleForm.entityType, isFirstLevel: true });
            resolve(data.data)
            return
          }
          let referenceProperty = node.data as IProperty
          const { data } = await getEntityPropertyList({ entityType: referenceProperty.propertyType });

          resolve(data);

        },
        value: 'propertyName',
        label: 'name',
        emitPath: true
      }
    }
   
    private casChange(rule: IDataPrivilegeRule, key: string) {
      let nodes = (this.$refs[key] as any)[0].getCheckedNodes()
      if (!nodes||nodes.length==0)
        return
      let selectNode = nodes[0].data as IProperty
      rule.propertyType = selectNode.propertyType
      rule.fieldKind = selectNode.fieldKind
      if (selectNode.fieldKind == FieldType.ICollection) {
        this.$set(rule, 'ruleGroup', newRuleGroup(selectNode.genericType))
       
      }
      else {
        if (rule.ruleGroup)
          delete rule['ruleGroup']
        
      }
    }

    private createKey(item: IDataPrivilegeRule|IRuleGroup,index:number,symbol:string) {
      let newKey = `${this.rulelevel}_${symbol}_${index}_${item.key}`
        //console.log(newKey)
        return newKey
     }
    private handleShowMore(names: string[]) {
        var key=names[names.length-1]
        // const keys = ['{loginUser}', '{loginRole}', 'CreateUserId', 'CreateUserName']
      const keys = ['{LoginUserId}', '{LoginUserName}', '{LoginRoleIds}', '{LoginRoles}', 'CreateUserId']
        if (keys.indexOf(key) > -1) {
          return true
        }
        return false
    }
    private handleSelectEnviroment(envParam: string, rule: IDataPrivilegeRule, index: number) {
       rule.filterValue=envParam

    }
    private addGroupRule(item: IRuleGroup) {
      !item.nestedRuleGroup && this.$set(item, 'nestedRuleGroup', [])
      let ruleGroup = newRuleGroup(this.ruleForm.entityType)
     
      item.nestedRuleGroup && item.nestedRuleGroup.push(ruleGroup)
    }
    private deleteGroupRule(parent: IRuleGroup,child:IRuleGroup) {
      let index = parent.nestedRuleGroup!.findIndex(rg => rg.key === child.key)    
      if(index>=0)
        parent.nestedRuleGroup!.splice(index, 1)
      parent.nestedRuleGroup!.length <= 0 && delete parent['nestedRuleGroup']
    }
    
    private addRule(item: IRuleGroup) {
      item.rules!.push(newRule(item.entityType))
    }
    private deleteRule(item: IRuleGroup, index:number) {
        item.rules!.splice(index, 1)
    } 
  
      // 弹出选择用户对话框
    private currentRule:IDataPrivilegeRule|null=null
    private handleSelectUser(item: IRuleGroup, index: number) {
      this.currentRule = item.rules![index]
      if (this.currentRule.propertyNames.some(i => ['{LoginRoleIds}', '{LoginRoles}'].indexOf(i) > -1))
        this.roleCompVisible = true;
      else
        this.userCompVisible = true
      
    }
    @Watch('selectedUsers')
    private onSelectedUsersChange(val: IUser[]) {
      console.log(this.currentRule)
      if (this.currentRule) {
        if (this.currentRule.propertyType.indexOf('System.Int32')>-1)
          this.currentRule.filterValue = val.map(v => v.id).join(",")
        if (this.currentRule.propertyType.indexOf('System.String')>-1)
          this.currentRule.filterValue = val.map(v => v.name).join(",")
      }
       
    }
    @Watch('selectedRoles')
    private onSelectedRolesChange(val: IRole[]) {
      //console.log(this.currentRule)
      if (this.currentRule) {
        if (this.currentRule.propertyType.indexOf('System.Int32')>-1)
          this.currentRule.filterValue = val[0].id.toString()
        if (this.currentRule.propertyType.indexOf('System.String')>-1)
          this.currentRule.filterValue = val[0].name
      }
        
    }
   
    get conditions() {
      let map = Object.entries(ConditionType).filter(e => !isNaN(e[0] as any)).map(e => ({ name: e[1], value: Number(e[0]) }));
      return map;
    }
    get contrasts() {
      let map = Object.entries(Operators).filter(e => !isNaN(e[0] as any)).map(e => ({ name: e[1], value: Number(e[0]) }));
      return map;
    }
  }
</script>
<style>
</style>
