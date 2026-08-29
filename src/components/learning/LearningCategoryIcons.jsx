/**
 * Learning Hub / Learn shell 용 outline 아이콘.
 * Landing 대형 illustration과 분리한다. 색은 currentColor(부모)로만 받는다.
 */
const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function BookOpenIcon() {
  return (
    <svg {...BASE}>
      <path d="M12 7c-1.8-1.2-4-1.8-6.5-1.9a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1c2.5.1 4.7.7 6.5 1.9 1.8-1.2 4-1.8 6.5-1.9a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1C16 5.2 13.8 5.8 12 7Z" />
      <path d="M12 7v12" />
    </svg>
  )
}

export function MessagesIcon() {
  return (
    <svg {...BASE}>
      <path d="M7.5 15.5H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5" />
      <path d="M10 10h8a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-1.5L13 22.5 10.5 20.5H10a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

export function VocabCardsIcon() {
  return (
    <svg {...BASE}>
      <rect x="4" y="5" width="11" height="14" rx="1.5" />
      <path d="M9 5v14" />
      <path d="M15 8h3.5a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H10" />
    </svg>
  )
}

export function ReadListenIcon() {
  return (
    <svg {...BASE}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H12v14H6.5A2.5 2.5 0 0 0 4 20.5V6.5Z" />
      <path d="M20 6.5A2.5 2.5 0 0 0 17.5 4H12v14h5.5a2.5 2.5 0 0 1 2.5 2.5V6.5Z" />
      <path d="M16.5 11.5a2 2 0 0 1 0 3" />
      <path d="M18.2 10a3.5 3.5 0 0 1 0 6" />
    </svg>
  )
}

export function LearningCategoryIcon({ name }) {
  switch (name) {
    case 'book':
      return <BookOpenIcon />
    case 'messages':
      return <MessagesIcon />
    case 'cards':
      return <VocabCardsIcon />
    case 'headphones':
      return <ReadListenIcon />
    default:
      return <BookOpenIcon />
  }
}
