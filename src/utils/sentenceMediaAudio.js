/**
 * 모바일 PWA: HTMLMediaElement.play()는 user gesture로 unlock된
 * 동일 Audio 인스턴스를 재사용할 때 가장 안정적이다.
 */
let sharedSentenceAudio = null

function getSharedSentenceAudio() {
  if (typeof window === 'undefined') return null
  if (!sharedSentenceAudio) {
    sharedSentenceAudio = new Audio()
    sharedSentenceAudio.preload = 'auto'
  }
  return sharedSentenceAudio
}

/** 아주 짧은 무음 WAV — src 없이 play()가 거절되는 환경용 */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

/**
 * 제스처 스택 안에서 호출. 이후 타이머/effect에서의 play()가 허용되기 쉬워진다.
 */
export async function unlockSentenceMediaAudio() {
  const audio = getSharedSentenceAudio()
  if (!audio) return
  try {
    const prevSrc = audio.src
    const prevMuted = audio.muted
    audio.muted = true
    if (!audio.src) {
      audio.src = SILENT_WAV
    }
    await audio.play()
    audio.pause()
    audio.currentTime = 0
    audio.muted = prevMuted
    if (prevSrc && prevSrc !== SILENT_WAV) {
      audio.src = prevSrc
    } else if (!prevSrc || prevSrc === SILENT_WAV) {
      audio.removeAttribute('src')
      audio.load()
    }
  } catch {
    /* unlock 실패는 무시 — 이후 수동 재생은 여전히 가능 */
  }
}

/**
 * @param {string} url
 * @returns {Promise<HTMLAudioElement | null>}
 */
export async function playSentenceMediaAudio(url) {
  if (!url) return null
  const audio = getSharedSentenceAudio()
  if (!audio) return null

  try {
    if (audio.src !== url) {
      audio.src = url
    } else {
      audio.currentTime = 0
    }
    audio.muted = false
    await audio.play()
    return audio
  } catch (error) {
    console.error(error)
    return null
  }
}

export function pauseSentenceMediaAudio() {
  const audio = getSharedSentenceAudio()
  if (!audio) return
  try {
    audio.pause()
  } catch {
    /* ignore */
  }
}
