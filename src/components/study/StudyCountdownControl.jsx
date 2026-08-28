import { useEffect, useRef, useState } from 'react'

/**
 * Card mode countdown — compact trigger + popover (로직은 부모/훅에서 소유)
 */
function StudyCountdownControl({
  countdownEnabled,
  countdownSeconds,
  isCountdownRunning,
  minSeconds,
  maxSeconds,
  onToggle,
  onSecondsChange,
  onStepClick,
  onLongPressStart,
  onLongPressStop,
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (!wrapRef.current || wrapRef.current.contains(event.target)) return
      setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const ariaCurrent = countdownEnabled
    ? `카운트다운 설정, 현재 ${countdownSeconds}초`
    : '카운트다운 설정, 현재 자유 학습'

  return (
    <div className="studyCountdownCtrl" ref={wrapRef}>
      <button
        type="button"
        className={`studyCountdownTrigger${countdownEnabled ? ' isOn' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaCurrent}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="studyCountdownTriggerIcon" aria-hidden="true">
          ⏱
        </span>
        <span className="studyCountdownTriggerText">
          <span className="studyCountdownTriggerTextFull">
            {countdownEnabled ? `${countdownSeconds}초` : '자유 학습'}
          </span>
          <span className="studyCountdownTriggerTextShort" aria-hidden="true">
            {countdownEnabled ? `${countdownSeconds}초` : '자유'}
          </span>
        </span>
      </button>

      {open ? (
        <div className="studyCountdownPopover" role="dialog" aria-label="카운트다운 설정">
          <p className="studyCountdownPopoverTitle">카운트다운</p>

          <label className="countToggle studyCountdownPopoverToggle" aria-label="카운트다운 켜기/끄기">
            <span className="countToggleLabel">사용</span>
            <input type="checkbox" checked={countdownEnabled} onChange={onToggle} />
            <span className="countToggleTrack" aria-hidden="true">
              <span className="countToggleThumb" />
              <span className="countToggleState">{countdownEnabled ? 'ON' : 'OFF'}</span>
            </span>
          </label>

          {countdownEnabled ? (
            <div className="countStepper studyCountdownStepper" aria-label="카운트다운 시간 설정">
              <button
                type="button"
                className="countStepperButton"
                onClick={() => onStepClick(-1)}
                onPointerDown={(event) => onLongPressStart(-1, event)}
                onPointerUp={onLongPressStop}
                onPointerLeave={onLongPressStop}
                onPointerCancel={onLongPressStop}
                disabled={isCountdownRunning || countdownSeconds <= minSeconds}
                aria-label="카운트다운 시간 1초 감소"
              >
                −
              </button>
              <div className="studyCountdownStepperValueWrap">
                <input
                  type="number"
                  min={minSeconds}
                  max={maxSeconds}
                  className="countStepperValue"
                  value={countdownSeconds}
                  onChange={onSecondsChange}
                  aria-label="카운트다운 시간(초)"
                />
                <span className="studyCountdownStepperUnit" aria-hidden="true">
                  초
                </span>
              </div>
              <button
                type="button"
                className="countStepperButton"
                onClick={() => onStepClick(1)}
                onPointerDown={(event) => onLongPressStart(1, event)}
                onPointerUp={onLongPressStop}
                onPointerLeave={onLongPressStop}
                onPointerCancel={onLongPressStop}
                disabled={isCountdownRunning || countdownSeconds >= maxSeconds}
                aria-label="카운트다운 시간 1초 증가"
              >
                +
              </button>
            </div>
          ) : (
            <p className="studyCountdownPopoverHint">카드를 자유롭게 넘깁니다</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default StudyCountdownControl
