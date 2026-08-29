/**
 * 공식 학습 카테고리 shell 데이터.
 * Home / Learn presentation은 분리하고 constants만 공유한다.
 */
export const LEARNING_CATEGORIES = [
  {
    id: 'grammar',
    title: '기초 문법',
    description: '문장의 구조와 핵심 문법을 차근차근 익혀요.',
    learnDescription: '문장 구조와 핵심 문법을 단계별로 학습합니다.',
    homeLine: '문장을 만드는 기본 원리',
    icon: 'book',
    motif: 'grammar',
  },
  {
    id: 'conversation',
    title: '상황별 회화',
    description: '실제 상황에서 사용할 표현을 중심으로 익혀요.',
    learnDescription: '실생활 상황에서 바로 쓸 표현을 중심으로 익힙니다.',
    homeLine: '실제 상황에서 쓰는 표현',
    icon: 'messages',
    motif: 'conversation',
  },
  {
    id: 'vocabulary',
    title: '어휘',
    description: '주제별 핵심 어휘를 반복하며 쌓아가요.',
    learnDescription: '주제별 핵심 어휘를 반복하며 쌓아갑니다.',
    homeLine: '반복하며 쌓는 핵심 단어',
    icon: 'cards',
    motif: 'vocabulary',
  },
  {
    id: 'reading',
    title: '리딩 & 리스닝',
    description: '아랍어 텍스트를 읽고 오디오로 함께 익혀요.',
    learnDescription: '텍스트를 읽고 오디오와 함께 익힙니다.',
    homeLine: '읽고 들으며 익히는 아랍어',
    icon: 'headphones',
    motif: 'reading',
  },
]
