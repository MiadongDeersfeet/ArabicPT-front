import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HeroSection from '../components/landing/HeroSection.jsx'
import LearningFeaturesSection from '../components/landing/LearningFeaturesSection.jsx'
import LearningPreviewSection from '../components/landing/LearningPreviewSection.jsx'

function Home() {
  const { auth } = useAuth()

  if (!auth) {
    return (
      <div className="homeLanding">
        <HeroSection />
        <LearningFeaturesSection />
        <LearningPreviewSection />
      </div>
    )
  }

  return (
    <section className="container">
      <div className="introCard homeIntroCard" role="region" aria-label="ArabicPT 홈">
        <h2>ArabicPT</h2>
        <p>문장 세트를 만들고 학습하세요.</p>
        <Link to="/library" className="primaryButton homeLibraryButton">
          라이브러리
        </Link>
      </div>
    </section>
  )
}

export default Home
