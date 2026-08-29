/**
 * ArabicPT 공식 학습 카테고리 — Home / Learn / Category shell 공유 데이터.
 * Course/Lesson API는 아직 없음. fake progress/count 없음.
 */

export const LEARNING_CATEGORIES = [
  {
    id: 'grammar',
    slug: 'grammar',
    path: '/learn/grammar',
    number: '01',
    eyebrow: 'GRAMMAR',
    title: '기초 문법',
    arabicTitle: 'قواعد',
    description: '문장의 구조와 핵심 문법을 차근차근 익혀요.',
    learnDescription: '문장 구조와 핵심 문법을 단계별로 학습합니다.',
    homeLine: '문장을 만드는 기본 원리',
    catalogLead: '아랍어 문장을 이해하기 위한\n기본 구조와 핵심 문법을 익혀요.',
    detailLead: '문장을 이해하고 만드는 데 필요한\n아랍어의 기본 구조를 익힙니다.',
    ctaLabel: '문법 학습 보기',
    motif: 'grammar',
    surface: 'sage',
    learningPoints: [
      '문장의 기본 구조',
      '명사와 형용사의 관계',
      '성·수 일치',
      '주요 문법 패턴',
    ],
    coursePlaceholder: {
      title: '기초 문법 과정을 준비하고 있습니다.',
      body: 'ArabicPT에서는 설명 → 예문 → 연습 → 복습의 흐름으로 학습할 수 있도록 구성할 예정입니다.',
    },
  },
  {
    id: 'conversation',
    slug: 'conversation',
    path: '/learn/conversation',
    number: '02',
    eyebrow: 'CONVERSATION',
    title: '상황별 회화',
    arabicTitle: 'محادثة',
    description: '실제 상황에서 사용할 표현을 중심으로 익혀요.',
    learnDescription: '실생활 상황에서 바로 쓸 표현을 중심으로 익힙니다.',
    homeLine: '실제 상황에서 쓰는 표현',
    catalogLead: '실제 상황에서 사용할\n표현과 문장 패턴을 익혀요.',
    detailLead: '실제 상황에서 바로 쓸 수 있는\n표현과 문장 패턴을 익힙니다.',
    ctaLabel: '회화 학습 보기',
    motif: 'conversation',
    surface: 'white',
    learningPoints: [
      '상황별 핵심 표현',
      '자주 쓰는 문장 패턴',
      '듣고 따라 말하기',
      '표현 복습',
    ],
    coursePlaceholder: {
      title: '상황별 회화 과정을 준비하고 있습니다.',
      body: 'ArabicPT에서는 상황 → 표현 → 따라 말하기 → 복습의 흐름으로 구성할 예정입니다.',
    },
  },
  {
    id: 'vocabulary',
    slug: 'vocabulary',
    path: '/learn/vocabulary',
    number: '03',
    eyebrow: 'VOCABULARY',
    title: '어휘',
    arabicTitle: 'مفردات',
    description: '주제별 핵심 어휘를 반복하며 쌓아가요.',
    learnDescription: '주제별 핵심 어휘를 반복하며 쌓아갑니다.',
    homeLine: '반복하며 쌓는 핵심 단어',
    catalogLead: '주제별 핵심 어휘를\n반복해서 만나고 내 것으로 만들어요.',
    detailLead: '주제별 핵심 어휘를 반복해서 만나고\n의미와 소리로 내 것으로 만듭니다.',
    ctaLabel: '어휘 학습 보기',
    motif: 'vocabulary',
    surface: 'paper',
    learningPoints: [
      '주제별 핵심 단어',
      '의미 확인',
      '반복 학습',
      '듣기 기반 복습',
    ],
    coursePlaceholder: {
      title: '어휘 학습 과정을 준비하고 있습니다.',
      body: 'ArabicPT에서는 주제 → 의미 확인 → 반복 → 듣기 복습의 흐름으로 구성할 예정입니다.',
    },
  },
  {
    id: 'reading',
    slug: 'reading-listening',
    path: '/learn/reading-listening',
    number: '04',
    eyebrow: 'READING & LISTENING',
    title: '리딩 & 리스닝',
    arabicTitle: 'قراءة واستماع',
    description: '아랍어 텍스트를 읽고 오디오로 함께 익혀요.',
    learnDescription: '텍스트를 읽고 오디오와 함께 익힙니다.',
    homeLine: '읽고 들으며 익히는 아랍어',
    catalogLead: '아랍어 텍스트를 읽고 들으며\n문장과 표현을 맥락 속에서 익혀요.',
    detailLead: '텍스트를 읽고 들으며\n문장과 표현을 맥락 속에서 익힙니다.',
    ctaLabel: '리딩·리스닝 보기',
    motif: 'reading',
    surface: 'contrast',
    learningPoints: [
      '텍스트 읽기',
      '문단별 이해',
      '오디오 듣기',
      '핵심 문장 저장',
    ],
    coursePlaceholder: {
      title: '리딩·리스닝 과정을 준비하고 있습니다.',
      body: 'ArabicPT에서는 읽기 → 듣기 → 이해 → 문장 저장의 흐름으로 구성할 예정입니다.',
    },
  },
]

export const LEARNING_FLOW_STEPS = [
  {
    number: '01',
    title: '이해하기',
    text: '문법과 맥락을 이해합니다.',
  },
  {
    number: '02',
    title: '익히기',
    text: '문장과 어휘를 반복해서 만납니다.',
  },
  {
    number: '03',
    title: '연습하기',
    text: '카드·듣기·Ebook으로 연습합니다.',
  },
  {
    number: '04',
    title: '저장하기',
    text: '중요한 문장과 글을 내 라이브러리에 저장합니다.',
  },
]

export function getLearningCategoryBySlug(slug) {
  return LEARNING_CATEGORIES.find((c) => c.slug === slug) ?? null
}
