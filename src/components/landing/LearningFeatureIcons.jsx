/**
 * 랜딩 특징 카드용 장식 아이콘.
 * 프로젝트의 기존 인라인 SVG 방식(currentColor 스트로크 + aria-hidden)을 따른다.
 * 색은 카드 CSS의 color / var(--color-accent) 토큰에서 받는다.
 */
const BASE_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

/** 펼쳐진 책 — 문법 기초 학습 */
export function OpenBookIcon() {
  return (
    <svg {...BASE_PROPS}>
      <path d="M12 6.6C10.2 5.3 8 4.7 5.5 4.6a1 1 0 0 0-1 1v10.9a1 1 0 0 0 1 1c2.5.1 4.7.7 6.5 2 1.8-1.3 4-1.9 6.5-2a1 1 0 0 0 1-1V5.6a1 1 0 0 0-1-1c-2.5.1-4.7.7-6.5 2Z" />
      <path d="M12 6.6v12.9" />
    </svg>
  )
}

/** 말풍선 2개 — 실생활 회화 */
export function ChatBubblesIcon() {
  return (
    <svg {...BASE_PROPS}>
      <rect x="3" y="4.4" width="12" height="8.4" rx="2.4" />
      <path d="M6.8 12.8v3.1l3.2-3.1" />
      <rect x="11.4" y="9.6" width="9.6" height="7.2" rx="2.2" fill="var(--color-accent-soft)" />
      <path d="M17.6 16.8v2.6L14.9 16.8" />
    </svg>
  )
}

/** 별이 붙은 단어 카드 상자 — 단어 저장 */
export function WordBoxIcon() {
  return (
    <svg {...BASE_PROPS}>
      <path d="M4.4 8.8h15.2v9.1a1.6 1.6 0 0 1-1.6 1.6H6a1.6 1.6 0 0 1-1.6-1.6V8.8Z" />
      <rect x="3.2" y="5" width="17.6" height="3.8" rx="1.2" />
      <path
        d="M12 11.3l1.1 2.2 2.4.35-1.75 1.7.41 2.4L12 16.83l-2.16 1.12.41-2.4-1.75-1.7 2.4-.35L12 11.3Z"
        fill="var(--color-accent)"
        stroke="none"
      />
    </svg>
  )
}

/** 메모지와 연필 — 문장 저장·복습 */
export function NotePencilIcon() {
  return (
    <svg {...BASE_PROPS}>
      <path d="M16.6 13.2V19a1.4 1.4 0 0 1-1.4 1.4H5.9A1.4 1.4 0 0 1 4.5 19V5.6a1.4 1.4 0 0 1 1.4-1.4h9.3a1.4 1.4 0 0 1 1.4 1.4v1.5" />
      <path d="M7.8 9h5.4M7.8 12.4h5.4M7.8 15.8h3.2" />
      <path
        d="M18.4 8.2l2.1 2.1-5.2 5.2-2.6.5.5-2.6 5.2-5.2Z"
        fill="var(--color-accent-soft)"
      />
    </svg>
  )
}
