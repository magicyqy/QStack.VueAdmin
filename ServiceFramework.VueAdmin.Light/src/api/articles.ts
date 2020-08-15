import request from '@/utils/request'
import { IArticleData, ITag } from './types'

export enum ArticleStateEnum {
  草稿 = 0,
  发布
}

export const defaultArticleData: IArticleData = {
  id: 0,
  state: 0,
  title: '',
  articleContentHtml: '',
  catagoryId:null,
  catagoryName:null,
  summary: '',
  source: '',
  sourceUrl: '',
  coverUrl: '',
  createDate: '',
  publishTime: null,
  lastModifyDate:null,
  articleType: 0,
  disableComment: false,
  hotTop: 0,
  author: '',
  pageviews: 0,
  tags: []
}
export const getArticles = (data: any) =>
  request({
    url: '/article/getarticles',
    method: 'post',
    data
  })
export const getArticle = (data: any) =>
  request({
    url: '/article/get/' + data,
    method: 'get'
  })

export const saveAriticle = (data: any) =>
  request({
    url: '/article/post',
    method: 'post',
    data
  })

export const getCatagories = () =>
  request({
    url: '/article/getCatagories',
    method: 'get'
   
  })

export const getTags = () =>
  request({
    url: '/article/getTags',
    method: 'get'

  })

export const postHotTop = (params:any) =>
  request({
    url: '/article/postHotTop',
    method: 'post',
    params
  })
export const postArticleState = (params: any) =>
  request({
    url: '/article/postState',
    method: 'post',
    params
  })
export const postCatagory = (data: any) =>
  request({
    url: '/article/postCatagory',
    method: 'post',
    data
  })
export const deleteCatagory = (params: any) =>
  request({
    url: '/article/deleteCatagory/'+params,
    method: 'get',
    
  })



