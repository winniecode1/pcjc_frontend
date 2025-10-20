import axios from 'axios'
import Qs from 'qs'

export const Axios = axios.create({
  baseURL: '',
  timeout: 40000,
  headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
})

// 请求拦截器
Axios.interceptors.request.use(req => {
  // POST传参反序列化
  // 后台用的params，axios默认使用的json格式数据接收不到，转为formdata

  if (req.dataType === 'json') {
    req.headers = {
    }
  } else {
    req.data = Qs.stringify(req.data)
  }
  // JWT支持，自动在HEADER上加Authorization
  if (localStorage.token) {
    req.headers.Authorization = 'bearer ' + localStorage.token
  }
  return req
}, error => {
  alert('错误的参数', 'fail')
  return Promise.reject(error)
})

// 返回状态判断(响应拦截器)
Axios.interceptors.response.use(res => {
  return res
}, error => {
  // 401 表示token 验证失败,重新登录获取 token
  if ((error.response.status !== undefined) && (error.response.status === 401)) {
    location.href = '/'
  }
  // 返回 response 错误信息
  return Promise.reject(error.response.data)
})

export const AxiosJ = axios.create({
  baseURL: '',
  timeout: 40000,
  headers: {'Content-Type': 'application/json;charset=UTF-8'}
})

// 请求拦截器
AxiosJ.interceptors.request.use(req => {
  // POST传参反序列化
  // 后台用的params，axios默认使用的json格式数据接收不到，转为formdata
  // JWT支持，自动在HEADER上加Authorization
  if (localStorage.token) {
    req.headers.Authorization = 'bearer ' + localStorage.token
  }
  return req
}, error => {
  alert('错误的参数', 'fail')
  return Promise.reject(error)
})

// 返回状态判断(响应拦截器)
AxiosJ.interceptors.response.use(res => {
  return res
}, error => {
  // 401 表示token 验证失败,重新登录获取 token
  if ((error.response.status !== undefined) && (error.response.status === 401)) {
    location.href = '/'
  }
  // 返回 response 错误信息
  return Promise.reject(error.response.data)
})

export default {
  install (Vue) {
    Object.defineProperty(Vue.prototype, '$ajax', {value: Axios})
    Object.defineProperty(Vue.prototype, '$ajaxJ', {value: AxiosJ})
  }
}
