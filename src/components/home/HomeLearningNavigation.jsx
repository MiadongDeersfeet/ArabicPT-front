import { Link } from 'react-router-dom'
import { LEARNING_CATEGORIES } from '../../constants/learningCategories.js'
import './HomeLearningNavigation.css'

function Motif({ type }) {
  if (type === 'grammar') {
    return (
      <svg className="homeNavMotif" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 14h28M10 24h20M10 34h24" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M34 20l6 4-6 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  if (type === 'conversation') {
    return (
      <svg className="homeNavMotif" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="6" y="10" width="22" height="16" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="18" y="22" width="24" height="16" rx="6" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  if (type === 'vocabulary') {
    return (
      <svg className="homeNavMotif" viewBox="0 0 48 48" aria-hidden="true">
        <text x="8" y="28" fontSize="14" fill="currentColor" opacity="0.85">
          كلمة
        </text>
        <text x="26" y="40" fontSize="10" fill="currentColor" opacity="0.55">
          단어
        </text>
      </svg>
    )
  }
  return (
    <svg className="homeNavMotif" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 12h18v24H14a4 4 0 0 1-4-4V12Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M28 12h10v20a4 4 0 0 1-4 4h-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M34 22c2 1.2 3.2 2.8 3.2 5s-1.2 3.8-3.2 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function HomeLearningNavigation() {
  return (
    <section className="homeNav" aria-labelledby="home-nav-title">
      <div className="homeNavHead">
        <h2 id="home-nav-title" className="homeNavTitle">
          ArabicPT에서 학습하기
        </h2>
        <p className="homeNavLead">목적에 맞는 영역으로 바로 들어가세요.</p>
      </div>

      <div className="homeNavShell">
        <ul className="homeNavGrid">
          {LEARNING_CATEGORIES.map((item, index) => {
            const num = String(index + 1).padStart(2, '0')
            return (
              <li key={item.id}>
                <Link to="/learn" className="homeNavItem">
                  <span className="homeNavItemTop">
                    <span className="homeNavNum">{num}</span>
                    <Motif type={item.motif} />
                  </span>
                  <span className="homeNavItemTitle">{item.title}</span>
                  <span className="homeNavItemLine">{item.homeLine}</span>
                  <span className="homeNavItemGo" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default HomeLearningNavigation
