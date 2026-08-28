/**
 * Live seconds — compact circular ring (표시만, countdown 로직 없음)
 */
function StudyCountdownLive({ secondsLeft, totalSeconds }) {
  const size = 40
  const stroke = 2.5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const safeTotal = Math.max(1, totalSeconds)
  const ratio = Math.max(0, Math.min(1, secondsLeft / safeTotal))
  const urgent = secondsLeft <= 3

  return (
    <div
      className={`studyCountdownLiveRing${urgent ? ' isUrgent' : ''}`}
      aria-hidden="true"
    >
      <svg
        className="studyCountdownLiveSvg"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
      >
        <circle
          className="studyCountdownLiveTrack"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="studyCountdownLiveProgress"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="studyCountdownLiveNum">{secondsLeft}</span>
    </div>
  )
}

export default StudyCountdownLive
