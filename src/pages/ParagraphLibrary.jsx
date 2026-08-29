import { useCallback, useEffect, useMemo, useState } from 'react'
import { getFolders } from '../api/folderApi.js'
import { getParagraphSets } from '../api/paragraphSetApi.js'
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
 * /library/paragraph-sets — personal Ebook library (same shell as sentence Library).
 */
function ParagraphLibrary() {
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
      const setList = await getParagraphSets({})
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
          createLabel="새 Ebook"
          createTo="/library/paragraph-sets/new"
        />

        <LibraryTypeNav />

        <LibraryToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ebook 검색"
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
          sectionLabel="Ebook"
          empty={{
            title: '아직 Ebook이 없습니다.',
            text: '문단 단위의 글을 저장하고 읽기 자료로 만들어보세요.',
            actionLabel: '새 Ebook 만들기',
            actionTo: '/library/paragraph-sets/new',
          }}
          renderRow={(set, index) => {
            const countMeta =
              set.paragraphCount != null ? `Ebook · ${set.paragraphCount}개 문단` : 'Ebook'
            const folderMeta = set.folderName ? `폴더 · ${set.folderName}` : null
            return (
              <LibraryResourceRow
                key={set.paragraphSetId}
                to={`/library/paragraph-sets/${set.paragraphSetId}`}
                index={index + 1}
                title={set.setName}
                description={set.description}
                metaPrimary={countMeta}
                metaSecondary={folderMeta}
                dateLabel={formatLibraryUpdatedLabel(set)}
              />
            )
          }}
        />
      </div>
    </div>
  )
}

export default ParagraphLibrary
