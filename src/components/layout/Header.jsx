import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <header className="siteHeader">
      <div className="container siteHeaderInner">
        <Link to="/" className="headerHomeLink" aria-label="홈으로 이동">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M12 3.5 4 10v10.5h5.5v-6h5v6H20V10l-8-6.5Z" />
          </svg>
        </Link>

        <Link to="/" className="siteBrandLink">
          ArabicPT
        </Link>

        <div className="headerDropdown" ref={dropdownRef}>
          <button
            type="button"
            className={`headerMenuButton${isOpen ? ' open' : ''}`}
            aria-label="네비게이션 메뉴 열기"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`headerDropdownPanel${isOpen ? ' open' : ''}`}>
            <div className="siteActions">
              <button type="button" className="headerGhostButton">
                로그인
              </button>
              <button type="button" className="headerPrimaryButton">
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
