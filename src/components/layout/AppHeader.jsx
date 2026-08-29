import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import useMemberProfile from '../../hooks/useMemberProfile.js'
import BrandLogo from './BrandLogo.jsx'
import useMenuDismiss from './useMenuDismiss.js'

/**
 * 로그인 상태 헤더.
 *
 * 링크 정책: 실제로 존재하는 라우트만 노출한다.
 * 로드맵·복습은 아직 페이지가 없어 ready:false 로 두고 렌더하지 않는다.
 * 해당 라우트가 App.jsx에 추가되면 ready만 true로 바꾸면 된다.
 */
const APP_NAV = [
  { label: '홈', to: '/', end: true, ready: true },
  { label: '학습', to: '/learn', ready: true },
  { label: '라이브러리', to: '/library', ready: true },
  { label: '로드맵', to: '/roadmap', ready: false },
  { label: '복습', to: '/review', ready: false },
]

const VISIBLE_APP_NAV = APP_NAV.filter((item) => item.ready)

function AppHeader({ auth, onLogout }) {
  const { pathname } = useLocation()
  const { isOpen, close, toggle, containerRef, triggerRef } = useMenuDismiss()

  // DB 프로필(GET /api/members/me). 조회 전이거나 실패하면 로그인 시 받은 값으로 대체한다.
  const { profile, profileImageUrl } = useMemberProfile()
  // 로드에 실패한 URL만 기억해 두면, 이미지가 바뀌었을 때 자동으로 다시 시도한다.
  const [failedImageUrl, setFailedImageUrl] = useState(null)

  useEffect(() => {
    close()
  }, [pathname, close])

  const displayName =
    profile?.name?.trim() || auth?.name?.trim() || profile?.email || auth?.email || '사용자'
  const displayEmail = profile?.email || auth?.email || ''
  const avatarText = displayName.slice(0, 1).toUpperCase()
  const showPhoto = Boolean(profileImageUrl) && failedImageUrl !== profileImageUrl

  const avatar = showPhoto ? (
    <img
      src={profileImageUrl}
      alt=""
      aria-hidden="true"
      className="headerAvatar headerAvatar--photo"
      referrerPolicy="no-referrer"
      onError={() => setFailedImageUrl(profileImageUrl)}
    />
  ) : (
    <span className="headerAvatar" aria-hidden="true">
      {avatarText}
    </span>
  )

  return (
    <header className="siteHeader siteHeader--app" ref={containerRef}>
      <div className="container siteHeaderInner siteHeaderInner--app">
        <BrandLogo />

        <nav className="headerNav headerNav--app" aria-label="주요 메뉴">
          {VISIBLE_APP_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `headerNavLink headerNavLink--app${isActive ? ' isActive' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="headerActions">
          {/*
            알림 영역: 알림 API가 준비되면 이 자리에 아이콘 버튼을 넣는다.
            동작하지 않는 아이콘을 미리 노출하지 않기 위해 지금은 비워 둔다.
          */}

          <div className="headerProfile">
            <button
              type="button"
              ref={triggerRef}
              className="headerProfileButton headerProfileButton--app"
              aria-label={`${displayName} 계정 메뉴`}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls="headerProfileMenu"
              onClick={toggle}
            >
              {avatar}
              <span className="headerUserName">{displayName}</span>
              <svg
                className={`headerChevron${isOpen ? ' isOpen' : ''}`}
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  d="M5 8l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="headerProfileMenu" id="headerProfileMenu" role="menu">
                <div className="headerProfileMeta">
                  <span className="headerProfileMetaAvatar">{avatar}</span>
                  <span className="headerProfileMetaText">
                    <strong>{displayName}</strong>
                    {displayEmail ? <span>{displayEmail}</span> : null}
                  </span>
                </div>

                {/* 모바일에서는 상단 내비게이션 대신 이 메뉴 안에서 이동한다. */}
                <div className="headerProfileNav">
                  {VISIBLE_APP_NAV.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      role="menuitem"
                      className="headerProfileMenuItem"
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                <button
                  type="button"
                  role="menuitem"
                  className="headerProfileMenuItem headerProfileLogout"
                  onClick={() => {
                    close()
                    onLogout()
                  }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
