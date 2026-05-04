import { useCallback, useEffect, useMemo, useState } from 'react'
import { playCountdownTick } from '../utils/countdownAudio.js'

export function useSentenceCountdown({
  isFlipped,
  currentIndex,
  defaultSeconds,
  minSeconds,
  maxSeconds,
  onAutoFlip,
}) {
  const clampCountdownSeconds = useCallback(
    (value) => {
      if (!Number.isFinite(value)) return defaultSeconds
      return Math.min(maxSeconds, Math.max(minSeconds, value))
    },
    [defaultSeconds, maxSeconds, minSeconds],
  )

  const [countdownEnabled, setCountdownEnabled] = useState(true)
  const [countdownSeconds, setCountdownSeconds] = useState(defaultSeconds)
  const [allowCountdown, setAllowCountdown] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds)

  const isCountdownRunning = useMemo(
    () => countdownEnabled && !isFlipped && allowCountdown,
    [countdownEnabled, isFlipped, allowCountdown],
  )

  useEffect(() => {
    // 문장이 바뀌면 자동 카운트다운을 다시 허용합니다.
    setAllowCountdown(true)
  }, [currentIndex])

  useEffect(() => {
    // 카운트다운 기본값이 바뀌면 표시 시간도 함께 맞춥니다.
    setSecondsLeft(countdownSeconds)
  }, [countdownSeconds, currentIndex])

  const handleCountdownToggle = useCallback(
    (event) => {
      const enabled = event.target.checked
      setCountdownEnabled(enabled)
      if (!enabled) {
        setSecondsLeft(countdownSeconds)
      }
    },
    [countdownSeconds],
  )

  const handleCountdownSecondsChange = useCallback(
    (event) => {
      const value = Number.parseInt(event.target.value, 10)
      const nextSeconds = clampCountdownSeconds(value)
      setCountdownSeconds(nextSeconds)
      if (!isFlipped) {
        setSecondsLeft(nextSeconds)
      }
    },
    [clampCountdownSeconds, isFlipped],
  )

  const adjustCountdownSeconds = useCallback(
    (delta) => {
      if (!countdownEnabled) return
      if (isCountdownRunning) return
      setCountdownSeconds((prev) => {
        const next = clampCountdownSeconds(prev + delta)
        if (!isFlipped) {
          setSecondsLeft(next)
        }
        return next
      })
    },
    [clampCountdownSeconds, countdownEnabled, isCountdownRunning, isFlipped],
  )

  useEffect(() => {
    if (isFlipped) return
    if (!countdownEnabled) return
    if (!allowCountdown) return

    setSecondsLeft(countdownSeconds)
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playCountdownTick(0)
          onAutoFlip()
          return 0
        }
        const next = s - 1
        playCountdownTick(next)
        return next
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [countdownEnabled, countdownSeconds, allowCountdown, currentIndex, isFlipped, onAutoFlip])

  return {
    countdownEnabled,
    countdownSeconds,
    secondsLeft,
    allowCountdown,
    isCountdownRunning,
    setAllowCountdown,
    handleCountdownToggle,
    handleCountdownSecondsChange,
    adjustCountdownSeconds,
  }
}
