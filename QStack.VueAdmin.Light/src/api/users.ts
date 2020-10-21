import request from '@/utils/request'
import qs from 'qs'
import { IUser } from './types'

export enum UserState{
  
        Freezed = -1,
  
        UnActive = 0,
  
        Active = 1
}
export const emptyUser: IUser = {
  id: 0,
  name: '',
  code: '',
  describe: '',
  sequence: 0,
  state: UserState.Active,
  mobile: '',
  email: '',
  groupId: null,
  groupName:'',
  roles: []

}
export const getUserInfo = (data: any) =>
  request({
    url: '/account/userInfo',
    method: 'post',
    data
  })

export const login = (data: any) =>
  request({
    url: '/account/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'post',
    data: qs.stringify(data)
  })

export const logout = () =>
  request({
    url: '/account/logout',
    method: 'post'
  })

export const getUsers = (data: any) =>
  request({
    url: '/account/getusers',
    method: 'post',
    data
  })



export const postUser = (data: any) =>
  request({
    url: '/account/post/',
    method: 'post',
    data
  })
export const deleteUser = (params: any) =>
  request({
    url: '/account/delete/' + params,
    method: 'get'

  })
export const postUserRoles = (data: any) =>
  request({
    url: '/account/postUserRoles',
    method: 'post',
    data
  })

export const changePassword = (data: any) =>
  request({
    url: '/account/changePassword',
    method: 'post',
    data
  })
export const reSetPassword = (data: any) =>
  request({
    url: '/account/reSetPassword',
    method: 'post',
    data
  })

