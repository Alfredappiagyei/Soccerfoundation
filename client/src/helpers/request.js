import axios from 'axios'

const instance = axios.create({
  baseURL: '/'
}) 

instance.interceptors.request.use(
  function (config){
    const cookie  = window.Cookies.get('xsrf-token');
    config.headers = Object.assign({}, config.headers, { 
      'X-XSRF-TOKEN': cookie
     })

     return config
  }
)

instance.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (error.response) {
      if (error.response.status === 401) {
          window.location.href = '/login'
      }
      return Promise.reject(error)
    } else if (error.request) {
      return Promise.reject(error.request)
    } else {
      return Promise.reject(error)
    }
  }
)

export default instance
