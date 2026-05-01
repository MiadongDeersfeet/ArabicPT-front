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

  return (
    <article
      className={`sentenceBox${canFlip ? ' canFlip' : ''}${isFlipped ? ' isFlipped' : ''}`}
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
        <span className="sentenceProgress">{progress}</span>
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
