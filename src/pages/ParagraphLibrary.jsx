import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFolders } from '../api/folderApi.js'
import { getParagraphSets } from '../api/paragraphSetApi.js'

function formatWhen(value) {
  if (value == null || value === '') return null
  try {
    return new Date(value).toLocaleString('ko-KR')
  } catch {
    return null
  }
}

function ParagraphLibrary() {
  const [sets, setSets] = useState([])
  const [folders, setFolders] = useState([])
  const [folderFilter, setFolderFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = folderFilter === '' ? {} : { folderId: Number(folderFilter) }
      const setList = await getParagraphSets(params)
      setSets(Array.isArray(setList) ? setList : [])
    } catch (fetchError) {
      console.error(fetchError)
      setSets([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [folderFilter])

  useEffect(() => {
    load()
  }, [load])

  const sortedSets = useMemo(() => {
    return [...sets].sort((a, b) => {
      const ao = a.displayOrder ?? 0
      const bo = b.displayOrder ?? 0
      return ao - bo
    })
  }, [sets])

  const folderOptions = useMemo(() => {
    return [...folders].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  }, [folders])

  return (
    <section className="container sectionSpacing">
      <div className="introCard" role="region" aria-label="문단 Ebook 라이브러리">
        <h2>문단 Ebook 라이브러리</h2>
        <p className="paragraphLibraryHint">긴 문단을 Ebook처럼 읽고 듣는 학습 자료를 관리합니다.</p>
      </div>

      <div className="introCard libraryCreateSection">
        <div className="libraryModeTabs" role="tablist" aria-label="학습 유형">
          <Link to="/library" className="libraryModeTab">
            문장 카드 학습
          </Link>
          <span className="libraryModeTab libraryModeTab--active" aria-current="page">
            문단 Ebook 학습
          </span>
        </div>
        <div className="libraryTopActions">
          <Link to="/library/paragraph-sets/new" className="primaryButton libraryCreateSetLink">
            새 문단 세트 만들기
          </Link>
        </div>
        {folderOptions.length > 0 ? (
          <div className="uiField paragraphFolderFilter">
            <label className="uiFieldLabel" htmlFor="paragraph-folder-filter">
              폴더 필터
            </label>
            <select
              id="paragraph-folder-filter"
              className="uiInput createSetSelect"
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
            >
              <option value="">전체</option>
              {folderOptions.map((f) => (
                <option key={f.folderId} value={String(f.folderId)}>
                  {f.folderName}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className="libraryStatusText">문단 세트를 불러오는 중입니다.</p>
      ) : error ? (
        <p className="libraryStatusText">문단 세트 목록을 불러오지 못했습니다.</p>
      ) : sortedSets.length === 0 ? (
        <p className="libraryStatusText">아직 만든 문단 세트가 없습니다.</p>
      ) : (
        <div className="cardGrid">
          {sortedSets.map((set) => (
            <article key={set.paragraphSetId} className="learningCard librarySetCard paragraphSetCard">
              <div className="librarySetCardHead">
                <span className="libraryFolderIcon" aria-hidden="true">
                  📖
                </span>
                <h3>{set.setName}</h3>
              </div>
              {set.description ? <p className="paragraphSetCardDesc">{set.description}</p> : null}
              <div className="librarySetMeta">
                <span className="librarySentenceFolder">
                  {set.folderName ? `폴더: ${set.folderName}` : '폴더 없음'}
                </span>
                {set.paragraphCount != null ? (
                  <span className="librarySetMetaItem">문단 {set.paragraphCount}개</span>
                ) : null}
                {formatWhen(set.updatedAt) ? (
                  <span className="librarySetMetaItem">수정 {formatWhen(set.updatedAt)}</span>
                ) : formatWhen(set.createdAt) ? (
                  <span className="librarySetMetaItem">생성 {formatWhen(set.createdAt)}</span>
                ) : null}
              </div>
              <div className="paragraphSetCardActions">
                <Link
                  to={`/library/paragraph-sets/${set.paragraphSetId}`}
                  className="uiButton uiButton--secondary paragraphSetCardBtn"
                >
                  내용 관리
                </Link>
                <Link
                  to={`/study/paragraph-sets/${set.paragraphSetId}`}
                  className="primaryButton paragraphSetCardBtn"
                >
                  읽기 시작
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ParagraphLibrary
