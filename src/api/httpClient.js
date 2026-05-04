import axios from 'axios'

/** 라이브러리·문장 세트 API용 (localhost 백엔드와 동일 정책) */
export const httpClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
})
