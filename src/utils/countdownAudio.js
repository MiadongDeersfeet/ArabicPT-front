let audioContext = null

function getContext() {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioContext = new Ctx()
  }
  return audioContext
}

export function resumeCountdownAudio() {
  const ctx = getContext()
  if (ctx?.state === 'suspended') {
    return ctx.resume()
  }
  return Promise.resolve()
}

function beep({ frequency, duration = 0.07, volume = 0.07 }) {
  const ctx = getContext()
  if (!ctx) return
  const t0 = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequency, t0)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0008, t0 + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration)
}

/**
 * @param {number} secondsAfterTick - 화면에 곧 보일 남은 초 (9…0). 0이면 곧 자동 뒤집기.
 */
export function playCountdownTick(secondsAfterTick) {
  try {
    if (secondsAfterTick === 0) {
      beep({ frequency: 1046, duration: 0.13, volume: 0.09 })
    } else if (secondsAfterTick <= 3) {
      beep({ frequency: 880, duration: 0.06, volume: 0.06 })
    } else {
      beep({ frequency: 740, duration: 0.05, volume: 0.045 })
    }
  } catch {
    /* 오디오 미지원·일시 정지 등은 무시 */
  }
}
