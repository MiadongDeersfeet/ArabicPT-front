import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { POST_LOGIN_REDIRECT_KEY } from '../constants/postLoginRedirect'
import { useAuth } from '../context/AuthContext'

function AuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const memberId = params.get('memberId')
    const email = params.get('email')
    const name = params.get('name')
    const role = params.get('role')
    const error = params.get('error')

    if (error || !accessToken) {
      navigate('/login', { replace: true })
      return
    }

    login({ accessToken, memberId, email, name, role })

    const saved = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
    const target =
      saved && saved !== '/login' && saved.startsWith('/') ? saved : '/'
    navigate(target, { replace: true })
  }, [login, navigate])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <p>로그인 처리 중...</p>
    </div>
  )
}

export default AuthCallback
