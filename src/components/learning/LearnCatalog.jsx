import { Link } from 'react-router-dom'
import { LEARNING_CATEGORIES } from '../../constants/learningCategories.js'
import LearnCatalogMotif from './LearnCatalogMotif.jsx'
import './LearnCatalog.css'

function splitLead(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function LearnCatalog() {
  return (
    <section className="learnCatalog" aria-labelledby="learn-catalog-title">
      <div className="learnCatalogHead">
        <h2 id="learn-catalog-title" className="learnCatalogTitle">
          학습 영역
        </h2>
        <p className="learnCatalogLead">목적에 맞는 영역으로 들어가세요.</p>
      </div>

      <div className="learnCatalogShell">
        <ul className="learnCatalogGrid">
          {LEARNING_CATEGORIES.map((item) => (
            <li key={item.id} className="learnCatCell">
              <Link to={item.path} className="learnCatModule">
                <div className="learnCatTop">
                  <span className="learnCatNum">{item.number}</span>
                  <span className="learnCatMotifWrap">
                    <LearnCatalogMotif type={item.motif} />
                  </span>
                </div>
                <h3 className="learnCatTitle">{item.title}</h3>
                <p className="learnCatArabic" lang="ar" dir="rtl">
                  {item.arabicTitle}
                </p>
                <p className="learnCatDesc">
                  {splitLead(item.catalogLead).map((line) => (
                    <span key={line} className="learnCatDescLine">
                      {line}
                    </span>
                  ))}
                </p>
                <span className="learnCatCta">
                  {item.ctaLabel}
                  <span className="learnCatCtaArrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default LearnCatalog
