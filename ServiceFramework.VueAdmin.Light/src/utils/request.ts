import axios from 'axios'
import router from '@/router'
import { Message, MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { log } from 'util'



const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 30000
  //,
  ////支持跨域携带cookies使用vue.axios发送请求时配置如下：
  //withCredentials: true 
})

// Request interceptors
service.interceptors.request.use(
  (config) => {
    // Add X-Access-Token header to every request, you can add other custom headers here
    if (UserModule.token) {
      config.headers['Authorization'] ="Bearer " +UserModule.token
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

// Response interceptors
service.interceptors.response.use(
  (response) => {
    
    const res = response.data
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
     
      //return Promise.reject(new Error(res.message || 'Error'))
      return new Promise(() => { });
    } else {
      return response.data
    }
  },
  (error) => {
    // Some example codes here:
    // code == 20000: success
    // code == 50001: invalid access token
    // code == 50002: already login in other place
    // code == 50003: access token expired
    // code == 50004: invalid user (user not exist)
    // code == 50005: username or password is incorrect
    // You can change this part for your own usage.
 
    let res = error.response
    if (res.status === 401) {
      MessageBox.confirm(
        'You have been logged out, try to login again.',
        'Log out',
        {
          confirmButtonText: 'Relogin',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).then(() => {
        UserModule.ResetToken()
        location.reload() // To prevent bugs from vue-router
      })
      return;
    }
    if (res.status === 403) {
       //location.href='/403'
      router.replace({ path: '/403' })
      return;
    }
    Message.error(error.response.data||"error")
    return Promise.reject(error)
    //return new Promise(() => { });
    //Message({
    //  message: error.response.data.message||error.message,
    //  type: 'error',
    //  duration: 5 * 1000
    //})
    // Promise.reject(error)
  }
)

export default service
