import axios from 'axios'
import { getApiBaseUrl } from './baseUrl'

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: 공통 에러 처리(토스트/리다이렉트/로깅)로 확장 예정
    console.error('API 요청 오류:', error)
    return Promise.reject(error)
  },
)

export default axiosInstance
