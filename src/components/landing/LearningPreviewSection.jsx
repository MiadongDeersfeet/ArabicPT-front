import { useRef, useState } from 'react'
import previewConversation from '../../assets/landing/preview-conversation.png'
import previewGrammar from '../../assets/landing/preview-grammar.png'
import './LearningPreviewSection.css'

const PREVIEW_CARDS = [
  {
    key: 'grammar',
    title: '기본 문법',
    description: '아랍어 문장의 기본 구조와 핵심 문법을 차근차근 배워요.',
    points: ['명사문', '성/수 일치', '지시대명사', '형용사 일치'],
    image: previewGrammar,
    imageAlt: '기본 문법을 상징하는 책과 깃펜 일러스트',
  },
  {
    key: 'conversation',
    title: '주제별 회화',
    description: '상황별로 자주 쓰는 표현을 배우고 듣고 따라 말하며 익혀요.',
    points: ['인사와 자기소개', '카페와 식당', '쇼핑과 시장', '일상과 여행'],
    image: previewConversation,
    imageAlt: '주제별 회화를 상징하는 커피포트와 찻잔 일러스트',
  },
]

/**
 * 미리보기 라우트 연결 지점.
 * 실제 학습 경로가 생기면 여기에 경로를 채우고 handlePreviewStart에서 navigate로 연결한다.
 */
const PREVIEW_ROUTES = {
  grammar: null,
  conversation: null,
}

/** 데스크톱 2열 카드와 모바일 탭 카드가 같은 내용을 쓰므로 내부만 분리한다. */
function PreviewCardContent({ card, isPending, onStart }) {
  return (
    <>
      <div className="previewMedia">
        <img className="previewImage" src={card.image} alt={card.imageAlt} decoding="async" />
      </div>

      <h3 className="previewCardTitle">{card.title}</h3>
      <p className="previewCardDescription">{card.description}</p>

      <ul className="previewPoints">
        {card.points.map((point) => (
          <li key={point} className="previewPoint">
            {point}
          </li>
        ))}
      </ul>

      <button type="button" className="previewCta" onClick={() => onStart(card.key)}>
        미리보기 시작
      </button>

      {isPending ? (
        <p className="previewStatus" role="status">
          미리보기 콘텐츠는 준비 중이에요. 준비되면 이 화면에서 바로 시작할 수 있어요.
        </p>
      ) : null}
    </>
  )
}

/**
 * 랜딩 세 번째 영역: 무엇부터 배울 수 있는지 보여주는 학습 미리보기.
 *
 * 768px 이상은 카드 2개를 함께 보여주고,
 * 767px 이하는 탭으로 한 번에 한 카드만 보여준다(전환은 CSS display로만 한다).
 */
function LearningPreviewSection() {
  const [pendingKey, setPendingKey] = useState(null)
  const [activePreviewKey, setActivePreviewKey] = useState('grammar')
  const tabRefs = useRef([])

  const activePreview =
    PREVIEW_CARDS.find((card) => card.key === activePreviewKey) ?? PREVIEW_CARDS[0]

  const handlePreviewStart = (key) => {
    if (PREVIEW_ROUTES[key]) {
      // TODO: 미리보기 라우트가 추가되면 navigate(PREVIEW_ROUTES[key])로 교체한다.
      return
    }
    setPendingKey(key)
  }

  const handleTabSelect = (key) => {
    setActivePreviewKey(key)
    // 탭을 바꾸면 이전 카드의 준비 중 안내는 초기화한다.
    setPendingKey(null)
  }

  const handleTabKeyDown = (event, index) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

    event.preventDefault()
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (index + offset + PREVIEW_CARDS.length) % PREVIEW_CARDS.length
    handleTabSelect(PREVIEW_CARDS[nextIndex].key)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section className="learningPreview" id="curriculum" aria-labelledby="learning-preview-heading">
      <div className="container">
        <div className="previewHeader">
          <h2 id="learning-preview-heading" className="previewTitle">
            학습 미리보기
          </h2>
          <p className="previewLead">
            관심 있는 영역을 선택하고{' '}
            <br className="previewBreakMobile" />
            ArabicPT의 학습 방식을 미리 경험해보세요.
          </p>
        </div>

        {/* 태블릿·데스크톱: 카드 2개 동시 노출 */}
        <ul className="previewGrid previewGrid--wide">
          {PREVIEW_CARDS.map((card) => (
            <li key={card.key}>
              <article className="previewCard">
                <PreviewCardContent
                  card={card}
                  isPending={pendingKey === card.key}
                  onStart={handlePreviewStart}
                />
              </article>
            </li>
          ))}
        </ul>

        {/* 모바일: 탭으로 한 카드만 노출 */}
        <div className="previewMobile">
          <div className="previewTabs" role="tablist" aria-label="학습 영역 선택">
            {PREVIEW_CARDS.map((card, index) => {
              const isActive = card.key === activePreview.key
              return (
                <button
                  key={card.key}
                  type="button"
                  role="tab"
                  id={`preview-tab-${card.key}`}
                  className={`previewTab${isActive ? ' isActive' : ''}`}
                  aria-selected={isActive}
                  aria-controls={`preview-panel-${card.key}`}
                  tabIndex={isActive ? 0 : -1}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  onClick={() => handleTabSelect(card.key)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {card.title}
                </button>
              )
            })}
          </div>

          <article
            className="previewCard previewMobileCard"
            role="tabpanel"
            id={`preview-panel-${activePreview.key}`}
            aria-labelledby={`preview-tab-${activePreview.key}`}
          >
            <PreviewCardContent
              card={activePreview}
              isPending={pendingKey === activePreview.key}
              onStart={handlePreviewStart}
            />
          </article>
        </div>
      </div>
    </section>
  )
}

export default LearningPreviewSection
