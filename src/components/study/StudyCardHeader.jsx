import StudyProgress from './StudyProgress.jsx'

/**
 * Card mode in-page chrome — mode tabs + progress (session header는 StudySessionHeader)
 */
function StudyCardHeader({
  current,
  total,
  known,
  unknown,
  weakOnly,
  onWeakOnlyChange,
  weakOnlyDisabled,
  viewMode,
  onViewModeChange,
  progressCompact = false,
  pulseStat = null,
}) {
  return (
    <div className="studyCardChrome">
      <div className="libraryModeTabs studySegmented" role="tablist" aria-label="학습 보기 방식">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'card'}
          className={`libraryModeTab${viewMode === 'card' ? ' libraryModeTab--active' : ''}`}
          onClick={() => onViewModeChange('card')}
        >
          카드 학습
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'ebook'}
          className={`libraryModeTab${viewMode === 'ebook' ? ' libraryModeTab--active' : ''}`}
          onClick={() => onViewModeChange('ebook')}
        >
          Ebook 보기
        </button>
      </div>

      <StudyProgress
        current={current}
        total={total}
        known={known}
        unknown={unknown}
        weakOnly={weakOnly}
        onWeakOnlyChange={onWeakOnlyChange}
        weakOnlyDisabled={weakOnlyDisabled}
        compact={progressCompact}
        pulseStat={pulseStat}
      />
    </div>
  )
}

export default StudyCardHeader
