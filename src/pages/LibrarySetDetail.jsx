import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSet } from '../api/sentenceSetApi.js'
import { deleteSentence, getSentencesBySet, updateSentence } from '../api/sentenceApi.js'
import { generateSentenceAudio, getSentenceAudio } from '../api/audioApi.js'

const DUMMY_AUTHOR = 'noorismee'

function LibrarySetDetail() {
  const { setId: setIdParam } = useParams()
  const setIdNum = Number(setIdParam)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [setMeta, setSetMeta] = useState(null)
  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [audioStateBySentenceId, setAudioStateBySentenceId] = useState({})
  const [modifiedSentenceMap, setModifiedSentenceMap] = useState({})
  const [editingSentenceId, setEditingSentenceId] = useState(null)
  const [editingFrontText, setEditingFrontText] = useState('')
  const [editingBackText, setEditingBackText] = useState('')
  const [editingMemo, setEditingMemo] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteTargetSentence, setDeleteTargetSentence] = useState(null)
  const [deletingSentence, setDeletingSentence] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragStartXRef = useRef(0)
  const dragDiffXRef = useRef(0)

  useEffect(() => {
    if (!setIdValid) return
    let alive = true
    ;(async () => {
      setLoading(true)
      setListError(false)
      try {
        const [meta, list] = await Promise.all([getSet(setIdNum), getSentencesBySet(setIdNum)])
        if (!alive) return
        setSetMeta(meta)
        setSentences(Array.isArray(list) ? list : [])
        setActiveSlide(0)
      } catch (e) {
        console.error(e)
        if (!alive) return
        setSetMeta(null)
        setSentences([])
        setListError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [setIdNum, setIdValid])

  const visibleSlides = useMemo(() => sentences.slice(0, 8), [sentences])
  const wordCount = setMeta?.sentenceCount ?? sentences.length
  const backendBaseUrl = ''

  useEffect(() => {
    if (sentences.length === 0) {
      setAudioStateBySentenceId({})
      setModifiedSentenceMap({})
      return
    }

    let alive = true
    ;(async () => {
      const entries = await Promise.all(
        sentences.map(async (sentence) => {
          try {
            const audio = await getSentenceAudio(sentence.sentenceId)
            if (audio?.audioUrl) {
              return [sentence.sentenceId, { status: 'done', audioUrl: audio.audioUrl }]
            }
            return [sentence.sentenceId, { status: 'none', audioUrl: null }]
          } catch {
            return [sentence.sentenceId, { status: 'none', audioUrl: null }]
          }
        }),
      )

      if (!alive) return
      setAudioStateBySentenceId(Object.fromEntries(entries))
      setModifiedSentenceMap((prev) => {
        const next = {}
        for (const sentence of sentences) {
          next[sentence.sentenceId] = Boolean(prev[sentence.sentenceId])
        }
        return next
      })
    })()

    return () => {
      alive = false
    }
  }, [sentences])

  const moveSlide = (delta) => {
    if (visibleSlides.length === 0) return
    setActiveSlide((prev) => {
      const next = prev + delta
      if (next < 0) return visibleSlides.length - 1
      if (next >= visibleSlides.length) return 0
      return next
    })
  }

  const handleSlidePointerDown = (event) => {
    if (visibleSlides.length <= 1) return
    dragStartXRef.current = event.clientX
    dragDiffXRef.current = 0
    setDragging(true)
  }

  const handleSlidePointerMove = (event) => {
    if (!dragging) return
    dragDiffXRef.current = event.clientX - dragStartXRef.current
  }

  const handleSlidePointerEnd = () => {
    if (!dragging) return
    const threshold = 40
    const movedX = dragDiffXRef.current
    if (movedX <= -threshold) {
      moveSlide(1)
    } else if (movedX >= threshold) {
      moveSlide(-1)
    }
    setDragging(false)
    dragDiffXRef.current = 0
  }

  const getFullAudioUrl = (audioUrl) => {
    if (!audioUrl) return ''
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl
    }
    return `${backendBaseUrl}${audioUrl}`
  }

  const handleGenerateAudio = async (sentenceId) => {
    setAudioStateBySentenceId((prev) => ({
      ...prev,
      [sentenceId]: { ...(prev[sentenceId] ?? {}), status: 'loading' },
    }))
    try {
      const created = await generateSentenceAudio(sentenceId)
      setAudioStateBySentenceId((prev) => ({
        ...prev,
        [sentenceId]: {
          status: created?.audioUrl ? 'done' : 'error',
          audioUrl: created?.audioUrl ?? null,
        },
      }))
      if (created?.audioUrl) {
        setModifiedSentenceMap((prev) => ({ ...prev, [sentenceId]: false }))
      }
    } catch {
      setAudioStateBySentenceId((prev) => ({
        ...prev,
        [sentenceId]: { ...(prev[sentenceId] ?? {}), status: 'error' },
      }))
    }
  }

  const handlePlayAudio = async (sentenceId) => {
    const entry = audioStateBySentenceId[sentenceId]
    const fullUrl = getFullAudioUrl(entry?.audioUrl)
    if (!fullUrl) return
    try {
      const audio = new Audio(fullUrl)
      await audio.play()
    } catch {
      setAudioStateBySentenceId((prev) => ({
        ...prev,
        [sentenceId]: { ...(prev[sentenceId] ?? {}), status: 'error' },
      }))
    }
  }

  const startEditingSentence = (sentence) => {
    setEditingSentenceId(sentence.sentenceId)
    setEditingFrontText(sentence.frontText ?? '')
    setEditingBackText(sentence.backText ?? '')
    setEditingMemo(sentence.memo ?? '')
  }

  const cancelEditingSentence = () => {
    if (savingEdit) return
    setEditingSentenceId(null)
  }

  const handleSaveSentenceEdit = async (sentenceId) => {
    if (savingEdit) return
    const nextFront = editingFrontText.trim()
    const nextBack = editingBackText.trim()
    if (!nextFront || !nextBack) return

    setSavingEdit(true)
    try {
      const updated = await updateSentence(sentenceId, {
        frontText: nextFront,
        backText: nextBack,
        memo: editingMemo,
      })

      setSentences((prev) =>
        prev.map((row) =>
          row.sentenceId === sentenceId
            ? {
                ...row,
                frontText: updated?.frontText ?? nextFront,
                backText: updated?.backText ?? nextBack,
                memo: updated?.memo ?? editingMemo,
              }
            : row,
        ),
      )
      setAudioStateBySentenceId((prev) => ({
        ...prev,
        [sentenceId]: { status: 'none', audioUrl: null },
      }))
      setModifiedSentenceMap((prev) => ({ ...prev, [sentenceId]: true }))
      setEditingSentenceId(null)
    } catch (error) {
      console.error(error)
      window.alert('문장 수정에 실패했습니다.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteSentence = async () => {
    if (!deleteTargetSentence || deletingSentence) return
    const sentenceId = deleteTargetSentence.sentenceId
    setDeletingSentence(true)
    try {
      await deleteSentence(sentenceId)
      setSentences((prev) => prev.filter((row) => row.sentenceId !== sentenceId))
      setAudioStateBySentenceId((prev) => {
        const next = { ...prev }
        delete next[sentenceId]
        return next
      })
      setModifiedSentenceMap((prev) => {
        const next = { ...prev }
        delete next[sentenceId]
        return next
      })
      if (editingSentenceId === sentenceId) {
        setEditingSentenceId(null)
      }
      setDeleteTargetSentence(null)
    } catch (error) {
      console.error(error)
      window.alert('문장 삭제에 실패했습니다.')
    } finally {
      setDeletingSentence(false)
    }
  }

  if (!setIdValid) {
    return (
      <section className="container sectionSpacing">
        <div className="introCard">
          <h2>잘못된 주소입니다</h2>
          <Link to="/library" className="textLink">
            ← 라이브러리로
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="container sectionSpacing librarySetViewPage">
      <div className="librarySetTopBar">
        <Link to="/library" className="textLink librarySetTopLink">
          ← 라이브러리
        </Link>
        <Link to={`/study/sets/${setIdNum}`} className="primaryButton librarySetTopStudyButton">
          학습하기
        </Link>
      </div>

      <section className="librarySetSlideSection">
        {loading ? (
          <p className="libraryStatusText">불러오는 중입니다.</p>
        ) : listError ? (
          <p className="libraryStatusText">불러오지 못했습니다.</p>
        ) : visibleSlides.length === 0 ? (
          <p className="libraryStatusText">표시할 문장이 없습니다.</p>
        ) : (
          <div className="librarySetSlideWrap">
            <article
              className={dragging ? 'librarySetSlideCard isDragging' : 'librarySetSlideCard'}
              onPointerDown={handleSlidePointerDown}
              onPointerMove={handleSlidePointerMove}
              onPointerUp={handleSlidePointerEnd}
              onPointerCancel={handleSlidePointerEnd}
              onPointerLeave={handleSlidePointerEnd}
              aria-label="문장 카드 슬라이드"
            >
              <p className="librarySetSlideFront" dir="auto">
                {visibleSlides[activeSlide]?.frontText}
              </p>
            </article>
          </div>
        )}
        <div className="librarySetDots" aria-hidden="true">
          {visibleSlides.map((_, index) => (
            <span
              key={`dot-${index}`}
              className={index === activeSlide ? 'librarySetDot isActive' : 'librarySetDot'}
            />
          ))}
        </div>
      </section>

      <section className="librarySetMiddleSpacer" aria-hidden="true" />

      <section className="librarySetMetaSection introCard">
        <h2>{setMeta?.setName ?? '문장 세트'}</h2>
        <div className="librarySetAuthorRow">
          <span className="librarySetAuthorAvatar" aria-hidden="true">
            🌊
          </span>
          <span className="librarySetAuthorName">{DUMMY_AUTHOR}</span>
          <span className="librarySetAuthorDivider" aria-hidden="true" />
          <span className="librarySetWordCount">{wordCount} 단어</span>
        </div>
      </section>

      <div className="librarySentenceBlock">
        <h3 className="librarySectionTitle">앞/뒷면 문장</h3>
        {loading ? (
          <p className="libraryStatusText">불러오는 중입니다.</p>
        ) : listError ? (
          <p className="libraryStatusText">불러오지 못했습니다.</p>
        ) : sentences.length === 0 ? (
          <p className="libraryStatusText">
            아직 이 세트에 문장이 없습니다. 첫 문장을 추가해보세요.
          </p>
        ) : (
          <ul className="librarySentenceList">
            {sentences.map((sentence) => (
              <li key={sentence.sentenceId} className="librarySentenceRow librarySentenceRow--showcase">
                <div className="librarySentenceCardActionRow">
                  <button
                    type="button"
                    className="librarySentenceIconButton"
                    aria-label="문장 수정"
                    onClick={() => startEditingSentence(sentence)}
                    disabled={savingEdit}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="librarySentenceIcon">
                      <path
                        d="M12 20h9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.5 3.5a2.12 2.12 0 1 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="librarySentenceIconButton"
                    aria-label="문장 삭제"
                    onClick={() => setDeleteTargetSentence(sentence)}
                    disabled={savingEdit || deletingSentence}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="librarySentenceIcon">
                      <path
                        d="M3 6h18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6V4h8v2M6 6l1 14h10l1-14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 10v6M14 10v6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {editingSentenceId === sentence.sentenceId ? (
                  <div className="librarySentenceEditBlock">
                    <label className="uiFieldLabel">문장</label>
                    <textarea
                      className="uiInput libraryTextarea"
                      rows={2}
                      value={editingFrontText}
                      onChange={(event) => setEditingFrontText(event.target.value)}
                    />
                    <label className="uiFieldLabel">뜻</label>
                    <textarea
                      className="uiInput libraryTextarea"
                      rows={2}
                      value={editingBackText}
                      onChange={(event) => setEditingBackText(event.target.value)}
                    />
                    <label className="uiFieldLabel">메모</label>
                    <input
                      className="uiInput"
                      value={editingMemo}
                      onChange={(event) => setEditingMemo(event.target.value)}
                    />
                    <div className="librarySentenceEditActions">
                      <button
                        type="button"
                        className="libraryAudioButton"
                        onClick={() => handleSaveSentenceEdit(sentence.sentenceId)}
                        disabled={savingEdit}
                      >
                        {savingEdit ? '저장 중...' : '저장'}
                      </button>
                      <button
                        type="button"
                        className="libraryAudioButton"
                        onClick={cancelEditingSentence}
                        disabled={savingEdit}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="librarySentenceFront" dir="auto">
                      {sentence.frontText}
                    </p>
                    <p className="librarySentenceBack" dir="auto">
                      {sentence.backText}
                    </p>
                    {sentence.memo ? <p className="librarySentenceMemo">메모: {sentence.memo}</p> : null}
                  </>
                )}
                <div className="librarySentenceAudioRow">
                  {audioStateBySentenceId[sentence.sentenceId]?.status === 'loading' ? (
                    <button type="button" className="libraryAudioButton" disabled>
                      생성 중...
                    </button>
                  ) : audioStateBySentenceId[sentence.sentenceId]?.status === 'done' ? (
                    <>
                      <span className="libraryAudioDone" aria-label="오디오 생성 완료">
                        ✓
                      </span>
                      <button
                        type="button"
                        className="libraryAudioButton"
                        onClick={() => handlePlayAudio(sentence.sentenceId)}
                      >
                        재생
                      </button>
                      {modifiedSentenceMap[sentence.sentenceId] ? (
                        <button
                          type="button"
                          className="libraryAudioButton"
                          onClick={() => handleGenerateAudio(sentence.sentenceId)}
                        >
                          다시 생성
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      className="libraryAudioButton"
                      onClick={() => handleGenerateAudio(sentence.sentenceId)}
                    >
                      {modifiedSentenceMap[sentence.sentenceId]
                        ? '다시 생성'
                        : audioStateBySentenceId[sentence.sentenceId]?.status === 'error'
                          ? '다시 생성'
                          : '음성 생성'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {deleteTargetSentence ? (
        <div
          className="libraryModalOverlay"
          role="presentation"
          onClick={() => !deletingSentence && setDeleteTargetSentence(null)}
        >
          <div
            className="libraryModal libraryDeleteModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sentence-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="sentence-delete-title" className="libraryModalTitle">
              문장을 삭제할까요?
            </h3>
            <p className="libraryDeleteModalText">삭제한 문장은 복구할 수 없습니다.</p>
            <p className="libraryDeleteModalPreview" dir="auto">
              {deleteTargetSentence.frontText}
            </p>
            <div className="libraryModalActions">
              <button
                type="button"
                className="libraryDangerButton"
                onClick={handleDeleteSentence}
                disabled={deletingSentence}
              >
                {deletingSentence ? '삭제 중...' : '삭제'}
              </button>
              <button
                type="button"
                className="headerGhostButton"
                onClick={() => !deletingSentence && setDeleteTargetSentence(null)}
                disabled={deletingSentence}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default LibrarySetDetail
