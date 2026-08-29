/**
 * Learn landing catalog motifs — larger abstract visual accents.
 * Separate from CategoryMotif (detail page) to avoid wrong shared styling.
 */
function LearnCatalogMotif({ type }) {
  if (type === 'grammar') {
    return (
      <svg className="learnCatMotif" viewBox="0 0 96 72" aria-hidden="true">
        <path
          d="M8 18h36M20 32h48M8 46h42"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M58 22h22M70 22v20M62 42h22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.55"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (type === 'conversation') {
    return (
      <svg className="learnCatMotif" viewBox="0 0 96 72" aria-hidden="true">
        <rect
          x="6"
          y="10"
          width="42"
          height="28"
          rx="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="36"
          y="28"
          width="48"
          height="30"
          rx="14"
          fill="currentColor"
          opacity="0.1"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="22" cy="24" r="1.8" fill="currentColor" opacity="0.45" />
        <circle cx="30" cy="24" r="1.8" fill="currentColor" opacity="0.45" />
        <circle cx="38" cy="24" r="1.8" fill="currentColor" opacity="0.35" />
      </svg>
    )
  }

  if (type === 'vocabulary') {
    return (
      <svg className="learnCatMotif" viewBox="0 0 96 72" aria-hidden="true">
        <text
          x="8"
          y="34"
          fontSize="26"
          fontWeight="700"
          fill="currentColor"
          opacity="0.9"
        >
          كلمة
        </text>
        <text
          x="14"
          y="58"
          fontSize="14"
          fontWeight="600"
          fill="currentColor"
          opacity="0.5"
          letterSpacing="0.08em"
        >
          단어
        </text>
        <path
          d="M70 18v40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
        />
      </svg>
    )
  }

  return (
    <svg className="learnCatMotif" viewBox="0 0 96 72" aria-hidden="true">
      <path
        d="M10 16h52M10 28h40M10 40h48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M68 22c6 3.5 10 8 10 14s-4 10.5-10 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M78 26c4 2.5 6.5 5.5 6.5 10s-2.5 7.5-6.5 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}

export default LearnCatalogMotif
