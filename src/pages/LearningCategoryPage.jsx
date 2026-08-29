import { Link, Navigate, useParams } from 'react-router-dom'
import { getLearningCategoryBySlug } from '../constants/learningCategories.js'
import CategoryMotif from '../components/learning/CategoryMotif.jsx'
import CategoryCoursePlaceholder from '../components/learning/CategoryCoursePlaceholder.jsx'
import CategoryMiniNav from '../components/learning/CategoryMiniNav.jsx'
import './LearningCategoryPage.css'

function splitLead(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Shared shell for /learn/:slug category pages.
 * Visual/content shell only — no fake courses.
 */
function LearningCategoryPage({ slug: slugProp }) {
  const params = useParams()
  const slug = slugProp || params.slug
  const category = getLearningCategoryBySlug(slug)

  if (!category) {
    return <Navigate to="/learn" replace />
  }

  return (
    <div className={`catPage catPage--${category.surface}`}>
      <div className="container catPageInner">
        <Link to="/learn" className="catBack">
          <span aria-hidden="true">← </span>
          학습
        </Link>

        <header className="catHero">
          <div className="catHeroCopy">
            <p className="catHeroMeta">
              <span className="catHeroNum">{category.number}</span>
              <span className="catHeroSep" aria-hidden="true">
                /
              </span>
              <span className="catHeroEyebrow">{category.eyebrow}</span>
            </p>
            <h1 className="catHeroTitle">{category.title}</h1>
            <p className="catHeroArabic" lang="ar" dir="rtl">
              {category.arabicTitle}
            </p>
            <p className="catHeroLead">
              {splitLead(category.detailLead).map((line) => (
                <span key={line} className="catHeroLeadLine">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div className="catHeroVisual" aria-hidden="true">
            <CategoryMotif type={category.motif} />
          </div>
        </header>

        <section className="catPoints" aria-labelledby="cat-points-title">
          <h2 id="cat-points-title" className="catPointsTitle">
            이 영역에서는
          </h2>
          <ul className="catPointsList">
            {category.learningPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <CategoryCoursePlaceholder
          title={category.coursePlaceholder.title}
          body={category.coursePlaceholder.body}
        />

        <CategoryMiniNav currentSlug={category.slug} />
      </div>
    </div>
  )
}

export default LearningCategoryPage
