/**
 * Library list date — YYYY.MM.DD only (no time-of-day).
 * Prefers updatedAt; falls back to createdAt.
 */
export function formatLibraryDate(value) {
  if (value == null || value === '') return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function formatLibraryUpdatedLabel(item) {
  const raw = item?.updatedAt ?? item?.createdAt
  const formatted = formatLibraryDate(raw)
  if (!formatted) return null
  return `${formatted} 수정`
}

export function normalizeSearchText(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase()
}

export function matchesLibrarySearch(item, query, fields) {
  const q = normalizeSearchText(query)
  if (!q) return true
  return fields.some((key) => normalizeSearchText(item?.[key]).includes(q))
}

export function getSortTimestamp(item) {
  const raw = item?.updatedAt ?? item?.createdAt
  if (raw == null || raw === '') return 0
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? 0 : t
}

/**
 * @param {'updatedDesc'|'updatedAsc'|'nameAsc'} sortValue
 */
export function sortLibraryItems(items, sortValue, nameKey = 'setName') {
  const next = [...items]
  if (sortValue === 'nameAsc') {
    next.sort((a, b) =>
      String(a?.[nameKey] ?? '').localeCompare(String(b?.[nameKey] ?? ''), 'ko'),
    )
    return next
  }
  if (sortValue === 'updatedAsc') {
    next.sort((a, b) => getSortTimestamp(a) - getSortTimestamp(b))
    return next
  }
  // updatedDesc (default)
  next.sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a))
  return next
}

export const LIBRARY_SORT_OPTIONS = [
  { value: 'updatedDesc', label: '최근 수정순' },
  { value: 'updatedAsc', label: '오래된 수정순' },
  { value: 'nameAsc', label: '이름순' },
]

/** folder filter: '' = all, '__none__' = no folder, else folderId string */
export function matchesFolderFilter(item, folderFilter) {
  if (folderFilter === '' || folderFilter == null) return true
  if (folderFilter === '__none__') {
    return item?.folderId == null || item?.folderId === ''
  }
  return String(item?.folderId) === String(folderFilter)
}
