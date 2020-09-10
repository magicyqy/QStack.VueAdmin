export interface IUser {
  id: number
  name: string
 
  code: string
  state:number
  mobile:string
  email:string
  groupId: number | null
  groupName:string
  describe:string
  sequence:number
  roles:IRole[]
}

export interface IGroup {
  id: number
  name: string
  code: string
  parentId: number | null
  parentName:string
  describe: string
 
  roles: IRole[]
  users:IUser[]
}


export interface IRole {
  id: number
  name: string
  code: string
  describe: string
  sequence: number

}
export interface IFunction {
  id: number
  name: string
  code: string
  parentId: number | null
  parentName: string|null
  iconUrl: string
  path:string
  describe: string
  sequence: number
  roles: IRole[]  
  IsLeaf: boolean,
  functionType: number
  hidden: boolean
  routeName:string
}

export interface IDataPrivilegeRule {
  key:number
  entityType: string
  propertyPath: string
  propertyNames:string[]
  fieldKind: number
  propertyType: string
  filterValue?: string
  operator?: number
  ruleGroup?:IRuleGroup
}

export interface IRuleGroup {
  id:number
  key:number
  title: string
  repository:string
  entityType: string
  conditionType: number
  rules?: IDataPrivilegeRule[]
  nestedRuleGroup?:IRuleGroup[]
}

export interface IEntity {
  name: string
  entityName:string
  entityType: string //fullname
  properties:IProperty[]
}
export interface IProperty {
  entityType: string
  propertyName:string
  name: string
  fieldKind: number
  propertyType: string
  genericType:string
  children?: IProperty[]
  leaf:boolean
}
export interface IDataAuthRule {
  id: number
  createDate: string
  repository: string
  entityType: string
  ruleGroup: string
  lambdaExpression:string
  ruleState:number
  title: string
}

export interface ITag {
  id: number
  name: string
}


export interface IArticleData {
  id: number
  state: number
  title: string
  summary: string
  articleContentHtml: string
  catagoryId:number|null
  catagoryName:string|null
  source: string
  sourceUrl: string
  coverUrl: string
  createDate: string | number
  publishTime: string | number|null
  lastModifyDate: string | number|null
  articleType: string | number
  disableComment: boolean
  hotTop: number
  author: string
  pageviews: number
  tags: ITag[]
}

export interface IProductCatagory {
  id: number
  name: string
  url: string
  parentId?: number
  seoTitle: string
  seoKeyWord: string
  seoDescription:string

  
}

export interface IProduct {
  id: number
  name: string
  imageUrl: string
  imageThumbUrl: string
  productCategoryId: number
  price: number
  rebatePrice: number
  purchasePrice: number
  norm:string
  productContent: string
  seoTitle: string
  seoKeyWord: string
  seoDescription: string
  state: number
  createDate: string | number|null
  publishDate: string | number|null
  productImages: IProductImage[]
  productDownloads:IProductDownload[]
}

export interface IProductImage {
  id: number
  productId: number
  imageUrl: string
  uploadFileId:number
  
}

export interface IProductDownload {
  id: number
  productId: number
  downloadUrl: string
  validCode: string,
  extDesc:string

}


export interface IPluginInfo {
  id: number
  createDate: string | number | null
  name: string
  displayName: string,
  version: string,
  isEnable: boolean,
  testUrl:string

}
export interface ITransactionData {
  orderId: string
  timestamp: string | number
  username: string
  price: number
  status: string
}


