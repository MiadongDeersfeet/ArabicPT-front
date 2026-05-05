import { Link } from 'react-router-dom'

const learningCards = [
  { title: '단어 학습 카드', description: '발음과 함께 아랍어 단어를 학습합니다.' },
  { title: '문장 학습 카드', description: '일상 회화에 필요한 문장 패턴을 익힙니다.' },
  { title: '퀴즈 카드', description: '짧은 퀴즈를 통해 학습 내용을 점검합니다.' },
  { title: '오디오 카드', description: '터치하기 쉬운 큰 재생 버튼을 제공합니다.' },
  { title: '학습 기록 카드', description: '학습 시간과 복습 흐름을 한눈에 확인합니다.' },
  { title: '즐겨찾기 카드', description: '중요한 단어와 문장을 빠르게 저장합니다.' },
  { title: '관리자 카드', description: '작은 화면에서도 편한 콘텐츠 관리 구조입니다.' },
]

function Home() {
  const quickLinks = [
    {
      title: '라이브러리',
      description: '문장 세트를 확인하고 학습을 시작합니다.',
      to: '/library',
    },
    {
      title: '공용 UI 컴포넌트',
      description: '현재 사용 중인 공용 UI 요소를 확인합니다.',
      to: '/ui-kit',
    },
  ]

  return (
    <>
      <section className="container">
        <div className="introCard" role="region" aria-label="학습 소개">
          <Link to="/library" className="primaryButton">
            내 문장 세트
          </Link>
        </div>
      </section>

      <section className="container sectionSpacing">
        <h2 className="sectionTitle">바로가기</h2>
        <div className="cardGrid">
          {quickLinks.map((card) => (
            <Link key={card.title} to={card.to} className="learningCardLink">
              <article className="learningCard">
                <h3>{card.title}</h3>
                {/* <p>{card.description}</p> */}
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="container sectionSpacing">
        <h2 className="sectionTitle">예정 카드 유형</h2>
        <div className="cardGrid">
          {learningCards.map((card) => (
            <article key={card.title} className="learningCard">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
