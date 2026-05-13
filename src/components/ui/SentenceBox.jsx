function SentenceBox({
  title,
  status = '학습 중',
  progress = '알고 있음 57',
  text,
  dir = 'ltr',
  frontText,
  backText,
  frontDir = 'ltr',
  backDir = 'rtl',
  isFlipped = false,
  onFlip,
  showAudioButton = false,
  audioButtonDisabled = false,
  onAudioPlay,
  className = '',
}) {
  const canFlip = typeof onFlip === 'function'
  const resolvedFrontText = frontText ?? text
  const resolvedBackText = backText ?? text

  const handleKeyDown = (event) => {
    if (!canFlip) return

    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault()
      onFlip()
    }
  }

  const handleAudioButtonClick = (event) => {
    event.stopPropagation()
    if (typeof onAudioPlay === 'function') {
      onAudioPlay()
    }
  }

  const rootClass = [
    'sentenceBox',
    canFlip ? 'canFlip' : '',
    isFlipped ? 'isFlipped' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={rootClass}
      aria-label={title}
      onClick={canFlip ? onFlip : undefined}
      onKeyDown={handleKeyDown}
      role={canFlip ? 'button' : undefined}
      tabIndex={canFlip ? 0 : undefined}
      aria-pressed={canFlip ? isFlipped : undefined}
    >
      <div className="sentenceHeader">
        <div className="sentenceStatus">
          <span className="statusDot" />
          <strong>{status}</strong>
        </div>
        <div className="sentenceHeaderActions">
          <span className="sentenceProgress">{progress}</span>
          {showAudioButton ? (
            <button
              type="button"
              className="sentenceAudioPlayButton"
              disabled={audioButtonDisabled}
              onClick={handleAudioButtonClick}
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
      </div>

      <div className="sentenceBody">
        <div className="sentenceFlipScene">
          <div className={`sentenceFlipInner${isFlipped ? ' isFlipped' : ''}`}>
            <div className="sentenceFace sentenceFaceFront">
              <p className="sentenceText" dir={frontDir ?? dir} lang={(frontDir ?? dir) === 'rtl' ? 'ar' : 'ko'}>
                {resolvedFrontText}
              </p>
            </div>
            <div className="sentenceFace sentenceFaceBack">
              <p className="sentenceText" dir={backDir ?? dir} lang={(backDir ?? dir) === 'rtl' ? 'ar' : 'ko'}>
                {resolvedBackText}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sentenceBottomBar">
        <span>터치/클릭 또는</span>
        <kbd>Space</kbd>
        <span>로 뒤집기</span>
      </div>
    </article>
  )
}

export default SentenceBox
