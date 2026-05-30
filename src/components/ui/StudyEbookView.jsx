/**
 * 문장 학습 Ebook 모드 — 한 페이지씩 표시, 터치로 앞·뒷면 전환, 본문 스크롤
 */
function StudyEbookView({
  frontText,
  backText,
  frontDir,
  backDir,
  showBack,
  fadeKey,
  onToggleSide,
  currentIndex,
  totalPages,
  onPrev,
  onNext,
  hasAudio,
  onPlayAudio,
}) {
  const displayText = showBack ? backText : frontText
  const displayDir = showBack ? backDir : frontDir
  const sideLabel = displayDir === 'rtl' ? '아랍어' : '한국어'

  const handleAudioClick = (event) => {
    event.stopPropagation()
    if (typeof onPlayAudio === 'function') {
      onPlayAudio()
    }
  }

  return (
    <div className="studyEbookStage">
      <div
        key={fadeKey}
        className="paragraphReaderPageCard studyEbookPageCard"
        role="button"
        tabIndex={0}
        onClick={onToggleSide}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleSide()
          }
        }}
        aria-label={
          showBack ? '뒷면 — 터치하면 앞면으로 전환' : '앞면 — 터치하면 뒷면으로 전환'
        }
      >
        <div className="studyEbookCardHeader">
          <p className="paragraphReaderSideHint">{sideLabel} · 터치하여 전환</p>
          {hasAudio ? (
            <button
              type="button"
              className="sentenceAudioPlayButton"
              onClick={handleAudioClick}
              aria-label="문장 오디오 재생"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M14 5v14l-6-4H4V9h4z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 9a5 5 0 0 1 0 6M20.5 6.5a8.5 8.5 0 0 1 0 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
        <div
          className={`paragraphReaderBody paragraphReaderBody--fade ${displayDir === 'rtl' ? 'paragraphReaderBody--ar' : 'paragraphReaderBody--ko'}`}
          dir={displayDir}
        >
          {displayText}
        </div>
      </div>

      <footer className="studyEbookFooter">
        <button
          type="button"
          className="paragraphReaderNavBtn"
          disabled={currentIndex <= 0}
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          aria-label="이전 문장"
        >
          ‹
        </button>
        <span className="studyEbookFooterPage" aria-live="polite">
          {totalPages > 0 ? `${currentIndex + 1} / ${totalPages}` : '0 / 0'}
        </span>
        <button
          type="button"
          className="paragraphReaderNavBtn"
          disabled={currentIndex >= totalPages - 1}
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          aria-label="다음 문장"
        >
          ›
        </button>
      </footer>
    </div>
  )
}

export default StudyEbookView
