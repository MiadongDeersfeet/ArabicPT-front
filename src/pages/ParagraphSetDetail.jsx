import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiBaseUrl } from '../api/baseUrl.js'
import { deleteParagraphSet, getParagraphSet } from '../api/paragraphSetApi.js'
import { getParagraphsBySet } from '../api/paragraphApi.js'
import { createParagraphAudio, getParagraphAudio } from '../api/paragraphAudioApi.js'
import { previewText } from '../lib/paragraphCardDraft.js'

function getFullAudioUrl(audioUrl) {
  if (!audioUrl) return ''
  if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) return audioUrl
  const base = getApiBaseUrl().replace(/\/$/, '')
  if (audioUrl.startsWith('/')) return `${base}${audioUrl}`
  return `${base}/${audioUrl}`
}

function ParagraphSetDetail() {
  const navigate = useNavigate()
  const { paragraphSetId: setIdParam } = useParams()
  const setIdNum = Number(setIdParam)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [setMeta, setSetMeta] = useState(null)
  const [paragraphs, setParagraphs] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(false)
  const [audioStateByParagraphId, setAudioStateByParagraphId] = useState({})
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!setIdValid) return
    setLoading(true)
    setListError(false)
    try {
      const [meta, list] = await Promise.all([getParagraphSet(setIdNum), getParagraphsBySet(setIdNum)])
      setSetMeta(meta)
      setParagraphs(Array.isArray(list) ? list : [])
    } catch (e) {
      console.error(e)
      setListError(true)
      setParagraphs([])
    } finally {
      setLoading(false)
    }
  }, [setIdNum, setIdValid])

  useEffect(() => {
    load()
  }, [load])

  const paragraphIdsKey = useMemo(
    () =>
      paragraphs
        .map((p) => p.paragraphId)
        .filter(Boolean)
        .join(','),
    [paragraphs],
  )

  useEffect(() => {
    const ids = paragraphIdsKey === '' ? [] : paragraphIdsKey.split(',').map(Number)
    if (ids.length === 0) {
      setAudioStateByParagraphId({})
      return
    }
    let alive = true
    ;(async () => {
      const entries = await Promise.all(
        ids.map(async (paragraphId) => {
          try {
            const audio = await getParagraphAudio(paragraphId)
            if (audio?.audioUrl) {
              return [paragraphId, { status: 'done', audioUrl: audio.audioUrl }]
            }
            return [paragraphId, { status: 'none', audioUrl: null }]
          } catch {
            return [paragraphId, { status: 'none', audioUrl: null }]
          }
        }),
      )
      if (alive) setAudioStateByParagraphId(Object.fromEntries(entries))
    })()
    return () => {
      alive = false
    }
  }, [paragraphIdsKey])

  const handleGenerateAudio = async (paragraphId) => {
    setAudioStateByParagraphId((prev) => ({
      ...prev,
      [paragraphId]: { ...(prev[paragraphId] ?? {}), status: 'loading' },
    }))
    try {
      const created = await createParagraphAudio(paragraphId)
      setAudioStateByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: {
          status: created?.audioUrl ? 'done' : 'error',
          audioUrl: created?.audioUrl ?? null,
        },
      }))
    } catch {
      setAudioStateByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: { ...(prev[paragraphId] ?? {}), status: 'error' },
      }))
    }
  }

  const handlePlayAudio = async (paragraphId) => {
    const entry = audioStateByParagraphId[paragraphId]
    const url = getFullAudioUrl(entry?.audioUrl)
    if (!url) return
    try {
      const audio = new Audio(url)
      await audio.play()
    } catch {
      setAudioStateByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: { ...(prev[paragraphId] ?? {}), status: 'error' },
      }))
    }
  }

  const handleDeleteSet = async () => {
    if (!setIdValid || deleting) return
    if (!window.confirm('이 문단 세트를 삭제할까요? 포함된 문단도 함께 삭제됩니다.')) return
    setDeleting(true)
    try {
      await deleteParagraphSet(setIdNum)
      navigate('/library/paragraph-sets', { replace: true })
    } catch (e) {
      console.error(e)
      window.alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (!setIdValid) {
    return (
      <section className="container sectionSpacing">
        <div className="introCard">
          <h2>잘못된 주소입니다</h2>
          <Link to="/library/paragraph-sets" className="textLink">
            ← 문단 라이브러리로
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="container sectionSpacing paragraphSetDetailPage">
      <div className="librarySetTopBar">
        <Link to="/library/paragraph-sets" className="textLink">
          ← 문단 라이브러리
        </Link>
        <div className="librarySetTopActions">
          <Link to={`/study/paragraph-sets/${setIdNum}`} className="primaryButton">
            읽기 시작
          </Link>
          <Link to={`/library/paragraph-sets/${setIdNum}/edit`} className="uiButton uiButton--secondary">
            편집
          </Link>
          <button type="button" className="librarySetDeleteBtn" onClick={handleDeleteSet} disabled={deleting}>
            {deleting ? '삭제 중…' : '삭제'}
          </button>
        </div>
      </div>

      <div className="introCard paragraphSetDetailMeta">
        <h1 className="paragraphSetDetailTitle">{setMeta?.setName ?? '문단 세트'}</h1>
        {setMeta?.description ? <p>{setMeta.description}</p> : null}
        <p className="librarySetMeta">
          <span>{setMeta?.folderName ? `폴더: ${setMeta.folderName}` : '폴더 없음'}</span>
          {setMeta?.paragraphCount != null ? (
            <span className="librarySetMetaItem"> · 문단 {setMeta.paragraphCount}개</span>
          ) : null}
        </p>
      </div>

      {loading ? (
        <p className="libraryStatusText">문단을 불러오는 중입니다.</p>
      ) : listError ? (
        <p className="libraryStatusText">문단 목록을 불러오지 못했습니다.</p>
      ) : paragraphs.length === 0 ? (
        <p className="libraryStatusText">아직 등록된 문단이 없습니다.</p>
      ) : (
        <ul className="paragraphDetailList">
          {paragraphs.map((p, index) => {
            const audioEntry = audioStateByParagraphId[p.paragraphId] ?? { status: 'none' }
            return (
              <li key={p.paragraphId} className="introCard paragraphDetailItem">
                <div className="paragraphDetailItemHead">
                  <span className="paragraphDetailPageNum">페이지 {index + 1}</span>
                  <div className="paragraphDetailAudioActions">
                    {audioEntry.status === 'done' ? (
                      <>
                        <button
                          type="button"
                          className="libraryAudioButton"
                          onClick={() => handlePlayAudio(p.paragraphId)}
                        >
                          재생
                        </button>
                        <button
                          type="button"
                          className="libraryAudioButton libraryAudioButton--secondary"
                          onClick={() => handleGenerateAudio(p.paragraphId)}
                        >
                          재생성
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="libraryAudioButton"
                        disabled={audioEntry.status === 'loading'}
                        onClick={() => handleGenerateAudio(p.paragraphId)}
                      >
                        {audioEntry.status === 'loading' ? '생성 중…' : '음성 생성'}
                      </button>
                    )}
                    {audioEntry.status === 'error' ? (
                      <span className="paragraphAudioError">생성 실패</span>
                    ) : null}
                  </div>
                </div>
                <div className="paragraphDetailPreview">
                  <div className="paragraphDetailPreviewCol" dir="ltr">
                    <span className="paragraphDetailPreviewLabel">한국어</span>
                    <p>{previewText(p.frontText, 200)}</p>
                  </div>
                  <div className="paragraphDetailPreviewCol paragraphDetailPreviewCol--ar" dir="rtl">
                    <span className="paragraphDetailPreviewLabel">아랍어</span>
                    <p>{previewText(p.backText, 200)}</p>
                  </div>
                </div>
                {p.memo ? <p className="paragraphDetailMemo">메모: {p.memo}</p> : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default ParagraphSetDetail
