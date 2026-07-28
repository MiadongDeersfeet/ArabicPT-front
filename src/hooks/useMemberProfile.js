import { useEffect, useState } from 'react'
import { fetchMyMemberProfile } from '../api/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { resolveProfileImageUrl } from '../utils/profileImage.js'

/**
 * 로그인한 회원의 DB 프로필(GET /api/members/me)을 가져온다.
 *
 * - 인증 상태 자체는 AuthContext가 그대로 소유한다. 이 훅은 읽기 전용 부가 정보만 다룬다.
 * - 실패하면 조용히 null을 돌려준다. 프로필 조회 실패가 화면을 막으면 안 된다.
 * - 헤더와 페이지에서 함께 쓰므로 현재 토큰 기준으로 1건만 캐시해 중복 요청을 막는다.
 */
let cachedToken = null
let cachedProfile = null
let inFlightToken = null
let inFlightRequest = null

function normalize(payload) {
  if (!payload || typeof payload !== 'object') return null
  return {
    name: payload.name ?? payload.NAME ?? '',
    email: payload.email ?? payload.EMAIL ?? '',
    profileImage: payload.profileImage ?? payload.profile_image ?? payload.PROFILE_IMAGE ?? null,
  }
}

function readCache(accessToken) {
  return accessToken && accessToken === cachedToken ? cachedProfile : null
}

function loadProfile(accessToken) {
  if (accessToken === cachedToken) return Promise.resolve(cachedProfile)
  if (accessToken === inFlightToken && inFlightRequest) return inFlightRequest

  inFlightToken = accessToken
  inFlightRequest = fetchMyMemberProfile()
    .then((payload) => normalize(payload))
    .catch(() => null)
    .then((profile) => {
      // 요청 도중 다른 계정으로 바뀌었으면 캐시에 쓰지 않는다.
      if (inFlightToken === accessToken) {
        cachedToken = accessToken
        cachedProfile = profile
        inFlightToken = null
        inFlightRequest = null
      }
      return profile
    })

  return inFlightRequest
}

/**
 * @returns {{ profile: {name: string, email: string, profileImage: string|null}|null,
 *             profileImageUrl: string|null }}
 */
export default function useMemberProfile() {
  const { auth } = useAuth()
  const accessToken = auth?.accessToken ?? null
  const [loaded, setLoaded] = useState(null) // { token, profile }

  useEffect(() => {
    if (!accessToken) return undefined

    let alive = true
    loadProfile(accessToken).then((profile) => {
      if (alive) setLoaded({ token: accessToken, profile })
    })

    return () => {
      alive = false
    }
  }, [accessToken])

  // 로그아웃했거나 계정이 바뀌면 이전 프로필을 보여주지 않는다.
  const profile = accessToken
    ? (loaded?.token === accessToken ? loaded.profile : readCache(accessToken))
    : null

  return {
    profile,
    profileImageUrl: resolveProfileImageUrl(profile?.profileImage),
  }
}
