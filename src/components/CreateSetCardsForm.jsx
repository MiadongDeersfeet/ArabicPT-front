/**
 * 「문장카드 세트 만들기」와 동일한 카드 입력 UI (목록 + 카드 추가 + 하단 액션)
 */
export function CreateSetCardsForm({
  cards,
  onAddCard,
  onRemoveCard,
  onUpdateCard,
  onToggleCardMemo,
  disabled,
  error,
  primaryLabel,
  onPrimaryClick,
  showFab = true,
}) {
  return (
    <>
      <div className="createSetCardsSection">
        <ul className="createSetCardList">
          {cards.map((card, index) => (
            <li key={card.id} className="createSetCard">
              <div className="createSetCardToolbar">
                <span className="createSetCardNumber">{index + 1}</span>
                <button
                  type="button"
                  className="createSetCardRemove"
                  onClick={() => onRemoveCard(card.id)}
                  disabled={cards.length <= 1 || disabled}
                  aria-label={`카드 ${index + 1} 삭제`}
                >
                  삭제
                </button>
              </div>
              <div className="createSetCardFields">
                <div className="uiField">
                  <label className="uiFieldLabel">
                    문장 <span className="libraryRequired">*</span>
                  </label>
                  <textarea
                    className="uiInput libraryTextarea"
                    rows={1}
                    value={card.frontText}
                    onChange={(e) => onUpdateCard(card.id, 'frontText', e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div className="uiField">
                  <label className="uiFieldLabel">
                    뜻 <span className="libraryRequired">*</span>
                  </label>
                  <textarea
                    className="uiInput libraryTextarea"
                    rows={1}
                    value={card.backText}
                    onChange={(e) => onUpdateCard(card.id, 'backText', e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
              {card.memoOpen ? (
                <div className="uiField createSetCardMemoField">
                  <label className="uiFieldLabel" htmlFor={`draft-set-memo-${card.id}`}>
                    메모 (선택)
                  </label>
                  <textarea
                    id={`draft-set-memo-${card.id}`}
                    className="uiInput libraryTextarea"
                    rows={1}
                    value={card.memo}
                    onChange={(e) => onUpdateCard(card.id, 'memo', e.target.value)}
                    disabled={disabled}
                  />
                </div>
              ) : null}
              <div className="createSetCardToggleRow">
                <button
                  type="button"
                  className="createSetDescToggleBtn"
                  onClick={() => onToggleCardMemo(card.id)}
                  aria-expanded={Boolean(card.memoOpen)}
                  aria-controls={`draft-set-memo-${card.id}`}
                  disabled={disabled}
                >
                  {card.memoOpen ? '- 메모' : '+ 메모'}
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="headerGhostButton createSetAddCardBtn"
          onClick={onAddCard}
          disabled={disabled}
        >
          + 카드 추가
        </button>
      </div>

      {error ? (
        <p className="libraryFormError createSetError" role="alert">
          {error}
        </p>
      ) : null}

      <div className="createSetActions createSetSimpleActions">
        {showFab ? (
          <button
            type="button"
            className="createSetFabAdd"
            onClick={onAddCard}
            disabled={disabled}
            aria-label="카드 추가"
          >
            +
          </button>
        ) : null}
        <button type="button" className="primaryButton" onClick={onPrimaryClick} disabled={disabled}>
          {primaryLabel}
        </button>
      </div>
    </>
  )
}
