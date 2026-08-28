import { resumeCountdownAudio } from './countdownAudio.js'
import { unlockSentenceMediaAudio } from './sentenceMediaAudio.js'

/**
 * 카운트다운 ON / pointerdown 등 user gesture에서 호출.
 * Web Audio(틱) + HTMLAudio(TTS)를 함께 unlock한다.
 */
export async function unlockStudyAudio() {
  await Promise.all([resumeCountdownAudio(), unlockSentenceMediaAudio()])
}
