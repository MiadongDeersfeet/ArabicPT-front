import { Link } from 'react-router-dom'
import StudySettingsMenu from '../ui/StudySettingsMenu.jsx'
import StudyCountdownControl from './StudyCountdownControl.jsx'

/**
 * 학습 세션 전용 상단 바 — 뒤로가기 · 제목 · countdown · 설정
 * (공통 App Header가 아님)
 */
function StudySessionHeader({
  setIdNum,
  title = '문장 학습',
  cardSideReversed,
  onToggleCardSide,
  showCountdown = false,
  countdownEnabled,
  countdownSeconds,
  isCountdownRunning,
  minSeconds,
  maxSeconds,
  onCountdownToggle,
  onCountdownSecondsChange,
  onStepClick,
  onLongPressStart,
  onLongPressStop,
}) {
  return (
    <header className="studySessionHeader">
      <div className="studySessionHeaderInner">
        <Link
          to={`/library/sets/${setIdNum}`}
          className="studySessionBackLink"
          aria-label="문장 세트로 돌아가기"
        >
          ←
          <span className="studySessionBackLinkText">문장 세트로</span>
        </Link>
        <h1 className="studySessionTitle">{title}</h1>
        <div className="studySessionHeaderActions">
          {showCountdown ? (
            <StudyCountdownControl
              countdownEnabled={countdownEnabled}
              countdownSeconds={countdownSeconds}
              isCountdownRunning={isCountdownRunning}
              minSeconds={minSeconds}
              maxSeconds={maxSeconds}
              onToggle={onCountdownToggle}
              onSecondsChange={onCountdownSecondsChange}
              onStepClick={onStepClick}
              onLongPressStart={onLongPressStart}
              onLongPressStop={onLongPressStop}
            />
          ) : null}
          <StudySettingsMenu cardSideReversed={cardSideReversed} onToggleCardSide={onToggleCardSide} />
        </div>
      </div>
    </header>
  )
}

export default StudySessionHeader
