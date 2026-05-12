import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './RequireAuth.css'

export default function RequireAuth({ children }) {
  const { auth } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [auth])

  if (!auth) {
    return (
      <div className="authGateOverlay" role="presentation">
        <div
          className="authGateCard"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-gate-title"
        >
          <h2 id="auth-gate-title" className="authGateTitle">
            라이브러리
          </h2>
          <p className="authGateHint">
            라이브러리는 로그인 후 이용해 주세요. 내 문장 세트와 폴더를 보려면 아래에서
            로그인해 주세요.
          </p>
          <div className="authGateActions">
            <button
              type="button"
              className="primaryButton"
              onClick={() => navigate('/login', { state: { from: location } })}
            >
              로그인하기
            </button>
            <Link to="/" className="authGateSecondary">
              홈으로
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
