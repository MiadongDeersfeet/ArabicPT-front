import { useAuth } from '../../context/AuthContext'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import './Layout.css'

/**
 * 공통 레이아웃: Header -> main -> Footer
 *
 * variant
 * - 'public' : 비로그인 공개 화면 (일반 푸터)
 * - 'app'    : 로그인 후 앱 화면 (축소 푸터)
 * - 생략 시   : 로그인 여부로 자동 판단한다.
 *
 * 라우트에서 명시적으로 고정하고 싶을 때만 <Layout variant="public"> 처럼 넘긴다.
 * (App.jsx의 기존 라우트는 그대로 두어도 동작한다.)
 */
function Layout({ children, variant }) {
  const { auth } = useAuth()
  const resolvedVariant = variant ?? (auth ? 'app' : 'public')

  return (
    <div className={`layoutShell layoutShell--${resolvedVariant}`}>
      <a className="skipLink" href="#mainContent">
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="mainContent" className="layoutMain">
        {children}
      </main>
      <Footer variant={resolvedVariant} />
    </div>
  )
}

export default Layout
