import { useEffect, useState } from 'react'
import SentenceBox from '../components/ui/SentenceBox.jsx'
import { sentenceDummyData } from '../data/sentences/sentenceDummyData.js'

function SentenceStudy() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const current = sentenceDummyData[currentIndex]

  const goPrev = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === 0 ? sentenceDummyData.length - 1 : prev - 1))
  }

  const goNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === sentenceDummyData.length - 1 ? 0 : prev + 1))
  }

  const flipCard = () => {
    setIsFlipped((prev) => !prev)
  }

  useEffect(() => {
    const handleSpaceFlip = (event) => {
      const targetTag = event.target?.tagName?.toLowerCase()
      const isEditable =
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        targetTag === 'select' ||
        event.target?.isContentEditable

      if (isEditable) return

      if (event.code === 'Space') {
        event.preventDefault()
        flipCard()
      }
    }

    window.addEventListener('keydown', handleSpaceFlip)
    return () => window.removeEventListener('keydown', handleSpaceFlip)
  }, [])

  return (
    <section className="container">
      <div className="studyPageIntro">
        <h2>문장 학습</h2>
        <p>
          {currentIndex + 1} / {sentenceDummyData.length} 문장
        </p>
      </div>

      <SentenceBox
        title="문장 학습 카드"
        status="학습 중"
        progress={`문장 ${currentIndex + 1}`}
        frontText={current.arabic}
        backText={current.korean}
        frontDir="rtl"
        backDir="ltr"
        isFlipped={isFlipped}
        onFlip={flipCard}
      />

      <div className="studyActionRow">
        <button type="button" className="headerGhostButton" onClick={goPrev}>
          이전 문장
        </button>
        <button type="button" className="headerPrimaryButton" onClick={goNext}>
          다음 문장
        </button>
      </div>
    </section>
  )
}

export default SentenceStudy
