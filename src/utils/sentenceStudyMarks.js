/** 세트별 문장 학습 O/X 표시 — 로컬(localStorage)만 사용 */

export function marksStorageKey(setId) {
  return `arabicpt.sentenceStudy.marks.v1.${setId}`
}

export function weakOnlyStorageKey(setId) {
  return `arabicpt.sentenceStudy.weakOnly.${setId}`
}

export function loadMarks(setId) {
  try {
    const raw = localStorage.getItem(marksStorageKey(setId))
    if (!raw) return {}
    const o = JSON.parse(raw)
    if (o && typeof o === 'object' && !Array.isArray(o)) return o
  } catch {
    /* ignore */
  }
  return {}
}

export function pruneMarks(marks, validSentenceIds) {
  const allowed = new Set(validSentenceIds.map((id) => String(id)))
  const next = {}
  for (const [k, v] of Object.entries(marks)) {
    if (!allowed.has(String(k))) continue
    if (v === 'unknown' || v === 'known') next[String(k)] = v
  }
  return next
}

export function persistMarks(setId, marks) {
  try {
    localStorage.setItem(marksStorageKey(setId), JSON.stringify(marks))
  } catch {
    /* ignore */
  }
}

export function loadWeakOnly(setId) {
  try {
    return localStorage.getItem(weakOnlyStorageKey(setId)) === '1'
  } catch {
    return false
  }
}

export function persistWeakOnly(setId, weakOnly) {
  try {
    localStorage.setItem(weakOnlyStorageKey(setId), weakOnly ? '1' : '0')
  } catch {
    /* ignore */
  }
}
