import request from '@/utils/request'
import { IProduct, IProductCatagory, IProductImage,IProductDownload } from './types'

export const defaultProductData: IProduct = {
  id: 0,

  name: '',
  imageUrl: '',
  imageThumbUrl: '',
  productCategoryId: 0,
  price: 0,
  rebatePrice: 0,
  purchasePrice: 0,
  norm: '',
  productContent: '',
  seoTitle: '',
  seoKeyWord: '',
  seoDescription: '',
  state: 0,
  createDate: '',
  publishDate: '',
  productImages: [],
  productDownloads:[]
}

export const getProducts = (data: any) =>
  request({
    url: '/product/getProducts',
    method: 'post',
    data
  })
export const getProduct = (data: any) =>
  request({
    url: '/product/get/' + data,
    method: 'get'
  })

export const postProduct = (data: any) =>
  request({
    url: '/product/postProduct',
    method: 'post',
    data
  })

export const getCatagories = () =>
  request({
    url: '/product/getCatagories',
    method: 'get'

  })




export const updateProductState = (params: any) =>
  request({
    url: '/product/updateProductState',
    method: 'post',
    params
  })
export const postCatagory = (data: any) =>
  request({
    url: '/product/postCatagory',
    method: 'post',
    data
  })
export const deleteCatagory = (params: any) =>
  request({
    url: '/product/deleteCatagory/' + params,
    method: 'get',

  })

