/**
 * O/X 평가 바
 * - variant "circles": UiKit / 기존 원형 (기본)
 * - variant "actions": Card mode 넓은 액션 버튼
 */
function StudyMarkBar({
  disabled = false,
  onWrong,
  onCorrect,
  hideCaptions = false,
  variant = 'circles',
}) {
  if (variant === 'actions') {
    return (
      <div className="studyMarkBar studyMarkBar--actions" role="group" aria-label="학습 결과 표시">
        <button
          type="button"
          className="studyActionButton studyActionButton--wrong"
          disabled={disabled}
          onClick={onWrong}
          aria-label="몰라요"
        >
          <span className="studyActionButtonIcon" aria-hidden="true">
            ×
          </span>
          <span className="studyActionButtonLabel">몰라요</span>
        </button>
        <button
          type="button"
          className="studyActionButton studyActionButton--correct"
          disabled={disabled}
          onClick={onCorrect}
          aria-label="알고 있음"
        >
          <span className="studyActionButtonIcon" aria-hidden="true">
            ✓
          </span>
          <span className="studyActionButtonLabel">알고 있음</span>
        </button>
      </div>
    )
  }

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
