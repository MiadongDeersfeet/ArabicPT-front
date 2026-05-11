import axios from 'axios'

/** 라이브러리·문장 세트 API용 */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  withCredentials: true,
})
