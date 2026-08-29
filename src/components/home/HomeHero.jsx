import { Link } from 'react-router-dom'
import HomeLearningPreview from './HomeLearningPreview.jsx'
import './HomeHero.css'

function HomeHero() {
  return (
    <section className="homeHero" aria-labelledby="home-hero-title">
      <div className="homeHeroCopy">
        <p className="homeHeroEyebrow">ARABICPT LEARNING</p>
        <h1 id="home-hero-title" className="homeHeroTitle">
          <span className="homeHeroTitleLine">오늘,</span>
          <span className="homeHeroTitleLine homeHeroTitleLine--second">
            <span className="homeHeroPhrase">아랍어를</span>{' '}
            <span className="homeHeroPhrase">한 걸음 더.</span>
          </span>
        </h1>
        <p className="homeHeroLead">
          기초부터 실전까지,
          <br />
          ArabicPT에서 차근차근 익혀보세요.
        </p>
        <Link to="/learn" className="homeHeroCta">
          <span>학습 둘러보기</span>
          <span className="homeHeroCtaArrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>
      <div className="homeHeroVisual">
        <HomeLearningPreview />
      </div>
    </section>
  )
}

export default HomeHero
