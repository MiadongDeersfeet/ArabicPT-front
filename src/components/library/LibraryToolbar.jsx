import { Link } from 'react-router-dom'
import { LIBRARY_SORT_OPTIONS } from './libraryListUtils.js'
import './Library.css'

function LibraryToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = '검색',
  folders = [],
  folderValue,
  onFolderChange,
  sortValue,
  onSortChange,
  showFolderManage = true,
}) {
  const folderOptions = [...folders].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  )

  return (
    <div className="libToolbar">
      <div className="libToolbarSearch">
        <label className="visuallyHidden" htmlFor="lib-search">
          {searchPlaceholder}
        </label>
        <input
          id="lib-search"
          type="search"
          className="libSearchInput"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
        {searchValue ? (
          <button
            type="button"
            className="libSearchClear"
            onClick={() => onSearchChange('')}
          >
            지우기
          </button>
        ) : null}
      </div>

      <div className="libToolbarFilters">
        <div className="libFilterField">
          <label className="libFilterLabel" htmlFor="lib-folder">
            폴더
          </label>
          <select
            id="lib-folder"
            className="libSelect"
            value={folderValue}
            onChange={(e) => onFolderChange(e.target.value)}
          >
            <option value="">전체</option>
            <option value="__none__">폴더 없음</option>
            {folderOptions.map((f) => (
              <option key={f.folderId} value={String(f.folderId)}>
                {f.folderName}
              </option>
            ))}
          </select>
        </div>

        <div className="libFilterField">
          <label className="libFilterLabel" htmlFor="lib-sort">
            정렬
          </label>
          <select
            id="lib-sort"
            className="libSelect"
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {LIBRARY_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {showFolderManage ? (
          <Link to="/library/folders" className="libFolderManage">
            폴더 관리
          </Link>
        ) : null}
      </div>
    </div>
  )
}

export default LibraryToolbar
