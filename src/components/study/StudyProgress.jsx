/**
 * Card mode 진행률 — 현재 위치 + thin emerald bar + 간결 통계
 */
function StudyProgress({
  current,
  total,
  known = 0,
  unknown = 0,
  weakOnly = false,
  onWeakOnlyChange,
  weakOnlyDisabled = false,
  /** 완료 시 known/unknown/weak 칩 숨김 — progress N/N만 */
  compact = false,
  /** UI pulse: 'known' | 'unknown' | null */
  pulseStat = null,
}) {
  const safeTotal = Math.max(0, total)
  const safeCurrent = safeTotal === 0 ? 0 : Math.min(Math.max(current, 1), safeTotal)
  const pct = safeTotal === 0 ? 0 : Math.round((safeCurrent / safeTotal) * 100)

  return (
    <div className={`studyProgress${compact ? ' studyProgress--compact' : ''}`}>
      <div className="studyProgressTop">
        <p className="studyProgressCount" aria-live="polite">
          <span className="studyProgressCountNum">{safeCurrent}</span>
          <span className="studyProgressCountSep">/</span>
          <span className="studyProgressCountTotal">{safeTotal}</span>
        </p>
        {!compact ? (
          <div className="studyProgressStats" role="status">
            <span
              className={`studyProgressStat studyProgressStat--known${pulseStat === 'known' ? ' isPulsing' : ''}`}
              title="알고 있음"
            >
              <span aria-hidden="true">✓</span>
              <span className="studyProgressStatNum">{known}</span>
            </span>
            <span
              className={`studyProgressStat studyProgressStat--unknown${pulseStat === 'unknown' ? ' isPulsing' : ''}`}
              title="모름"
            >
              <span aria-hidden="true">×</span>
              <span className="studyProgressStatNum">{unknown}</span>
            </span>
            {typeof onWeakOnlyChange === 'function' ? (
              <label className="studyWeakChip">
                <input
                  type="checkbox"
                  checked={weakOnly}
                  onChange={onWeakOnlyChange}
                  disabled={weakOnlyDisabled}
                />
                <span>모름만 복습</span>
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
      <div
        className="studyProgressTrack"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`학습 진행 ${safeCurrent} / ${safeTotal}`}
      >
        <div className="studyProgressFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default StudyProgress
