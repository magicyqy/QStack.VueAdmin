import request from '@/utils/request'
import { IPluginInfo } from './types'
import qs from 'qs'

export const getPlugins = () =>
  request({
    url: '/pluginmanager/getPlugins',
    method: 'get'
  })

export const enablePlugin = (params:any) =>
  request({
    url: '/pluginmanager/enable/' + params,
    method: 'get'
  })
export const disablePlugin = (params: any) =>
  request({
    url: '/pluginmanager/disable/' + params,
    method: 'get'
  })
export const installPlugin = (data: any) =>
  request({
    url: '/pluginmanager/install',
    
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'post',
    data: qs.stringify(data)
  })
export const deletePlugin = (params: any) =>
  request({
    url: '/pluginmanager/delete/' + params,
    method: 'get'
  })

