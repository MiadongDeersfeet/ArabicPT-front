import { Link } from 'react-router-dom'

function CompletionMark({ allKnown }) {
  return (
    <div
      className={`studyCompletionMark${allKnown ? ' studyCompletionMark--allKnown' : ''}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
        <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M15.5 24.5l5.5 5.5 11.5-12"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/**
 * Card session 완료 상태 — 시각/CTA만. 세션 로직은 부모가 소유.
 */
function StudyCompletion({
  total,
  knownCount,
  unknownCount,
  remainingUnknownCount,
  onRestartWeak,
  onRestartAll,
  setId,
}) {
  const allKnown = remainingUnknownCount === 0
  const sessionTotal = Math.max(0, total)

  return (
    <div className="studyCompletion" role="status" aria-live="polite">
      <div className="studyCompletionCard">
        <CompletionMark allKnown={allKnown} />
        <h2 className="studyCompletionTitle">학습 완료</h2>
        <p className="studyCompletionSummary">
          이번 세션에서 {sessionTotal}문장을 확인했습니다.
        </p>

        <div className="studyCompletionStats" aria-label="세션 결과">
          <div className="studyCompletionStat studyCompletionStat--known">
            <span className="studyCompletionStatLabel">
              <span aria-hidden="true">✓</span> 알고 있음
            </span>
            <span className="studyCompletionStatValue">{knownCount}</span>
          </div>
          <div className="studyCompletionStat studyCompletionStat--unknown">
            <span className="studyCompletionStatLabel">
              <span aria-hidden="true">×</span> 모름
            </span>
            <span className="studyCompletionStatValue">{unknownCount}</span>
          </div>
        </div>

        <div className="studyCompletionActions">
          {remainingUnknownCount > 0 ? (
            <button type="button" className="studyCompletionPrimary" onClick={onRestartWeak}>
              모르는 {remainingUnknownCount}문장 다시 학습
            </button>
          ) : null}
          <button type="button" className="studyCompletionSecondary" onClick={onRestartAll}>
            전체 다시 학습
          </button>
          <Link to={`/library/sets/${setId}`} className="studyCompletionTertiary">
            문장 세트로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudyCompletion
