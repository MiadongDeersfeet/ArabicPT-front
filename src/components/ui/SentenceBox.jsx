function SentenceBox({ title, status = '학습 중', progress = '알고 있음 57', text, dir = 'ltr' }) {
  return (
    <article className="sentenceBox" aria-label={title}>
      <div className="sentenceHeader">
        <div className="sentenceStatus">
          <span className="statusDot" />
          <strong>{status}</strong>
        </div>
        <span className="sentenceProgress">{progress}</span>
      </div>

      <div className="sentenceBody">
        <button type="button" className="hintButton">
          힌트 열기
        </button>
        <p className="sentenceText" dir={dir} lang={dir === 'rtl' ? 'ar' : 'ko'}>
          {text}
        </p>
      </div>

      <div className="sentenceBottomBar">
        <span>단축키</span>
        <kbd>Space</kbd>
        <span>키로 뒤집기</span>
      </div>
    </article>
  )
}

export default SentenceBox
