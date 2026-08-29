import { Link } from 'react-router-dom'
import { LEARNING_CATEGORIES } from '../../constants/learningCategories.js'
import './CategoryMiniNav.css'

function CategoryMiniNav({ currentSlug }) {
  return (
    <nav className="catMiniNav" aria-label="다른 학습 영역">
      <h2 className="catMiniNavTitle">다른 학습 영역</h2>
      <ul className="catMiniNavList">
        {LEARNING_CATEGORIES.map((item) => {
          const active = item.slug === currentSlug
          return (
            <li key={item.id}>
              {active ? (
                <span className="catMiniNavItem isActive" aria-current="page">
                  <span className="catMiniNavNum">{item.number}</span>
                  <span className="catMiniNavLabel">{item.title}</span>
                </span>
              ) : (
                <Link to={item.path} className="catMiniNavItem">
                  <span className="catMiniNavNum">{item.number}</span>
                  <span className="catMiniNavLabel">{item.title}</span>
                  <span className="catMiniNavGo" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default CategoryMiniNav
