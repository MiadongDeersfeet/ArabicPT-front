import { getApiBaseUrl } from '../api/baseUrl.js'

/**
 * DB에 저장된 프로필 이미지 값을 실제로 불러올 수 있는 URL로 바꾼다.
 * - 구글 로그인으로 들어온 값은 이미 절대 URL(https://lh3.googleusercontent.com/...)이다.
 * - 서버에 올린 파일이면 상대 경로이므로 API 베이스 주소를 붙인다.
 * - 값이 없으면 null을 돌려주고, 호출하는 쪽에서 대체 UI를 보여준다.
 */
export function resolveProfileImageUrl(raw) {
  if (raw == null || String(raw).trim() === '') return null
  const url = String(raw).trim()
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const base = getApiBaseUrl().replace(/\/$/, '')
  if (url.startsWith('/')) return `${base}${url}`
  return `${base}/${url}`
}

export default resolveProfileImageUrl
