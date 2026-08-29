import { useCallback, useEffect, useMemo, useState } from 'react'
import { getFolders } from '../api/folderApi.js'
import { getSets } from '../api/sentenceSetApi.js'
import LibraryPageHeader from '../components/library/LibraryPageHeader.jsx'
import LibraryTypeNav from '../components/library/LibraryTypeNav.jsx'
import LibraryToolbar from '../components/library/LibraryToolbar.jsx'
import LibraryResourceList from '../components/library/LibraryResourceList.jsx'
import LibraryResourceRow from '../components/library/LibraryResourceRow.jsx'
import {
  formatLibraryUpdatedLabel,
  matchesFolderFilter,
  matchesLibrarySearch,
  sortLibraryItems,
} from '../components/library/libraryListUtils.js'
import '../components/library/Library.css'

/**
 * /library — personal sentence sets (Productivity Editorial).
 */
function Library() {
  const [sets, setSets] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [folderFilter, setFolderFilter] = useState('')
  const [sortValue, setSortValue] = useState('updatedDesc')

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const setList = await getSets()
      setSets(Array.isArray(setList) ? setList : [])
    } catch (fetchError) {
      console.error(fetchError)
      setSets([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const list = await getFolders()
        if (alive && Array.isArray(list)) setFolders(list)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const visibleSets = useMemo(() => {
    const filtered = sets.filter(
      (set) =>
        matchesLibrarySearch(set, search, ['setName', 'description', 'folderName']) &&
        matchesFolderFilter(set, folderFilter),
    )
    return sortLibraryItems(filtered, sortValue, 'setName')
  }, [sets, search, folderFilter, sortValue])

  const hasActiveQuery = Boolean(search.trim()) || folderFilter !== ''
  const searchEmpty = !loading && !error && sets.length > 0 && visibleSets.length === 0 && hasActiveQuery

  const clearSearchAndFilters = () => {
    setSearch('')
    setFolderFilter('')
  }

  return (
    <div className="libPage">
      <div className="container libPageInner">
        <LibraryPageHeader
          title="내 라이브러리"
          description="내가 만든 문장과 학습 자료를 정리하고 다시 학습하세요."
          createLabel="새 세트"
          createTo="/library/sets/new"
        />

        <LibraryTypeNav />

        <LibraryToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="문장 세트 검색"
          folders={folders}
          folderValue={folderFilter}
          onFolderChange={setFolderFilter}
          sortValue={sortValue}
          onSortChange={setSortValue}
        />

        <LibraryResourceList
          loading={loading}
          error={error}
          onRetry={load}
          items={visibleSets}
          searchEmpty={searchEmpty}
          onClearSearch={clearSearchAndFilters}
          sectionLabel="문장 세트"
          empty={{
            title: '아직 문장 세트가 없습니다.',
            text: '직접 문장을 추가해 나만의 학습 세트를 만들어보세요.',
            actionLabel: '새 세트 만들기',
            actionTo: '/library/sets/new',
          }}
          renderRow={(set, index) => (
            <LibraryResourceRow
              key={set.setId}
              to={`/library/sets/${set.setId}`}
              index={index + 1}
              title={set.setName}
              description={set.description}
              metaPrimary={set.folderName ? `폴더 · ${set.folderName}` : '개인 문장 세트'}
              dateLabel={formatLibraryUpdatedLabel(set)}
            />
          )}
        />
      </div>
    </div>
  )
}

export default Library
