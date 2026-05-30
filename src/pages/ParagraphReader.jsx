import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiBaseUrl } from '../api/baseUrl.js'
import { getParagraphSet } from '../api/paragraphSetApi.js'
import { getParagraphsBySet } from '../api/paragraphApi.js'
import { getParagraphAudio } from '../api/paragraphAudioApi.js'

function getFullAudioUrl(audioUrl) {
  if (!audioUrl) return ''
  if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) return audioUrl
  const base = getApiBaseUrl().replace(/\/$/, '')
  if (audioUrl.startsWith('/')) return `${base}${audioUrl}`
  return `${base}/${audioUrl}`
}

function ParagraphReader() {
  const { paragraphSetId: setIdParam } = useParams()
  const setIdNum = Number(setIdParam)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [setMeta, setSetMeta] = useState(null)
  const [paragraphs, setParagraphs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  const [audioStateByParagraphId, setAudioStateByParagraphId] = useState({})
  const audioRef = useRef(null)

  useEffect(() => {
    if (!setIdValid) return
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(false)
      try {
        const [meta, list] = await Promise.all([getParagraphSet(setIdNum), getParagraphsBySet(setIdNum)])
        if (!alive) return
        setSetMeta(meta)
        setParagraphs(Array.isArray(list) ? list : [])
        setCurrentIndex(0)
        setShowBack(false)
      } catch (e) {
        console.error(e)
        if (!alive) return
        setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [setIdNum, setIdValid])

  const currentParagraph = paragraphs[currentIndex] ?? null
  const totalPages = paragraphs.length

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [currentIndex])

  const goToPage = useCallback(
    (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= totalPages) return
      setCurrentIndex(nextIndex)
      setShowBack(false)
      setFadeKey((k) => k + 1)
    },
    [totalPages],
  )

  const handleToggleSide = () => {
    setShowBack((prev) => !prev)
    setFadeKey((k) => k + 1)
  }

  const handlePlayAudio = async () => {
    if (!currentParagraph) return
    const entry = audioStateByParagraphId[currentParagraph.paragraphId]
    const url = getFullAudioUrl(entry?.audioUrl)
    if (!url) return
    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audioRef.current = audio
      await audio.play()
    } catch (e) {
      console.error(e)
    }
  }

  const currentAudio = currentParagraph
    ? audioStateByParagraphId[currentParagraph.paragraphId]
    : null
  const hasAudio = currentAudio?.status === 'done' && currentAudio?.audioUrl

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
    <section className="paragraphReaderPage">
      <header className="paragraphReaderHeader">
        <Link to={`/library/paragraph-sets/${setIdNum}`} className="textLink paragraphReaderBack">
          ← 뒤로
        </Link>
        <h1 className="paragraphReaderTitle">{setMeta?.setName ?? '문단 Ebook'}</h1>
        <span className="paragraphReaderPageIndicator">
          {totalPages > 0 ? `${currentIndex + 1} / ${totalPages}` : '0 / 0'}
        </span>
      </header>

      {loading ? (
        <p className="libraryStatusText paragraphReaderStatus">불러오는 중입니다.</p>
      ) : error ? (
        <p className="libraryStatusText paragraphReaderStatus">문단을 불러오지 못했습니다.</p>
      ) : totalPages === 0 ? (
        <p className="libraryStatusText paragraphReaderStatus">표시할 문단이 없습니다.</p>
      ) : (
        <>
          <div
            key={fadeKey}
            className="paragraphReaderPageCard"
            role="button"
            tabIndex={0}
            onClick={handleToggleSide}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleToggleSide()
              }
            }}
            aria-label={showBack ? '아랍어 문단 — 터치하면 한국어로 전환' : '한국어 문단 — 터치하면 아랍어로 전환'}
          >
            <p className="paragraphReaderSideHint">{showBack ? '아랍어' : '한국어'} · 터치하여 전환</p>
            <div
              className={`paragraphReaderBody paragraphReaderBody--fade ${showBack ? 'paragraphReaderBody--ar' : 'paragraphReaderBody--ko'}`}
              dir={showBack ? 'rtl' : 'ltr'}
            >
              {showBack ? currentParagraph.backText : currentParagraph.frontText}
            </div>
          </div>

          <footer className="paragraphReaderFooter">
            <button
              type="button"
              className="paragraphReaderNavBtn"
              disabled={currentIndex <= 0}
              onClick={(e) => {
                e.stopPropagation()
                goToPage(currentIndex - 1)
              }}
              aria-label="이전 페이지"
            >
              ‹
            </button>

            <button
              type="button"
              className="paragraphReaderAudioBtn"
              disabled={!hasAudio}
              onClick={(e) => {
                e.stopPropagation()
                handlePlayAudio()
              }}
              aria-label={hasAudio ? '아랍어 음성 재생' : '음성 없음'}
            >
              {hasAudio ? '▶ 재생' : '음성 없음'}
            </button>

            <button
              type="button"
              className="paragraphReaderNavBtn"
              disabled={currentIndex >= totalPages - 1}
              onClick={(e) => {
                e.stopPropagation()
                goToPage(currentIndex + 1)
              }}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </footer>
        </>
      )}
    </section>
  )
}

export default ParagraphReader
