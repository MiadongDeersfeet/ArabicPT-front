/** 문단 Ebook 초안 — 새 세트 만들기·기존 세트에 추가 공통 */

export const FRONT_LANG = 'ko-KR'
export const BACK_LANG = 'ar-SA'

export function makeParagraphId() {
  return `para-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

export function emptyParagraph() {
  return { id: makeParagraphId(), frontText: '', backText: '', memo: '', memoOpen: false }
}

/**
 * @param {{ frontText: string, backText: string, memo?: string }[]} paragraphs
 * @param {{ allowEmptySet?: boolean }} [opts]
 */
export function validateParagraphBlocks(paragraphs, opts = {}) {
  const { allowEmptySet = false } = opts
  const partialLines = []
  const valid = []

  paragraphs.forEach((block, index) => {
    const front = block.frontText.trim()
    const back = block.backText.trim()
    const empty = !front && !back
    if (empty) return
    if (!front || !back) {
      partialLines.push(index + 1)
    } else {
      valid.push({ front, back, memo: (block.memo ?? '').trim() })
    }
  })

  if (partialLines.length > 0) {
    return {
      ok: false,
      message: `페이지 ${partialLines.join(', ')}번: 한국어 문단과 아랍어 문단을 모두 입력해 주세요.`,
    }
  }

  if (valid.length === 0 && !allowEmptySet) {
    return {
      ok: false,
      message: '한국어·아랍어 문단이 모두 입력된 페이지를 최소 1개 추가해 주세요.',
    }
  }

  return { ok: true, validParagraphs: valid }
}

export function previewText(text, maxLen = 120) {
  if (text == null) return ''
  const t = String(text).trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen)}…`
}
