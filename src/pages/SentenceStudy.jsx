import { useCallback, useEffect, useRef, useState } from 'react'
import SentenceBox from '../components/ui/SentenceBox.jsx'
import { sentenceDummyData } from '../data/sentences/sentenceDummyData.js'
import { playCountdownTick, resumeCountdownAudio } from '../utils/countdownAudio.js'

const AUTO_FLIP_SECONDS = 10
const MIN_COUNTDOWN_SECONDS = 5
const MAX_COUNTDOWN_SECONDS = 20
const LONG_PRESS_DELAY_MS = 350
const LONG_PRESS_INTERVAL_MS = 170
const LONG_PRESS_STEP_SECONDS = 5

const clampCountdownSeconds = (value) => {
  if (!Number.isFinite(value)) return AUTO_FLIP_SECONDS
  return Math.min(MAX_COUNTDOWN_SECONDS, Math.max(MIN_COUNTDOWN_SECONDS, value))
}

function SentenceStudy() {
  const holdTimeoutRef = useRef(null)
  const holdIntervalRef = useRef(null)
  const didLongPressRef = useRef(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [countdownEnabled, setCountdownEnabled] = useState(true)
  const [countdownSeconds, setCountdownSeconds] = useState(AUTO_FLIP_SECONDS)
  const [allowCountdown, setAllowCountdown] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(AUTO_FLIP_SECONDS)
  const current = sentenceDummyData[currentIndex]
  const isCountdownRunning = countdownEnabled && !isFlipped && allowCountdown

  useEffect(() => {
    setAllowCountdown(true)
  }, [currentIndex])

  useEffect(() => {
    setSecondsLeft(countdownSeconds)
  }, [countdownSeconds, currentIndex])

  useEffect(() => {
    const unlock = () => {
      resumeCountdownAudio()
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  const goPrev = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === 0 ? sentenceDummyData.length - 1 : prev - 1))
  }

  const goNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === sentenceDummyData.length - 1 ? 0 : prev + 1))
  }

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => {
      if (prev) {
        setAllowCountdown(false)
      }
      return !prev
    })
  }, [])

  const handleCountdownToggle = (event) => {
    const enabled = event.target.checked
    setCountdownEnabled(enabled)
    if (!enabled) {
      setSecondsLeft(countdownSeconds)
    }
  }

  const handleCountdownSecondsChange = (event) => {
    const value = Number.parseInt(event.target.value, 10)
    const nextSeconds = clampCountdownSeconds(value)
    setCountdownSeconds(nextSeconds)
    if (!isFlipped) {
      setSecondsLeft(nextSeconds)
    }
  }

  const adjustCountdownSeconds = (delta) => {
    if (!countdownEnabled) return
    if (isCountdownRunning) return
    setCountdownSeconds((prev) => {
      const next = clampCountdownSeconds(prev + delta)
      if (!isFlipped) {
        setSecondsLeft(next)
      }
      return next
    })
  }

  const stopLongPressAdjust = useCallback(() => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
  }, [])

  const startLongPressAdjust = useCallback(
    (delta, event) => {
      if (!countdownEnabled) return
      if (event.pointerType === 'mouse' && event.button !== 0) return

      didLongPressRef.current = false
      stopLongPressAdjust()
      holdTimeoutRef.current = window.setTimeout(() => {
        didLongPressRef.current = true
        adjustCountdownSeconds(delta * LONG_PRESS_STEP_SECONDS)
        holdIntervalRef.current = window.setInterval(() => {
          adjustCountdownSeconds(delta * LONG_PRESS_STEP_SECONDS)
        }, LONG_PRESS_INTERVAL_MS)
      }, LONG_PRESS_DELAY_MS)
    },
    [countdownEnabled, stopLongPressAdjust],
  )

  const handleStepButtonClick = (delta) => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false
      return
    }
    adjustCountdownSeconds(delta)
  }

  useEffect(() => {
    return () => {
      stopLongPressAdjust()
    }
  }, [stopLongPressAdjust])

  useEffect(() => {
    if (isFlipped) return
    if (!countdownEnabled) return
    if (!allowCountdown) return

    setSecondsLeft(countdownSeconds)
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playCountdownTick(0)
          setIsFlipped(true)
          return 0
        }
        const next = s - 1
        playCountdownTick(next)
        return next
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [currentIndex, isFlipped, allowCountdown, countdownEnabled, countdownSeconds])

  useEffect(() => {
    const handleSpaceFlip = (event) => {
      const targetTag = event.target?.tagName?.toLowerCase()
      const isEditable =
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        targetTag === 'select' ||
        event.target?.isContentEditable

      if (isEditable) return

      if (event.code === 'Space') {
        event.preventDefault()
        flipCard()
      }
    }

    window.addEventListener('keydown', handleSpaceFlip)
    return () => window.removeEventListener('keydown', handleSpaceFlip)
  }, [flipCard])

  return (
    <section className="container">
      <div className="studyPageIntro">
        <div>
          <h2>문장 학습</h2>
          <p>
            {currentIndex + 1} / {sentenceDummyData.length} 문장
          </p>
        </div>
        <div className="countdownControlPanel">
          <label className="countToggle" aria-label="Count ON/OFF">
            <span className="countToggleLabel">Count</span>
            <input type="checkbox" checked={countdownEnabled} onChange={handleCountdownToggle} />
            <span className="countToggleTrack" aria-hidden="true">
              <span className="countToggleThumb" />
              <span className="countToggleState">{countdownEnabled ? 'ON' : 'OFF'}</span>
            </span>
          </label>
          {countdownEnabled ? (
            <div className="countStepper" aria-label="카운트다운 시간 설정">
              <button
                type="button"
                className="countStepperButton"
                onClick={() => handleStepButtonClick(-1)}
                onPointerDown={(event) => startLongPressAdjust(-1, event)}
                onPointerUp={stopLongPressAdjust}
                onPointerLeave={stopLongPressAdjust}
                onPointerCancel={stopLongPressAdjust}
                disabled={isCountdownRunning || countdownSeconds <= MIN_COUNTDOWN_SECONDS}
                aria-label="카운트다운 시간 1초 감소"
              >
                -
              </button>
              <input
                type="number"
                min={MIN_COUNTDOWN_SECONDS}
                max={MAX_COUNTDOWN_SECONDS}
                className="countStepperValue"
                value={countdownSeconds}
                onChange={handleCountdownSecondsChange}
                aria-label="카운트다운 시간(초)"
              />
              <button
                type="button"
                className="countStepperButton"
                onClick={() => handleStepButtonClick(1)}
                onPointerDown={(event) => startLongPressAdjust(1, event)}
                onPointerUp={stopLongPressAdjust}
                onPointerLeave={stopLongPressAdjust}
                onPointerCancel={stopLongPressAdjust}
                disabled={isCountdownRunning || countdownSeconds >= MAX_COUNTDOWN_SECONDS}
                aria-label="카운트다운 시간 1초 증가"
              >
                +
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {countdownEnabled ? (
        <div className="studyCountdown" aria-live="polite">
          {isFlipped ? (
            <p className="studyCountdownHint">한국어를 다시 보려면 카드를 뒤집으세요.</p>
          ) : allowCountdown ? (
            <div className="studyCountdownInner">
              <span className="studyCountdownValue">{secondsLeft}</span>
              <span className="studyCountdownUnit">초</span>
            </div>
          ) : (
            <p className="studyCountdownHint">아랍어를 다시 보려면 카드를 뒤집으세요.</p>
          )}
        </div>
      ) : null}

      <SentenceBox
        title="문장 학습 카드"
        status="학습 중"
        progress={`문장 ${currentIndex + 1}`}
        frontText={current.korean}
        backText={current.arabic}
        frontDir="ltr"
        backDir="rtl"
        isFlipped={isFlipped}
        onFlip={flipCard}
      />

      <div className="studyActionRow">
        <button type="button" className="headerGhostButton" onClick={goPrev}>
          이전 문장
        </button>
        <button type="button" className="headerPrimaryButton" onClick={goNext}>
          다음 문장
        </button>
      </div>
    </section>
  )
}

export default SentenceStudy
