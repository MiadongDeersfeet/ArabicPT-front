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

  return (
    <>
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
        <p className="paragraphReaderSideHint">{sideLabel} · 터치하여 전환</p>
        <div
          className={`paragraphReaderBody paragraphReaderBody--fade ${displayDir === 'rtl' ? 'paragraphReaderBody--ar' : 'paragraphReaderBody--ko'}`}
          dir={displayDir}
        >
          {displayText}
        </div>
      </div>

      <footer className="paragraphReaderFooter studyEbookFooter">
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

        <button
          type="button"
          className="paragraphReaderAudioBtn"
          disabled={!hasAudio}
          onClick={(e) => {
            e.stopPropagation()
            onPlayAudio()
          }}
          aria-label={hasAudio ? '음성 재생' : '음성 없음'}
        >
          {hasAudio ? '▶ 재생' : '음성 없음'}
        </button>

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

      <p className="studyEbookPageIndicator" aria-live="polite">
        {totalPages > 0 ? `${currentIndex + 1} / ${totalPages}` : '0 / 0'}
      </p>
    </>
  )
}

export default StudyEbookView
