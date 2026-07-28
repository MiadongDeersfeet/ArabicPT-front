import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import useMenuDismiss from './useMenuDismiss.js'

/**
 * 비로그인(공개) 헤더.
 *
 * 링크 정책
 * - `/library`는 실제 라우트다. 보호 경로이므로 비로그인 상태에서 누르면
 *   기존 RequireAuth 안내가 그대로 뜬다. (인증 흐름을 바꾸지 않는다)
 * - 아직 전용 페이지가 없는 항목은 존재하지 않는 라우트를 만들지 않고
 *   홈 내부 섹션 앵커로 둔다. Home에 같은 id의 섹션이 추가되면 별도 수정 없이 동작한다.
 */
const PUBLIC_NAV = [
  { label: '학습 방식', to: '/#how-it-works' },
  { label: '커리큘럼', to: '/#curriculum' },
  { label: '문장 라이브러리', to: '/library' },
  { label: '서비스 소개', to: '/#about' },
]

function PublicHeader() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isOpen, close, toggle, containerRef, triggerRef } = useMenuDismiss()

  // 페이지 이동 시 모바일 패널을 닫는다.
  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <header className="siteHeader" ref={containerRef}>
      <div className="container siteHeaderInner">
        <BrandLogo />

        <nav className="headerNav" aria-label="주요 메뉴">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.label} to={item.to} className="headerNavLink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="headerActions">
          <button
            type="button"
            className="headerGhostButton headerDesktopOnly"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
          <button
            type="button"
            className="headerPrimaryButton"
            onClick={() => navigate('/login')}
          >
            무료로 시작하기
          </button>

          <button
            type="button"
            ref={triggerRef}
            className={`headerMenuButton${isOpen ? ' isOpen' : ''}`}
            aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isOpen}
            aria-controls="publicMobileMenu"
            onClick={toggle}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="headerMobilePanel" id="publicMobileMenu">
          <nav className="headerMobileNav container" aria-label="모바일 주요 메뉴">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.label} to={item.to} className="headerMobileNavLink">
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              className="headerGhostButton headerMobileAction"
              onClick={() => {
                close()
                navigate('/login')
              }}
            >
              로그인
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

export default PublicHeader
