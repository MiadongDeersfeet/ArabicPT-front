/**
 * UI 키트 StudyCard와 동일한 O/X 원형 버튼 — 문장 학습 등에서 재사용
 */
function StudyMarkBar({ disabled = false, onWrong, onCorrect, hideCaptions = false }) {
  return (
    <div className="studyMarkBar" role="group" aria-label="학습 결과 표시">
      <div className="studyCardFooter studyMarkBarButtons">
        <button
          type="button"
          className="studyCircleButton studyCircleButton--wrong"
          aria-label="모름"
          disabled={disabled}
          onClick={onWrong}
        >
          ×
        </button>
        <button
          type="button"
          className="studyCircleButton studyCircleButton--correct"
          aria-label="알고 있음"
          disabled={disabled}
          onClick={onCorrect}
        >
          ✓
        </button>
      </div>
      {hideCaptions ? null : (
        <div className="studyMarkBarCaptions" aria-hidden="true">
          <span>모름</span>
          <span>알고 있음</span>
        </div>
      )}
    </div>
  )
}

export default StudyMarkBar
