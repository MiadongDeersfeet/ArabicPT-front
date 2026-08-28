function AudioIcon() {
  return (
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
  )
}

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
  hideProgress = false,
  hideStatus = false,
  /** 'default' | 'compact' — Card mode uses compact hint */
  hintVariant = 'default',
  /**
   * 'header' — TTS in sentenceHeader (Library/UiKit)
   * 'overlay' — TTS absolute on card; header not used for TTS (Card study)
   */
  audioPlacement = 'header',
}) {
  const canFlip = typeof onFlip === 'function'
  const resolvedFrontText = frontText ?? text
  const resolvedBackText = backText ?? text
  const overlayAudio = audioPlacement === 'overlay'
  const showHeaderMeta =
    !hideStatus || !hideProgress || (showAudioButton && !overlayAudio)

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
    hintVariant === 'compact' ? 'sentenceBox--hintCompact' : '',
    overlayAudio ? 'sentenceBox--audioOverlay' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const audioButton = showAudioButton ? (
    <button
      type="button"
      className={`sentenceAudioPlayButton${overlayAudio ? ' sentenceAudioPlayButton--overlay' : ''}`}
      disabled={audioButtonDisabled}
      onClick={handleAudioButtonClick}
      aria-label="문장 오디오 재생"
    >
      <AudioIcon />
    </button>
  ) : null

  const renderFace = (side) => {
    const isFront = side === 'front'
    const content = isFront ? resolvedFrontText : resolvedBackText
    const textDir = (isFront ? frontDir : backDir) ?? dir
    return (
      <div className={`sentenceFace ${isFront ? 'sentenceFaceFront' : 'sentenceFaceBack'}`}>
        <div className="sentenceTextViewport">
          <div className="sentenceTextContent">
            <p className="sentenceText" dir={textDir} lang={textDir === 'rtl' ? 'ar' : 'ko'}>
              {content}
            </p>
          </div>
        </div>
      </div>
    )
  }

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
      {overlayAudio ? audioButton : null}

      {showHeaderMeta ? (
        <div className={`sentenceHeader${hideStatus && hideProgress ? ' sentenceHeader--audioOnly' : ''}`}>
          {!hideStatus ? (
            <div className="sentenceStatus">
              <span className="statusDot" />
              <strong>{status}</strong>
            </div>
          ) : (
            <span className="sentenceHeaderSpacer" aria-hidden="true" />
          )}
          <div className="sentenceHeaderActions">
            {!hideProgress ? <span className="sentenceProgress">{progress}</span> : null}
            {!overlayAudio ? audioButton : null}
          </div>
        </div>
      ) : null}

      <div className="sentenceBody">
        <div className="sentenceFlipScene">
          <div className={`sentenceFlipInner${isFlipped ? ' isFlipped' : ''}`}>
            {renderFace('front')}
            {renderFace('back')}
          </div>
        </div>
      </div>

      <div className="sentenceBottomBar">
        {hintVariant === 'compact' ? (
          <>
            <span className="sentenceBottomHintPrimary">
              {isFlipped ? '탭하여 앞면 보기' : '탭하여 정답 확인'}
            </span>
            <span className="sentenceBottomHintDesktop">
              <kbd>Space</kbd>
            </span>
          </>
        ) : (
          <>
            <span>터치/클릭 또는</span>
            <kbd>Space</kbd>
            <span>로 뒤집기</span>
          </>
        )}
      </div>
    </article>
  )
}

export default SentenceBox
