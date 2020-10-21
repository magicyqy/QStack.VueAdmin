import request from '@/utils/request'
import Qs from 'qs'

const fileApi = {
    listFile: (params: any) => request({
        url: `system/file?${Qs.stringify(params)}`,
        method: 'get',
        data: {notLoading: true}
    }),
    createFolder: (data :any)=> request({
        url: `system/file/folder`,
        method: 'post',
        data
    }),
  deleteResource: (data: any) => request({
        url: `system/file`,
        method: 'delete',
        data
  }),
  getFileContent: (params: any) => request({
    url: `system/file/view?${Qs.stringify(params)}`,
    method: 'get'
  }),
  put: (data: any) => request({
    url: `system/file/put`,
    method: 'put',
    data
  })
}

export default fileApi
