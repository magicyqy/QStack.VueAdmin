import request from '@/utils/request'


export const getMenus = () =>
  request({
    url: '/navigation/getMenus',
    method: 'get'

  })
export const postMenu = (data: any) =>
  request({
    url: '/navigation/postMenu',
    method: 'post',
    data
  })
export const deleteMenu = (params: any) =>
  request({
    url: '/navigation/deleteMenu/' + params,
    method: 'get',

  })
