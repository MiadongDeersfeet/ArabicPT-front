import axios from 'axios'
import { getApiBaseUrl } from './baseUrl'

/** 라이브러리·문장 세트 API용 */
export const httpClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})
