import request from '@/utils/request'
import {  IRole } from './types'

export const getRoles = (data: any) =>
  request({
    url: '/role/getPages',
    method: 'post',
    data
  })
export const getRole = (data: any) =>
  request({
    url: '/role/get/' + data,
    method: 'get'
  })
export const postRole = (data: any) =>
  request({
    url: '/role/post/',
    method: 'post',
    data
  })
export const deleteRole = (params: any) =>
  request({
    url: '/role/delete/' + params,
    method: 'get',

  })

export const postPermission = (data: any) =>
  request({
    url: '/role/postPermission',
    method: 'post',
    data
  })

export const getPermissions = (params: any) =>
  request({
    url: '/role/getPermissions/' + params,
    method: 'get'
  })
