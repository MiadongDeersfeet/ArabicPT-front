import { useCallback, useEffect, useRef } from 'react'

export function useLongPressAdjust({
  enabled,
  longPressDelayMs,
  longPressIntervalMs,
  longPressStep,
  onAdjust,
}) {
  const holdTimeoutRef = useRef(null)
  const holdIntervalRef = useRef(null)
  const didLongPressRef = useRef(false)

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
      if (!enabled) return
      if (event.pointerType === 'mouse' && event.button !== 0) return

      didLongPressRef.current = false
      stopLongPressAdjust()
      holdTimeoutRef.current = window.setTimeout(() => {
        // 길게 누르는 동안 step 단위로 반복 증감합니다.
        didLongPressRef.current = true
        onAdjust(delta * longPressStep)
        holdIntervalRef.current = window.setInterval(() => {
          onAdjust(delta * longPressStep)
        }, longPressIntervalMs)
      }, longPressDelayMs)
    },
    [enabled, longPressDelayMs, longPressIntervalMs, longPressStep, onAdjust, stopLongPressAdjust],
  )

  const handleStepButtonClick = useCallback(
    (delta) => {
      if (didLongPressRef.current) {
        // 롱프레스 직후 click 1회가 추가로 들어오는 것을 막습니다.
        didLongPressRef.current = false
        return
      }
      onAdjust(delta)
    },
    [onAdjust],
  )

  useEffect(() => {
    return () => {
      stopLongPressAdjust()
    }
  }, [stopLongPressAdjust])

  return {
    startLongPressAdjust,
    stopLongPressAdjust,
    handleStepButtonClick,
  }
}
