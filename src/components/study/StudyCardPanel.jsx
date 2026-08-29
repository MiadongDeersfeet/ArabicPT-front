import SentenceBox from '../ui/SentenceBox.jsx'
import StudyMarkBar from '../ui/StudyMarkBar.jsx'
import StudyProgress from './StudyProgress.jsx'
import StudyCompletion from './StudyCompletion.jsx'
import StudyCountdownLive from './StudyCountdownLive.jsx'

/**
 * Card study presentation — session/mark/countdown/TTS ownership은 SentenceStudy(부모)
 */
function StudyCardPanel({
  progress,
  countdown,
  session,
  card,
  onWeakChange,
  onFlip,
  onPlayAudio,
  onMarkKnown,
  onMarkUnknown,
  onRestartWeak,
  onRestartAll,
}) {
  const {
    current,
    total,
    knownCount,
    unknownCount,
    weakOnlyActive,
    weakOnlyDisabled,
    progressCompact,
    pulseStat,
  } = progress

  const { showLive, secondsLeft, totalSeconds } = countdown

  const {
    completed,
    completionTotal,
    completionKnown,
    completionUnknown,
    remainingUnknownCount,
    setId,
  } = session

  const {
    loading,
    error,
    sentencesEmpty,
    weakQueueEmpty,
    hasSentence,
    frontText,
    backText,
    frontDir,
    backDir,
    isFlipped,
    hasAudio,
    cardMotion,
    showMarkBar,
    markBarDisabled,
  } = card

  const renderCardBody = () => {
    if (loading) {
      return (
        <SentenceBox
          className="studySentenceBox"
          title="문장 학습 카드"
          hideStatus
          hideProgress
          hintVariant="compact"
          audioPlacement="overlay"
          text="문장을 불러오는 중입니다."
        />
      )
    }
    if (error) {
      return (
        <SentenceBox
          className="studySentenceBox"
          title="문장 학습 카드"
          hideStatus
          hideProgress
          hintVariant="compact"
          audioPlacement="overlay"
          text="문장을 불러오지 못했습니다."
        />
      )
    }
    if (sentencesEmpty) {
      return (
        <SentenceBox
          className="studySentenceBox"
          title="문장 학습 카드"
          hideStatus
          hideProgress
          hintVariant="compact"
          audioPlacement="overlay"
          text="아직 등록된 문장이 없습니다."
        />
      )
    }
    if (weakQueueEmpty) {
      return (
        <div className="studyWeakEmptyWrap">
          <SentenceBox
            className="studySentenceBox"
            title="문장 학습 카드"
            hideStatus
            hideProgress
            hintVariant="compact"
            audioPlacement="overlay"
            text="모름(×)으로 표시된 카드가 없습니다. 전체 학습으로 돌아가 주세요."
          />
          <button type="button" className="headerGhostButton studyWeakEmptyBackBtn" onClick={onRestartAll}>
            전체 다시 학습
          </button>
        </div>
      )
    }
    if (!hasSentence) return null

    return (
      <SentenceBox
        className="studySentenceBox"
        title="문장 학습 카드"
        hideStatus
        hideProgress
        hintVariant="compact"
        audioPlacement="overlay"
        frontText={frontText}
        backText={backText}
        frontDir={frontDir}
        backDir={backDir}
        isFlipped={isFlipped}
        onFlip={onFlip}
        showAudioButton={hasAudio}
        onAudioPlay={onPlayAudio}
      />
    )
  }

  return (
    <div className="studyWorkspace">
      <StudyProgress
        current={current}
        total={total}
        known={knownCount}
        unknown={unknownCount}
        weakOnly={weakOnlyActive}
        onWeakOnlyChange={onWeakChange}
        weakOnlyDisabled={weakOnlyDisabled}
        compact={progressCompact}
        pulseStat={pulseStat}
      />

      {completed ? (
        <StudyCompletion
          total={completionTotal}
          knownCount={completionKnown}
          unknownCount={completionUnknown}
          remainingUnknownCount={remainingUnknownCount}
          onRestartWeak={onRestartWeak}
          onRestartAll={onRestartAll}
          setId={setId}
        />
      ) : (
        <>
          <div
            className={[
              'studyCardStage',
              cardMotion === 'exit' ? 'isExiting' : '',
              cardMotion === 'enter' ? 'isEntering' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="studyCountdownLiveAnchor">
              {showLive ? (
                <StudyCountdownLive secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
              ) : null}
            </div>
            {renderCardBody()}
          </div>
          {showMarkBar ? (
            <StudyMarkBar
              variant="actions"
              disabled={markBarDisabled}
              onWrong={onMarkUnknown}
              onCorrect={onMarkKnown}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

export default StudyCardPanel
