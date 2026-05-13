import axios from 'axios'
import { getApiBaseUrl } from './baseUrl'

/** 라이브러리·문장 세트 API용 — axiosInstance와 동일하게 Bearer 전달 */
export const httpClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})

httpClient.interceptors.request.use(
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

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 요청 오류:', error)
    return Promise.reject(error)
  },
)
