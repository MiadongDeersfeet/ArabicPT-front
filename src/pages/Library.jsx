import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSets } from '../api/sentenceSetApi.js'

function formatWhen(value) {
  if (value == null || value === '') return null
  try {
    return new Date(value).toLocaleString('ko-KR')
  } catch {
    return null
  }
}

function Library() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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

  const sortedSets = useMemo(() => {
    return [...sets].sort((a, b) => {
      const ao = a.displayOrder ?? 0
      const bo = b.displayOrder ?? 0
      return ao - bo
    })
  }, [sets])

  return (
    <section className="container sectionSpacing">
      <div className="introCard" role="region" aria-label="라이브러리">
        <h2>내 라이브러리</h2>
        <div className="libraryModeTabs" role="tablist" aria-label="학습 유형">
          <span className="libraryModeTab libraryModeTab--active" aria-current="page">
            문장 카드 학습
          </span>
          <Link to="/library/paragraph-sets" className="libraryModeTab">
            문단 Ebook 학습
          </Link>
        </div>
      </div>

      <div className="introCard libraryCreateSection">
        <div className="libraryTopActions">
          <Link to="/library/sets/new" className="primaryButton libraryCreateSetLink">
            새 문장 세트 만들기
          </Link>
          <Link to="/library/folders" className="textLink">
            폴더 페이지로 이동
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="libraryStatusText">문장 세트를 불러오는 중입니다.</p>
      ) : error ? (
        <p className="libraryStatusText">문장 세트 목록을 불러오지 못했습니다.</p>
      ) : sortedSets.length === 0 ? (
        <p className="libraryStatusText">아직 만든 문장 세트가 없습니다.</p>
      ) : (
        <div className="cardGrid">
          {sortedSets.map((set) => (
            <Link key={set.setId} to={`/library/sets/${set.setId}`} className="librarySetCardLink">
              <article className="learningCard librarySetCard">
                <div className="librarySetCardHead">
                  <span className="libraryFolderIcon" aria-hidden="true">
                    📚
                  </span>
                  <h3>{set.setName}</h3>
                </div>
                {set.description ? <p>{set.description}</p> : null}
                <div className="librarySetMeta">
                  {set.folderName ? (
                    <span className="librarySentenceFolder">폴더: {set.folderName}</span>
                  ) : null}
                  {set.sentenceCount != null ? (
                    <span className="librarySetMetaItem">문장 {set.sentenceCount}개</span>
                  ) : null}
                  {formatWhen(set.updatedAt) ? (
                    <span className="librarySetMetaItem">수정 {formatWhen(set.updatedAt)}</span>
                  ) : formatWhen(set.createdAt) ? (
                    <span className="librarySetMetaItem">생성 {formatWhen(set.createdAt)}</span>
                  ) : null}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

    </section>
  )
}

export default Library
