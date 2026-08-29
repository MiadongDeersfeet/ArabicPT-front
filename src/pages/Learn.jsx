import { Link } from 'react-router-dom'
import LearnHero from '../components/learning/LearnHero.jsx'
import LearnCatalog from '../components/learning/LearnCatalog.jsx'
import LearningFlow from '../components/learning/LearningFlow.jsx'
import './Learn.css'

/**
 * /learn — ArabicPT Learning Catalog.
 * No fake course/progress data. Category shells link to real routes.
 */
function Learn() {
  return (
    <div className="learnPage">
      <div className="container learnPageInner">
        <LearnHero />
        <LearnCatalog />
        <LearningFlow />

        <aside className="learnClosing" aria-labelledby="learn-library-title">
          <div className="learnClosingCopy">
            <h2 id="learn-library-title" className="learnClosingTitle">
              <span className="learnClosingPhrase">배운 것을</span>{' '}
              <span className="learnClosingPhrase">내 것으로 남겨두세요.</span>
            </h2>
            <p className="learnClosingText">
              공식 콘텐츠에서 만난 문장과 글을
              <br />
              내 라이브러리에 저장하고
              <br />
              다시 학습할 수 있습니다.
            </p>
          </div>
          <div className="learnClosingAside">
            <div className="learnClosingMotif" aria-hidden="true">
              <svg viewBox="0 0 72 72" className="learnClosingMotifSvg">
                <path
                  d="M20 14h32v46l-16-9-16 9V14Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M30 26h12M30 35h12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.45"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </svg>
            </div>
            <Link to="/library" className="learnClosingCta">
              라이브러리 보기
              <span className="learnClosingCtaArrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Learn
