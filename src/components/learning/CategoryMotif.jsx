function CategoryMotif({ type }) {
  if (type === 'grammar') {
    return (
      <svg className="learnCatMotif" viewBox="0 0 64 40" aria-hidden="true">
        <path d="M6 10h40M6 20h28M6 30h34" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M48 14l8 6-8 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  if (type === 'conversation') {
    return (
      <svg className="learnCatMotif" viewBox="0 0 64 40" aria-hidden="true">
        <rect x="4" y="6" width="28" height="18" rx="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="24" y="16" width="32" height="18" rx="7" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  if (type === 'vocabulary') {
    return (
      <svg className="learnCatMotif" viewBox="0 0 64 40" aria-hidden="true">
        <text x="4" y="24" fontSize="16" fill="currentColor">
          كلمة
        </text>
        <text x="36" y="34" fontSize="11" fill="currentColor" opacity="0.55">
          단어
        </text>
      </svg>
    )
  }
  return (
    <svg className="learnCatMotif" viewBox="0 0 64 40" aria-hidden="true">
      <path d="M8 8h22v24H12a4 4 0 0 1-4-4V8Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M30 8h18v20a4 4 0 0 1-4 4H30" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M44 18c2.2 1.2 3.5 2.8 3.5 5s-1.3 3.8-3.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export default CategoryMotif
