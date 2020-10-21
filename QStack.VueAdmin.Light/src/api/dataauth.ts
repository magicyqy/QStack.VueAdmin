import request from '@/utils/request'
import { IDataPrivilegeRule, IRuleGroup, IDataAuthRule } from './types'
import qs from 'qs' 
export enum ConditionType
{
        OrElse = 1,
        AndAlso = 2
}
 export enum Operators
    {
        None = 0,
        Equal = 1,
        GreaterThan = 2,
        GreaterThanOrEqual = 3,
        LessThan = 4,
        LessThanOrEqual = 5,
        Contains = 6,
        StartWith = 7,
        EndWidth = 8,
        Range = 9,
        In=10
 }
export enum FieldType {
  Reference = 1, //实体导航属性是一对一
  ICollection = 2,//实体导航属性是一对多
  ValueType = 3, //非导航属性
  EnvType = 4  //上下文环境变量，如{LoginUserId}
}
var rulekey = 0
var rulegroupkey=0
export const emptyRule: IDataPrivilegeRule = {
  key:0,
  entityType: '',
  propertyPath: '',
  propertyNames:[],
  fieldKind: FieldType.ValueType,
  propertyType: '',
  filterValue:''
}


export const newRule = (entityType?: string): IDataPrivilegeRule => {
  let rule = JSON.parse(JSON.stringify(emptyRule))
  rule.key = rulekey++
  if (entityType)
    rule.entityType=entityType
  return rule
}

export const emptyRuleGroup: IRuleGroup = {
  id:0,
  key: 0,
  title:'',
  entityType: '',
  repository:'',
  conditionType: ConditionType.AndAlso,
  rules: []
}

export const emptyDataAuthRule:IDataAuthRule={
  id: 0,
  createDate: '',
  repository: '',
  entityType: '',
  ruleGroup: '',
  lambdaExpression: '',
  ruleState: 0,
  title: ''
}

export const newRuleGroup = (entityType?:string): IRuleGroup => {
  let rulegroup = JSON.parse(JSON.stringify(emptyRuleGroup))
  if (entityType)
    rulegroup.entityType = entityType
   rulegroup.key = rulegroupkey++
   let rule = newRule(entityType)
   rulegroup.rules.push(rule)

   return rulegroup
}

export const enviromentValues=[{
  name : "{当前登陆用户}",
  propertyPath: "{LoginUserId}",
}, {
  name : "{当前登陆角色}",
    propertyPath:  "{LoginRoles}"
  }, {
    name:  "{当前登陆用户所属部门}",
    propertyPath:  "{LoginGroupId}"
  }
]

export const getDaoRepositoies = (data: any) =>
  request({
    url: '/dataauth/GetDaoFactotyInfo',
    method: 'post',
    data
  })
export const getEntityPropertyList = (data: any) =>
  request({
    url: '/dataauth/getEnityPropertyList',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'post',
    data: qs.stringify(data)
  })

export const postRuleGroup = (data: any)=>
  request({
    url: '/dataauth/post',
    method: 'post',
    data
  })
export const generateExpresssion = (data: any) =>
  request({
    url: '/dataauth/generateExpresssion',
    method: 'post',
    data
  })
export const getDataAuthRule = (params: any) =>
  request({
    url: '/dataauth/get/' + params,
    method: 'get'
  })
export const getDataAuthList = (data: any) =>
  request({
    url: '/dataauth/getPages',
    method: 'post',
    data
  })
export const deleteDataAuthRule = (params: any) =>
  request({
    url: '/dataauth/delete/'+params,
    method: 'get'
    
  })

export const updateDataAuthRuleState = (params: any) =>
  request({
    url: '/dataauth/updateState',
    method: 'post',
    params
  })
