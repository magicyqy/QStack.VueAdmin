import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import { asyncRoutes, constantRoutes,constant404Routes } from '@/router'
import store from '@/store'
import { IFunction } from '@/api/types'
import Layout from '@/layout/index.vue'
import { getIFramePath, getIFrameUrl } from '@/utils/iframe'
import { getTreeData } from '../../utils/validate'
const hasPermission = (roles: string[], route: RouteConfig) => {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
* 添加动态(菜单)路由
* @param {*} menuList 菜单列表
* @param {*} routes 递归创建的动态(菜单)路由
*/
const addDynamicRoutes = (menuList: IFunction[] = [], routes: RouteConfig[] = []) => {
  let temp: IFunction[] = []
  for (let i = 0; i < menuList.length; i++) {
    if (menuList[i].functionType == 1)
      continue;
    // 创建路由配置
    let route: RouteConfig = {
      path: menuList[i].path,
      component: undefined,
      name: menuList[i].name,
      meta: {
        icon: menuList[i].iconUrl,
        index: menuList[i].id,
        title: menuList[i].routeName,
        hidden:menuList[i].hidden
      }
    }
    let path = getIFramePath(menuList[i].path)
    if (path) {
      route.meta.title = null
    }
    if (menuList[i].parentId == null)
      route.component = Layout
    else {

    
    
      if (path) {
        // 如果是嵌套页面, 通过iframe展示
   
        route.path = path
        route.component = resolve => require([`@/views/iframe/iframe.vue`], resolve)
        // 存储嵌套页面路由路径和访问URL
        let url = getIFrameUrl(menuList[i].path)
        let iFrameUrl = { 'path': path, 'url': url }

      } else {
        try {
          // 根据菜单URL动态加载vue组件，这里要求vue组件须按照url路径存储
          // 如url="sys/user"，则组件路径应是"@/views/sys/user.vue",否则组件加载不到
          let url = menuList[i].path
          if (url.indexOf(':') > -1) {
            url = url.substring(0,url.indexOf(':')-1)
          }
         
          route.component = resolve => require([`@/views${url}.vue`], resolve)
        } catch (e) {
          console.log(e)
        }
      }
    }
   
    if (menuList[i].children && menuList[i].children.length >= 1) {
     
      route.children = addDynamicRoutes(menuList[i].children)
    }
  
    routes.push(route)
  }

    //  if (menuList[i].children && menuList[i].children.length >= 1) {
    //    temp = temp.concat(menuList[i].children)
    //  } else if (menuList[i].path && /\S/.test(menuList[i].path)) {
    //    menuList[i].path = menuList[i].path.replace(/^\//, '')
    //    // 创建路由配置
    //    var route: RouteConfig = {
    //      path: menuList[i].path,
    //      component: Layout,
    //      name: menuList[i].routeName,
    //      meta: {
    //        icon: menuList[i].iconUrl,
    //        index: menuList[i].id,
    //        title: menuList[i].routeName
    //      }
    //    }
    //    let path = getIFramePath(menuList[i].path)
    //    if (path) {
    //      // 如果是嵌套页面, 通过iframe展示
    //      route['path'] = path
    //      route['component'] = resolve => require([`@/views/iframe/iframe.vue`], resolve)
    //      // 存储嵌套页面路由路径和访问URL
    //      let url = getIFrameUrl(menuList[i].path)
    //      let iFrameUrl = { 'path': path, 'url': url }
    //      store.commit('addIFrameUrl', iFrameUrl)
    //    } else {
    //      try {
    //        // 根据菜单URL动态加载vue组件，这里要求vue组件须按照url路径存储
    //        // 如url="sys/user"，则组件路径应是"@/views/sys/user.vue",否则组件加载不到
    //        let array = menuList[i].path.split('/')
    //        let url = ''
    //        for (let i = 0; i < array.length; i++) {
    //          url += array[i].substring(0, 1).toUpperCase() + array[i].substring(1) + '/'
    //        }
    //        url = url.substring(0, url.length - 1)
    //        route['component'] = resolve => require([`@/views/${url}.vue`], resolve)
    //      } catch (e) {
    //        console.log(e)
    //      }
    //    }
    //    routes.push(route)
    //  }
    //}
    //if (temp.length >= 1) {
    //  addDynamicRoutes(temp, routes)
    //} else {
    //  console.log('动态路由加载...')
    //  console.log(routes)
    //  console.log('动态路由加载完成.')
    //}
    //console.log(routes)
    return routes
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
  public GenerateRoutes(rolefunction: { roles: string[], functionMenus: IFunction[] }) {
    console.log(rolefunction.functionMenus.filter(f => f.parentId==null))
    let accessedRoutes = addDynamicRoutes(rolefunction.functionMenus.filter(f => f.parentId == null))
    accessedRoutes = getTreeData(accessedRoutes)
    //console.log(accessedRoutes)
    //if (rolefunction.roles.includes('admin')) {
      
    //  accessedRoutes = asyncRoutes
    //} else {
    //  accessedRoutes = filterAsyncRoutes(asyncRoutes, rolefunction.functionMenus)
    //}
    this.SET_ROUTES(accessedRoutes)
  }

  @Action
  public clear() {
    this.SET_ROUTES([]);
  }
}

export const PermissionModule = getModule(Permission)
