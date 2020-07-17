import request from '@/utils/request'
import { IFunction } from './types'

export enum FunctionType {
  Menu,
  Action
}
export const emptyFunction: IFunction = {
  id: 0,
  name: '',
  code: '',
  describe: '',
  sequence:0,
  parentId: null,
  parentName:null,
  roles: [],
  iconUrl: '',
  path: '',
  IsLeaf: false,
  functionType: FunctionType.Menu,
  hidden: false,
  routeName:''
}
export const getFunctionPage = (data: any) =>
  request({
    url: '/function/getpages',
    method: 'post',
    data
  })
export const getFunctions = (data: any) =>
  request({
    url: '/function/getAll',
    method: 'post',
    data
  })
export const getFunction = (data: any) =>
  request({
    url: '/function/get/' + data,
    method: 'get'
  })
export const postFunction = (data: any) =>
  request({
    url: '/function/post/',
    method: 'post',
    data
  })
export const deleteFunction = (params: any) =>
  request({
    url: '/function/delete/' + params,
    method: 'get',

  })

