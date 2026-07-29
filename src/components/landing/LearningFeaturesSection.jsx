import {
  ChatBubblesIcon,
  NotePencilIcon,
  OpenBookIcon,
  WordBoxIcon,
} from './LearningFeatureIcons.jsx'
import './LearningFeaturesSection.css'

/**
 * mobileDescription은 767px 이하 2열 카드에서 쓰는 짧은 문구다.
 * 전환은 CSS display로만 처리한다(JS로 화면 폭을 재지 않는다).
 */
const FEATURES = [
  {
    number: '01',
    title: '쉽고 체계적인 학습',
    description: '기초 문법부터 차근차근, 예문과 문제로 부담 없이 이해해요.',
    mobileDescription: '문법을 예문과 문제로 쉽게 이해해요.',
    Icon: OpenBookIcon,
  },
  {
    number: '02',
    title: '실생활 회화 중심',
    description: '자주 쓰는 표현을 익혀 바로 말하고 따라 할 수 있어요.',
    mobileDescription: '자주 쓰는 표현을 듣고 따라 말해요.',
    Icon: ChatBubblesIcon,
  },
  {
    number: '03',
    title: '단어는 자산처럼',
    description: '문법과 회화에서 배운 단어를 저장하고 나만의 단어장으로 관리해요.',
    mobileDescription: '배운 단어를 저장하고 복습해요.',
    Icon: WordBoxIcon,
  },
  {
    number: '04',
    title: '나만의 문장 저장',
    description: '중요한 문장과 표현을 저장하고 복습하며 내 것으로 만들어요.',
    mobileDescription: '중요한 문장을 모아 내 것으로 만들어요.',
    Icon: NotePencilIcon,
  },
]

/**
 * 랜딩 두 번째 영역: ArabicPT의 학습 방식을 4개 카드로 소개한다.
 * 클릭 대상이 아니라 설명 영역이므로 카드에 링크나 hover 강조를 넣지 않는다.
 *
 * id="how-it-works"는 PublicHeader의 기존 '학습 방식' 앵커와 짝이 된다.
 */
function LearningFeaturesSection() {
  return (
    <section
      className="learningFeatures"
      id="how-it-works"
      aria-labelledby="learning-features-heading"
    >
      <div className="container">
        <div className="featuresHeader">
          <svg
            className="featuresOrnament"
            viewBox="0 0 64 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 16c9-9 19-12 28-12s19 3 28 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="1 5"
            />
            <path
              d="M35.6 5.4a3.4 3.4 0 1 1-3.5-3.4 4.2 4.2 0 0 0 3.5 3.4Z"
              fill="currentColor"
            />
          </svg>

          <h2 id="learning-features-heading" className="featuresTitle">
            ArabicPT로 이런 학습을
            <br />
            <span className="featuresTitleAccent">경험해보세요</span>
          </h2>

          <p className="featuresLead">
            기초부터 실전까지,
            <br className="featuresBreakMobile" />
            혼자서도 즐겁게 이어갈 수 있도록 설계했어요.
          </p>
        </div>

        <ul className="featuresGrid">
          {FEATURES.map(({ number, title, description, mobileDescription, Icon }) => (
            <li key={number}>
              <article className="featureCard">
                <span className="featureNumber" aria-hidden="true">
                  {number}
                </span>
                <span className="featureIcon" aria-hidden="true">
                  <Icon />
                </span>
                <h3 className="featureTitle">{title}</h3>
                <p className="featureDescription featureDescription--mobile">
                  {mobileDescription}
                </p>
                <p className="featureDescription featureDescription--wide">{description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default LearningFeaturesSection
