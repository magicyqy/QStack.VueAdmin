import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { login, logout, getUserInfo } from '@/api/users'
import { getToken, setToken, removeToken } from '@/utils/cookies'
import store from '@/store'
import { PermissionModule } from '@/store/modules/permission'
import { Form } from 'element-ui'
import { IFunction } from '../../api/types'

export interface IUserState {
  token: string
  name: string
  avatar: string
  introduction: string
  roles: string[]
  functionMenus: IFunction[]
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = ''
  public avatar = ''
  public introduction = ''
  public roles: string[] = []
  public functionMenus:IFunction[]=[]

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
  }

  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar
  }

  @Mutation
  private SET_INTRODUCTION(introduction: string) {
    this.introduction = introduction
  }

  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }
  @Mutation
  private SET_FUNCTIONMENUS(menus: IFunction[]) {
    this.functionMenus = menus
  }

  @Action
  public async Login(userInfo: { username: string, password: string }) {
   
    let { username, password } = userInfo
    username = username.trim()
   
      const { data } = await login({ username, password })
      setToken(data.token)
      this.SET_TOKEN(data.token)
   
   
   
  }

  @Action
  public ResetToken() {
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }

  @Action
  public async GetUserInfo() {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }
    const { data } = await getUserInfo({ /* Your params here */ })
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    const { roles, name, avatar, introduction, functions } = data
    
    // roles must be a non-empty array
    if (!roles || roles.length <= 0) {
      throw Error('GetUserInfo: roles must be a non-null array!')
    }
    this.SET_ROLES(roles.map((r:any)=>r.name))
    this.SET_NAME(name)
    this.SET_AVATAR(avatar)
    this.SET_INTRODUCTION(introduction)
    this.SET_FUNCTIONMENUS(functions)
  }

  @Action
  public async LogOut() {
    if (this.token === '') {
      throw Error('LogOut: token is undefined!')
    }
    await logout()
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
    this.SET_FUNCTIONMENUS([])
    PermissionModule.clear()
  }
}

export const UserModule = getModule(User)
