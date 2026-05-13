/** 학습·세트 상세 미리보기에서 카드 앞/뒤 면(언어·방향) 계산 공통 */

export const CARD_SIDE_ORDER_STORAGE_KEY = 'arabicpt.sentenceStudy.cardSideOrder'

export function readCardSideReversed() {
  try {
    return localStorage.getItem(CARD_SIDE_ORDER_STORAGE_KEY) === 'reversed'
  } catch {
    return false
  }
}

export function persistCardSideReversed(reversed) {
  try {
    localStorage.setItem(CARD_SIDE_ORDER_STORAGE_KEY, reversed ? 'reversed' : 'default')
  } catch {
    /* ignore */
  }
}

export function resolveCardSides(sentence, reversed) {
  if (!sentence) {
    return { frontText: '', backText: '', frontDir: 'ltr', backDir: 'ltr' }
  }
  const isRtl = (lang) => typeof lang === 'string' && lang.toLowerCase().includes('ar')

  const apiFront = {
    text: sentence.frontText,
    dir: isRtl(sentence.frontLang) ? 'rtl' : 'ltr',
  }
  const apiBack = {
    text: sentence.backText,
    dir: isRtl(sentence.backLang) ? 'rtl' : 'ltr',
  }
  if (!reversed) {
    return {
      frontText: apiFront.text,
      backText: apiBack.text,
      frontDir: apiFront.dir,
      backDir: apiBack.dir,
    }
  }
  return {
    frontText: apiBack.text,
    backText: apiFront.text,
    frontDir: apiBack.dir,
    backDir: apiFront.dir,
  }
}
