import LearningCategoryGrid from '../components/learning/LearningCategoryGrid.jsx'
import './Learn.css'

/**
 * /learn shell — 공식 course/lesson 데이터 없이 카테고리 준비 상태만 표시.
 */
function Learn() {
  return (
    <div className="learnPage">
      <div className="container learnPageInner">
        <header className="learnPageIntro">
          <h1 className="learnPageTitle">학습</h1>
          <p className="learnPageLead">ArabicPT의 학습 과정을 선택하세요.</p>
        </header>

        <section className="learnPageSection" aria-labelledby="learn-categories-title">
          <h2 id="learn-categories-title" className="visuallyHidden">
            학습 영역
          </h2>
          <LearningCategoryGrid
            descriptionKey="learnDescription"
            statusLabel="준비 중"
            asLink={false}
          />
        </section>

        <p className="learnPageNote">
          각 영역의 상세 커리큘럼은 준비 중입니다. 준비되는 대로 이 화면에서 바로 시작할 수
          있어요.
        </p>
      </div>
    </div>
  )
}

export default Learn
