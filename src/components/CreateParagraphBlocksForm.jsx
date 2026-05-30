/**
 * 문단 Ebook 세트 만들기/편집용 문단 입력 UI
 */
export function CreateParagraphBlocksForm({
  blocks,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  onToggleBlockMemo,
  disabled,
  error,
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
  showFab = true,
}) {
  return (
    <>
      <div className="createSetCardsSection paragraphBlocksSection">
        <ul className="createSetCardList paragraphBlockList">
          {blocks.map((block, index) => (
            <li key={block.id ?? block.key} className="createSetCard paragraphBlock">
              <div className="createSetCardToolbar">
                <span className="createSetCardNumber">페이지 {index + 1}</span>
                <button
                  type="button"
                  className="createSetCardRemove"
                  onClick={() => onRemoveBlock(block.id ?? block.key)}
                  disabled={blocks.length <= 1 || disabled}
                  aria-label={`페이지 ${index + 1} 삭제`}
                >
                  삭제
                </button>
              </div>
              <div className="createSetCardFields paragraphBlockFields">
                <div className="uiField">
                  <label className="uiFieldLabel">
                    한국어 문단 <span className="libraryRequired">*</span>
                  </label>
                  <textarea
                    className="uiInput libraryTextarea paragraphTextarea paragraphTextarea--ko"
                    dir="ltr"
                    rows={5}
                    value={block.frontText}
                    onChange={(e) => onUpdateBlock(block.id ?? block.key, 'frontText', e.target.value)}
                    disabled={disabled}
                    placeholder="한국어 문단을 입력하세요"
                  />
                </div>
                <div className="uiField">
                  <label className="uiFieldLabel">
                    아랍어 문단 <span className="libraryRequired">*</span>
                  </label>
                  <textarea
                    className="uiInput libraryTextarea paragraphTextarea paragraphTextarea--ar"
                    dir="rtl"
                    rows={5}
                    value={block.backText}
                    onChange={(e) => onUpdateBlock(block.id ?? block.key, 'backText', e.target.value)}
                    disabled={disabled}
                    placeholder="아랍어 문단을 입력하세요"
                  />
                </div>
                {block.memoOpen ? (
                  <div className="uiField">
                    <label className="uiFieldLabel">메모 (선택)</label>
                    <textarea
                      className="uiInput libraryTextarea"
                      rows={2}
                      value={block.memo}
                      onChange={(e) => onUpdateBlock(block.id ?? block.key, 'memo', e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                ) : null}
                <button
                  type="button"
                  className="createSetDescToggleBtn"
                  onClick={() => onToggleBlockMemo(block.id ?? block.key)}
                  disabled={disabled}
                >
                  {block.memoOpen ? '- 메모' : '+ 메모'}
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="createSetAddCardBtn" onClick={onAddBlock} disabled={disabled}>
          + 페이지 추가
        </button>
      </div>

      {error ? (
        <p className="libraryFormError createSetError" role="alert">
          {error}
        </p>
      ) : null}

      <div className="createSetSimpleActions paragraphCreateActions">
        {secondaryLabel && onSecondaryClick ? (
          <button
            type="button"
            className="uiButton uiButton--secondary paragraphCreateSecondaryBtn"
            disabled={disabled}
            onClick={onSecondaryClick}
          >
            {secondaryLabel}
          </button>
        ) : null}
        <button type="button" className="primaryButton" disabled={disabled} onClick={onPrimaryClick}>
          {primaryLabel}
        </button>
      </div>

      {showFab ? (
        <button
          type="button"
          className="createSetFabAdd"
          aria-label="페이지 추가"
          onClick={onAddBlock}
          disabled={disabled}
        >
          +
        </button>
      ) : null}
    </>
  )
}
