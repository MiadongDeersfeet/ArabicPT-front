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
        <div className="headerSlot" aria-hidden="true" />

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
            <nav className="siteNav" aria-label="주요 메뉴">
              <Link to="/" onClick={() => setIsOpen(false)}>
                홈
              </Link>
              <Link to="/ui-kit" onClick={() => setIsOpen(false)}>
                UI 가이드
              </Link>
            </nav>

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
