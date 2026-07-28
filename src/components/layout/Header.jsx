import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppHeader from './AppHeader.jsx'
import PublicHeader from './PublicHeader.jsx'
import './Header.css'

/**
 * 로그인 여부에 따라 공개 헤더 / 앱 헤더를 고른다.
 *
 * 로그아웃 처리는 이 컴포넌트가 소유한다.
 * AppHeader는 로그아웃 직후 언마운트되므로, 콜백을 계속 마운트되어 있는 쪽에 두어
 * 기존 동작(logout() 후 /login 이동)을 그대로 유지한다.
 */
function Header() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (auth) {
    return <AppHeader auth={auth} onLogout={handleLogout} />
  }

  return <PublicHeader />
}

export default Header
