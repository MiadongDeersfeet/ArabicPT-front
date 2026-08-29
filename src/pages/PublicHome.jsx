import HeroSection from '../components/landing/HeroSection.jsx'
import LearningFeaturesSection from '../components/landing/LearningFeaturesSection.jsx'
import LearningPreviewSection from '../components/landing/LearningPreviewSection.jsx'

/**
 * 비로그인 Landing — 기존 Home !auth 분기를 이동.
 * Hero / Features / Preview 구조·className 유지 (pixel 동일).
 */
function PublicHome() {
  return (
    <div className="homeLanding">
      <HeroSection />
      <LearningFeaturesSection />
      <LearningPreviewSection />
    </div>
  )
}

export default PublicHome
