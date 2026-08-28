import StudyEbookView from '../ui/StudyEbookView.jsx'

/**
 * Ebook mode presentation — state/handlers는 SentenceStudy(부모)가 소유
 */
function StudyEbookPanel({
  loading,
  error,
  totalPages,
  currentIndex,
  frontText,
  backText,
  frontDir,
  backDir,
  showBack,
  fadeKey,
  hasAudio,
  onToggleSide,
  onPrev,
  onNext,
  onPlayAudio,
  onViewModeChange,
}) {
  return (
    <div className="studyWorkspace studyWorkspace--ebook">
      <div className="studyEbookChrome">
        <div className="libraryModeTabs studySegmented" role="tablist" aria-label="학습 보기 방식">
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="libraryModeTab"
            onClick={() => onViewModeChange('card')}
          >
            카드 학습
          </button>
          <button
            type="button"
            role="tab"
            aria-selected
            className="libraryModeTab libraryModeTab--active"
            onClick={() => onViewModeChange('ebook')}
          >
            Ebook 보기
          </button>
        </div>
        <p className="studyDeckPosition">
          {totalPages === 0 ? '0 / 0 문장' : `${currentIndex + 1} / ${totalPages} 페이지`}
        </p>
      </div>

      {loading ? (
        <p className="libraryStatusText paragraphReaderStatus">문장을 불러오는 중입니다.</p>
      ) : error ? (
        <p className="libraryStatusText paragraphReaderStatus">문장을 불러오지 못했습니다.</p>
      ) : totalPages === 0 ? (
        <p className="libraryStatusText paragraphReaderStatus">아직 등록된 문장이 없습니다.</p>
      ) : (
        <StudyEbookView
          frontText={frontText}
          backText={backText}
          frontDir={frontDir}
          backDir={backDir}
          showBack={showBack}
          fadeKey={fadeKey}
          onToggleSide={onToggleSide}
          currentIndex={currentIndex}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
          hasAudio={hasAudio}
          onPlayAudio={onPlayAudio}
        />
      )}
    </div>
  )
}

export default StudyEbookPanel
