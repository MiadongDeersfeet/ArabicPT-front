import { useEffect, useId, useRef, useState } from 'react'
import { LEARNING_PREVIEW_OPTIONS } from './learningPreviewOptions.js'
import './LearningPreviewModal.css'

/**
 * 학습 미리보기 선택 UI.
 * 실제 학습 경로가 생기면 onSelect에서 라우팅만 연결하면 된다.
 */
function LearningPreviewModal({ onClose, onSelect }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [onClose])

  const selectedOption = LEARNING_PREVIEW_OPTIONS.find((option) => option.id === selectedId)

  const handleSelect = (optionId) => {
    setSelectedId(optionId)
    onSelect?.(optionId)
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="learningPreviewOverlay" role="presentation" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className="learningPreviewDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="learningPreviewHeader">
          <h2 id={titleId} className="learningPreviewTitle">
            {selectedOption ? selectedOption.title : '학습 미리보기'}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="learningPreviewClose"
            aria-label="닫기"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {selectedOption ? (
          <div className="learningPreviewSelected">
            <p className="learningPreviewSelectedLead">{selectedOption.description}</p>
            <p className="learningPreviewSelectedNote">
              미리보기 콘텐츠는 준비 중이에요. 선택하신 학습 영역은 곧 바로 연결될 예정이에요.
            </p>
            <div className="learningPreviewSelectedActions">
              <button
                type="button"
                className="learningPreviewBack"
                onClick={() => setSelectedId(null)}
              >
                다른 영역 선택
              </button>
              <button type="button" className="learningPreviewDone" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="learningPreviewLead">체험해 볼 학습 영역을 선택해 주세요.</p>
            <ul className="learningPreviewList">
              {LEARNING_PREVIEW_OPTIONS.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    className="learningPreviewCard"
                    onClick={() => handleSelect(option.id)}
                  >
                    <span className="learningPreviewCardTitle">{option.title}</span>
                    <span className="learningPreviewCardDesc">{option.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default LearningPreviewModal
