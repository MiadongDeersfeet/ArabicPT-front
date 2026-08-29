import { Link } from 'react-router-dom'
import './Library.css'

function LibraryEmptyState({ title, text, actionLabel, actionTo }) {
  return (
    <div className="libEmpty">
      <p className="libEmptyTitle">{title}</p>
      {text ? <p className="libEmptyText">{text}</p> : null}
      {actionTo && actionLabel ? (
        <Link to={actionTo} className="libEmptyAction">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}

function LibraryResourceList({
  loading,
  error,
  onRetry,
  items,
  empty,
  searchEmpty,
  onClearSearch,
  sectionLabel,
  renderRow,
}) {
  if (loading) {
    return <p className="libStatus">자료를 불러오는 중입니다.</p>
  }

  if (error) {
    return (
      <div className="libStatusBlock">
        <p className="libStatus">자료를 불러오지 못했습니다.</p>
        {onRetry ? (
          <button type="button" className="libTextAction" onClick={onRetry}>
            다시 시도
          </button>
        ) : null}
      </div>
    )
  }

  if (searchEmpty) {
    return (
      <div className="libEmpty">
        <p className="libEmptyTitle">검색 결과가 없습니다.</p>
        <p className="libEmptyText">다른 검색어를 입력하거나 필터를 초기화해보세요.</p>
        {onClearSearch ? (
          <button type="button" className="libEmptyAction libEmptyAction--button" onClick={onClearSearch}>
            검색 초기화
          </button>
        ) : null}
      </div>
    )
  }

  if (!items.length) {
    return (
      <LibraryEmptyState
        title={empty.title}
        text={empty.text}
        actionLabel={empty.actionLabel}
        actionTo={empty.actionTo}
      />
    )
  }

  return (
    <section className="libListSection" aria-label={sectionLabel}>
      <div className="libListHead">
        <h2 className="libListHeading">{sectionLabel}</h2>
        <span className="libListCount">{items.length}개</span>
      </div>
      <ul className="libList">{items.map((item, index) => renderRow(item, index))}</ul>
    </section>
  )
}

export { LibraryEmptyState }
export default LibraryResourceList
