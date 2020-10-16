import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

Vue.use(Router)

/*
  redirect:                      if set to 'noredirect', no redirect action will be trigger when clicking the breadcrumb
  meta: {
    title: 'title'               the name showed in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon showed in the sidebar
    breadcrumb: false            if false, the item will be hidden in breadcrumb (default is true)
    hidden: true                 if true, this route will not show in the sidebar (default is false)
  }
*/

export const asyncRoutes: RouteConfig[] = [

  {
    path: '/sys',
    name:'sys',
    component: Layout,   
    redirect: '/sys/user',
    meta: {
      title: 'sys',
      icon: 'clipboard'
    },
    children: [
      {
        path: 'user',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/user.vue'),
        name: "user",
        meta: {
          title: 'user',
          icon: 'peoples'

        }
      },
      {
        path: 'role',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/role.vue'),
        name: "role",
        meta: {
          title: 'role',
          icon: 'peoples'
        }
      },
      {
        path: 'appfunction',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/appfunction.vue'),
        name: "appfunction",
        meta: {
          title: 'appfunction',
          icon: 'international'
        }
      }
      ,
      {
        path: 'rolepermission/:id(\\d+)',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/rolepermission.vue'),
        name: "rolepermission",
        meta: {
          title: 'rolepermission',
          icon: 'international',
          hidden: true
        }
      },
      {
        path: 'userdetail',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/userdetail.vue'),
        name: "userdetail",
        meta: {
          title: 'userdetail',
          icon: 'user'

        }
      },
      {
        path: 'dataauth/:id(\\d+)',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/dataauth.vue'),
        name: "dataauth",
        meta: {
          title: 'dataauth',
          icon: 'international',
          hidden:true
        }
      },
      {
        path: 'dataauthlist',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/dataauthlist.vue'),
        name: "dataauthlist",
        meta: {
          title: 'dataauthlist',
          icon: 'list'

        }
      },
      {
        path: 'plugins',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/sys/plugins.vue'),
        name: "plugins",
        meta: {
          title: 'plugins',
          icon: 'list'

        }
      }
    ]
  },
  {
    path: '/filebrowse',
    name: 'filebrowse',
    component: Layout,
    redirect: '/filebrowse/index',
    meta: {
      title: 'fileManager',
      icon: 'tree-table'
    },
    children: [
      {
        path: 'index',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/filebrowse/index.vue'),
        name: "fileBrowse",
        meta: {
          title: 'fileBrowse',
          icon: 'tree-table'

        }
      },
      {
        path: 'fileeditor',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/filebrowse/fileeditor.vue'),
        name: "fileeditor",
        meta: {
          title: 'fileeditor',
          icon: 'tree-table',
          hidden: true
        }
      }
    ]
  },
  {
    path: '/site',
    name:'site',
    component: Layout,
    redirect: '/site/navigation',
    meta: {
      title: 'site',
      icon: 'tree-table'
    },
    children: [
      {
        path: 'navigation',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/site/navigation.vue'),
        name: "navigation",
        meta: {
          title: 'navigation',
          icon: 'tree-table'

        }
      }
    ]
  },
  {
    path: '/article',
    name:'article',
    component: Layout,
    redirect: '/article/create',
    meta: {
      title: 'article',
      icon: 'example'
    },
    children: [
      {
        path: 'create',
        component: () => import(/* webpackChunkName: "article" */ '@/views/article/create.vue'),
        name: "createArticle",
        meta: {
          title: 'createArticle',
          icon: 'edit'

        }
      },
      {
        path: 'list',
        component: () => import(/* webpackChunkName: "article" */ '@/views/article/list.vue'),
        name: "articleList",
        meta: {
          title: 'articleList',
          icon: 'list'
        }
      }
      ,
      {
        path: 'edit/:id(\\d+)',
        component: () => import(/* webpackChunkName: "article" */ '@/views/article/edit.vue'),
        name: "editArticle",
        meta: {
          title: 'editArticle',
          icon: 'edit',
          hidden: true
        }
      },
      {
        path: 'catagory',
        component: () => import(/* webpackChunkName: "article" */ '@/views/article/catagory.vue'),
        name: "articleCatagory",
        meta: {
          title: 'articlCatagory',
          icon: 'component'
        }
      },
      {
        path: 'tags',
        component: () => import(/* webpackChunkName: "article" */ '@/views/article/tags.vue'),
        name: "tags",
        meta: {
          title: 'tags',
          icon: 'component'
        }
      }
    ]
  },
  {
    path: '/shop',
    name:'shop',
    component: Layout,
    redirect: '/shop/productcreate',
    meta: {
      title: 'product',
      icon: 'shopping'
    },
    children: [
      {
        path: 'productcreate',
        component: () => import(/* webpackChunkName: "shop" */ '@/views/shop/productcreate.vue'),
        name: "productCreate",
        meta: {
          title: 'productCreate',
          icon: 'documentation',

          hidden: true
        }
      },
      {
        path: 'productlist',
        component: () => import(/* webpackChunkName: "shop" */ '@/views/shop/productlist.vue'),
        name: "productList",
        meta: {
          title: 'productList',
          icon: 'list'
        }
      }
      ,
      {
        path: 'productedit/:id(\\d+)',
        component: () => import(/* webpackChunkName: "shop" */ '@/views/shop/productedit.vue'),
        name: "productEdit",
        meta: {
          title: 'productEdit',
          icon: 'edit',
          hidden: true
        }
      },
      {
        path: 'productcatagory',
        component: () => import(/* webpackChunkName: "shop" */ '@/views/shop/productcatagory.vue'),
        name: "productCatagory",
        meta: {
          title: 'productCatagory',
          icon: 'component'
        }
      }
    ]
  }
]
export const constant404Routes: RouteConfig[] = [
  
  {
    path: '*',
    redirect: '/404',
    meta: { hidden: true }
  }
]
export const constantRoutes: RouteConfig[] = [
  {
    path: '/redirect',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import(/* webpackChunkName: "redirect" */ '@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
    meta: { title:'login', hidden: true }
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "404" */ '@/views/404.vue'),
    meta: { title:'page404', hidden: true }
  },
  {
    path: '/403',
    component: () => import(/* webpackChunkName: "404" */ '@/views/403.vue'),
    meta: { title: 'page403', hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      title: 'Dashboard',
      icon: 'dashboard'
    },
    children: [
      {
        path: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/index.vue'),
        name: 'Dashboard',
        meta: {
          title: 'Dashboard',
          icon: 'dashboard',
          affix: true
        }
      }
    ]
  },
  {
    path: '/external-link',
    meta: {
      title: 'externalLink',
      icon: 'link'
    },
    component: Layout,
    children: [
      {
        path: 'https://github.com/Armour/vue-typescript-admin-template',
        meta: {
          title: 'externalLink',
          icon: 'link'
        }
      }
    ]
  }
]
export default new Router({
  // mode: 'history',  // Enable this if you need.
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  base: process.env.BASE_URL,
  routes: constantRoutes
})


