import request from '@/utils/request'
import { IGroup } from './types'
export const emptyGroup: IGroup = {
  id: 0,
  name: '',
  code: '',
  describe: '',
  parentId: null,
  parentName:'',
  roles: [],
  users:[]
}
export const getGroups = (data: any) =>
  request({
    url: '/group/getAll',
    method: 'post',
    data
  })
export const getGroup = (data: any) =>
  request({
    url: '/group/get/' + data,
    method: 'get'
  })
export const postGroup = (data: any) =>
  request({
    url: '/group/post/',
    method: 'post',
    data
  })
export const deleteGroup = (params: any) =>
  request({
    url: '/group/delete/' + params,
    method: 'get',

  })
