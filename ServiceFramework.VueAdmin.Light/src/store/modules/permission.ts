import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import { asyncRoutes, constantRoutes,constant404Routes } from '@/router'
import store from '@/store'
import { IFunction } from '../../api/types'

const hasPermission = (roles: string[], route: RouteConfig) => {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

export const filterAsyncRoutes = (routes: RouteConfig[], functionMenus: IFunction[]) => {
  const res: RouteConfig[] = []

  routes.forEach(route => {
    const r = { ...route }
    let name = r.name!.toLowerCase();
 
    let menu = functionMenus.filter(m => m.path.toLowerCase() == r.path.toLowerCase() || (m.routeName && m.routeName.toLowerCase()== name))
    //console.log(name)
    if (menu.length > 0) {
      if (r.children) {
        r.children = filterAsyncRoutes(r.children, functionMenus)
      }
      res.push(r)
    }
  })
  return res
}

export interface IPermissionState {
  routes: RouteConfig[]
  dynamicRoutes: RouteConfig[]
}

@Module({ dynamic: true, store, name: 'permission' })
class Permission extends VuexModule implements IPermissionState {
 
  public routes: RouteConfig[] = []
  public dynamicRoutes: RouteConfig[] = []

  @Mutation
  private SET_ROUTES(routes: RouteConfig[]) {
    routes=routes.concat(constant404Routes)
    this.routes = constantRoutes.concat(routes)
    this.dynamicRoutes = routes
    
  }

  @Action
  public GenerateRoutes(rolefunction:{ roles: string[], functionMenus: IFunction[]}) {
    let accessedRoutes
    if (rolefunction.roles.includes('admin')) {
      
      accessedRoutes = asyncRoutes
    } else {
      accessedRoutes = filterAsyncRoutes(asyncRoutes, rolefunction.functionMenus)
    }
    this.SET_ROUTES(accessedRoutes)
  }

  @Action
  public clear() {
    this.SET_ROUTES([]);
  }
}

export const PermissionModule = getModule(Permission)
