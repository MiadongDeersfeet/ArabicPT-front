import './StudyLayout.css'

/**
 * 문장 학습 전용 셸 — 공통 Header/Footer 없음
 */
function StudyLayout({ children }) {
  return (
    <div className="studyLayoutShell">
      <a className="skipLink" href="#mainContent">
        본문으로 건너뛰기
      </a>
      <main id="mainContent" className="studyLayoutMain">
        {children}
      </main>
    </div>
  )
}

export default StudyLayout
