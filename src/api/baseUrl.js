/**
 * VITE_API_BASE_URL 이 비어 있으면(빈 문자열 포함) 같은 호스트를 쓴다.
 * Nginx로 /api 가 같은 도메인에 있을 때 OAuth·API가 동작하게 한다.
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:8080'
}
