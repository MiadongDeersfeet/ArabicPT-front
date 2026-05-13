/** 문장 카드 초안 — 새 세트 만들기·기존 세트에 추가 공통 */

export const FRONT_LANG = 'ko'
export const BACK_LANG = 'ar'

export function makeCardId() {
  return `card-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

export function emptyCard() {
  return { id: makeCardId(), frontText: '', backText: '', memo: '', memoOpen: false }
}

/**
 * 세트 제목 없이 카드만 검증 (새 세트 만들기 / 기존 세트에 문장 추가 공통)
 * @returns {{ ok: true, validCards: { front: string, back: string, memo: string }[] } | { ok: false, message: string }}
 */
/**
 * @param {{ frontText: string, backText: string, memo?: string }[]} cards
 * @param {{ allowEmptySet?: boolean }} [opts] — true면 전부 비어 있어도 ok (편집 페이지에서 문장 전부 삭제 허용)
 */
export function validateSentenceCards(cards, opts = {}) {
  const { allowEmptySet = false } = opts
  const partialLines = []
  const valid = []

  cards.forEach((card, index) => {
    const front = card.frontText.trim()
    const back = card.backText.trim()
    const empty = !front && !back
    if (empty) return
    if (!front || !back) {
      partialLines.push(index + 1)
    } else {
      valid.push({ front, back, memo: (card.memo ?? '').trim() })
    }
  })

  if (partialLines.length > 0) {
    return {
      ok: false,
      message: `카드 ${partialLines.join(', ')}번: 앞면과 뒷면 문장을 모두 입력해 주세요.`,
    }
  }

  if (valid.length === 0 && !allowEmptySet) {
    return {
      ok: false,
      message: '앞면과 뒷면이 모두 입력된 문장 카드를 최소 1개 추가해 주세요.',
    }
  }

  return { ok: true, validCards: valid }
}
