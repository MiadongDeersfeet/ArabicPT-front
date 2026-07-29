import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../../assets/landing/hero-oasis-kneeling-camel.png'
import LearningPreviewModal from './LearningPreviewModal.jsx'
import './HeroSection.css'

/**
 * 비로그인 메인 랜딩 Hero.
 * 학습 미리보기 경로가 생기면 handleLearningPreviewSelect에서 연결한다.
 */
function HeroSection() {
  const [previewOpen, setPreviewOpen] = useState(false)

  const openPreview = useCallback(() => {
    setPreviewOpen(true)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewOpen(false)
  }, [])

  /**
   * 학습 영역 선택 핸들러.
   * 현재 공개 미리보기 경로가 없으므로 모달 상태만 유지한다.
   * 경로가 생기면 PREVIEW_ROUTES에 연결하면 된다.
   */
  const handleLearningPreviewSelect = useCallback((optionId) => {
    const PREVIEW_ROUTES = {
      grammar: null,
      conversation: null,
    }
    const route = PREVIEW_ROUTES[optionId]
    if (route) {
      // navigate(route)
    }
  }, [])

  return (
    <section className="heroSection" aria-labelledby="hero-heading">
      <div className="container heroSectionInner">
        <div className="heroCopy">
          <p className="heroBadge">아랍어 알파벳을 익힌 입문자를 위한 학습</p>

          <h1 id="hero-heading" className="heroTitle">
            아랍어,
            <br />
            매일 <span className="heroTitleAccent">가볍게</span>
            <br className="heroBreakMobile" />
            <span className="heroTitleTail">시작하세요.</span>
          </h1>

          <p className="heroDescription">
            아랍어 알파벳을 익힌 입문자를 위해,{' '}
            <br className="heroBreakDesktop" />
            기본 문법과 주제별 회화, 기초 단어까지 
            <br className="heroBreakDesktop" />
            {' '}혼자서도 즐겁게 배울 수 있도록 도와드릴게요.
          </p>

          <div className="heroActions">
            <button type="button" className="heroButton heroButton--primary" onClick={openPreview}>
              학습 미리보기
            </button>
            <Link to="/login" className="heroButton heroButton--secondary">
              무료로 시작하기
            </Link>
          </div>

          <p className="heroGuestNote">회원가입 없이 일부 학습 콘텐츠를 체험할 수 있어요.</p>
        </div>

        <div className="heroVisual" aria-hidden="true">
          <div className="heroVisualFrame">
            <img
              className="heroImage"
              src={heroImage}
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      {previewOpen ? (
        <LearningPreviewModal onClose={closePreview} onSelect={handleLearningPreviewSelect} />
      ) : null}
    </section>
  )
}

export default HeroSection
