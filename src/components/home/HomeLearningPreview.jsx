import './HomeLearningPreview.css'

/**
 * Decorative study-card abstraction for Home hero.
 * Not real SentenceStudy — no fake progress numbers.
 */
function HomeLearningPreview() {
  return (
    <div className="homePreview" aria-hidden="true">
      <div className="homePreviewGlow" />
      <div className="homePreviewGlyph">كلمة</div>
      <div className="homePreviewStack">
        <div className="homePreviewCard homePreviewCard--back" />
        <div className="homePreviewCard homePreviewCard--front">
          <div className="homePreviewCardTop">
            <span className="homePreviewAudio">
              <span className="homePreviewAudioDot" />
              AUDIO
            </span>
            <span className="homePreviewWave">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <p className="homePreviewArabic" dir="rtl" lang="ar">
            سَيَكُونُ
          </p>
          <p className="homePreviewMeaning">~할 것이다</p>
          <div className="homePreviewMarks">
            <span>몰라요</span>
            <span>알고 있음</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeLearningPreview
