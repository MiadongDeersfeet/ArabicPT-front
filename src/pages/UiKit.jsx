import { Link } from 'react-router-dom'
import SentenceBox from '../components/ui/SentenceBox.jsx'
import StudyCard from '../components/ui/StudyCard.jsx'
import UiButton from '../components/ui/UiButton.jsx'
import UiCard from '../components/ui/UiCard.jsx'
import UiInput from '../components/ui/UiInput.jsx'

const cardItems = [
  {
    title: '단어 학습 카드',
    description: '단어, 뜻, 발음 버튼을 담는 기본 카드입니다.',
    usage: '용도: 단어 학습/복습 화면',
  },
  {
    title: '퀴즈 카드',
    description: '문제, 선택지, 정답 피드백 영역을 담는 카드입니다.',
    usage: '용도: 객관식/주관식 퀴즈',
  },
  {
    title: '학습 기록 카드',
    description: '연속 학습일, 정답률 등 요약 지표를 보여줍니다.',
    usage: '용도: 대시보드/마이페이지',
  },
]

function UiKit() {
  return (
    <>
      <section className="container">
        <div className="introCard">
          <h2>ArabicPT UI 가이드</h2>
          <p>퀴즐렛 스타일 공용 컴포넌트 모양과 용도를 한 번에 확인합니다.</p>
        </div>
      </section>

      <section className="container sectionSpacing">
        <div className="introCard">
          <h2>이 페이지의 목적</h2>
          <p>
            학습 화면에서 반복 사용하는 버튼, 인풋, 문장 박스, 카드 컴포넌트를 통일된 형태로
            관리하기 위한 공용 UI 라이브러리 페이지입니다.
          </p>
          <div className="buttonRow">
            <UiButton>기본 액션</UiButton>
            <UiButton variant="secondary">보조 액션</UiButton>
            <UiButton disabled>비활성 액션</UiButton>
          </div>
        </div>
      </section>

      <section className="container sectionSpacing">
        <h2 className="sectionTitle">인풋 요소</h2>
        <div className="formGrid">
          <UiInput label="단어" placeholder="아랍어 단어를 입력하세요" hint="예: مَكْتَبَة" />
          <UiInput label="뜻" placeholder="한국어 뜻을 입력하세요" hint="예: 도서관" />
        </div>
      </section>

      <section className="container sectionSpacing">
        <h2 className="sectionTitle">문장 박스</h2>
        <div className="sentencePreviewGrid">
          <SentenceBox
            title="한국어 예문 카드"
            status="학습 중"
            progress="알고 있음 57"
            text="공장들이 도시에서 교외로 이동한다 (교외 복수형)"
            dir="ltr"
          />
          <SentenceBox
            title="아랍어 예문 카드"
            status="학습 중"
            progress="알고 있음 57"
            text="تنتقل المصانع من المدينة إلى ضواحي المدينة."
            dir="rtl"
          />
        </div>
      </section>

      <section className="container sectionSpacing">
        <h2 className="sectionTitle">학습 카드 (O/X 액션 포함)</h2>
        <div className="sentencePreviewGrid">
          <StudyCard
            title="한국어 학습 카드"
            text="공장들이 도시에서 교외로 이동한다 (교외 복수형)"
            dir="ltr"
          />
          <StudyCard title="아랍어 학습 카드" text="تنتقل المصانع من المدينة إلى ضواحي المدينة." dir="rtl" />
        </div>
      </section>

      <section className="container sectionSpacing">
        <h2 className="sectionTitle">카드 컴포넌트</h2>
        <div className="cardGrid">
          {cardItems.map((item) => (
            <UiCard
              key={item.title}
              title={item.title}
              description={item.description}
              usage={item.usage}
            />
          ))}
        </div>
      </section>

      <section className="container sectionSpacing">
        <div className="introCard">
          <h2>다음 단계</h2>
          <p>공용 컴포넌트를 조합해 학습/퀴즈/관리자 화면을 일관된 UI로 확장할 수 있습니다.</p>
          <Link to="/" className="textLink">
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </>
  )
}

export default UiKit
