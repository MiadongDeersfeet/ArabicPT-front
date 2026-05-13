import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSet } from '../api/sentenceSetApi.js'
import { createSentence, deleteSentence, getSentencesBySet, updateSentence } from '../api/sentenceApi.js'
import { generateSentenceAudio, getSentenceAudio } from '../api/audioApi.js'

const DUMMY_AUTHOR = 'noorismee'

const FRONT_LANG = 'ko'
const BACK_LANG = 'ar'

function makeDraftId() {
  return `draft-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

function emptyDraft() {
  return { id: makeDraftId(), frontText: '', backText: '', memo: '' }
}

function validateDraftCards(drafts) {
  const partialLines = []
  const valid = []

  drafts.forEach((card, index) => {
    const front = card.frontText.trim()
    const back = card.backText.trim()
    const memoTrim = (card.memo ?? '').trim()
    const empty = !front && !back && !memoTrim
    if (empty) return
    if (!front || !back) {
      partialLines.push(index + 1)
    } else {
      valid.push({ front, back, memo: memoTrim })
    }
  })

  if (partialLines.length > 0) {
    return {
      ok: false,
      message: `추가 카드 ${partialLines.join(', ')}번: 앞면(문장)과 뒷면(뜻)을 모두 입력해 주세요.`,
    }
  }

  if (valid.length === 0) {
    return {
      ok: false,
      message: '앞면과 뒷면이 모두 입력된 카드를 최소 1개 작성한 뒤 저장해 주세요.',
    }
  }

  return { ok: true, rows: valid }
}

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
  const [draftCards, setDraftCards] = useState(() => [emptyDraft()])
  const [savingNewSentences, setSavingNewSentences] = useState(false)
  const [addSentenceError, setAddSentenceError] = useState('')
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

  const addDraftRow = () => {
    setDraftCards((prev) => [...prev, emptyDraft()])
  }

  const removeDraftRow = (id) => {
    setDraftCards((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((c) => c.id !== id)
    })
  }

  const updateDraftRow = (id, field, value) => {
    setDraftCards((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const handleSaveNewSentences = async () => {
    if (!setIdValid || savingNewSentences) return
    const validation = validateDraftCards(draftCards)
    if (!validation.ok) {
      setAddSentenceError(validation.message)
      return
    }
    setAddSentenceError('')
    setSavingNewSentences(true)
    try {
      const created = []
      for (const row of validation.rows) {
        const s = await createSentence(setIdNum, {
          frontLang: FRONT_LANG,
          frontText: row.front,
          backLang: BACK_LANG,
          backText: row.back,
          memo: row.memo === '' ? null : row.memo,
        })
        created.push(s)
      }

      setSentences((prev) => [...prev, ...created])
      setAudioStateBySentenceId((prev) => {
        const next = { ...prev }
        for (const s of created) {
          next[s.sentenceId] = { status: 'none', audioUrl: null }
        }
        return next
      })
      setModifiedSentenceMap((prev) => {
        const next = { ...prev }
        for (const s of created) {
          next[s.sentenceId] = false
        }
        return next
      })
      setSetMeta((prev) =>
        prev
          ? {
              ...prev,
              sentenceCount: (prev.sentenceCount ?? 0) + created.length,
            }
          : prev,
      )
      setDraftCards([emptyDraft()])
    } catch (e) {
      console.error(e)
      setAddSentenceError(
        e?.response?.data?.message ??
          e?.response?.data?.data?.reason ??
          e?.message ??
          '문장 추가 중 오류가 발생했습니다.',
      )
    } finally {
      setSavingNewSentences(false)
    }
  }

  const handleDeleteSentence = async () => {
    if (!deleteTargetSentence || deletingSentence) return
    const sentenceId = deleteTargetSentence.sentenceId
    const nextSentenceCount = sentences.length - 1
    setDeletingSentence(true)
    try {
      await deleteSentence(sentenceId)
      setSentences((prev) => prev.filter((row) => row.sentenceId !== sentenceId))
      setSetMeta((prev) =>
        prev ? { ...prev, sentenceCount: Math.max(0, nextSentenceCount) } : prev,
      )
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
        ) : (
          <>
            <div className="librarySetAddSection introCard">
              <h4 className="librarySectionTitle">새 카드 추가</h4>
              <p className="libraryCreateHint">
                아래에 문장을 입력한 뒤 &quot;세트에 저장&quot;을 누르면 이 세트에 추가됩니다. 저장된 줄에서는
                바로 아래처럼 &quot;음성 생성&quot;으로 오디오를 만들 수 있습니다.
              </p>
              <ul className="createSetCardList">
                {draftCards.map((card, index) => (
                  <li key={card.id} className="createSetCard">
                    <div className="createSetCardToolbar">
                      <span className="createSetCardNumber">{index + 1}</span>
                      <button
                        type="button"
                        className="createSetCardRemove"
                        onClick={() => removeDraftRow(card.id)}
                        disabled={draftCards.length <= 1 || savingNewSentences}
                        aria-label={`추가 카드 ${index + 1} 입력 행 삭제`}
                      >
                        삭제
                      </button>
                    </div>
                    <div className="createSetCardFields">
                      <label className="uiFieldLabel">문장 (앞면)</label>
                      <textarea
                        className="uiInput libraryTextarea"
                        rows={2}
                        value={card.frontText}
                        onChange={(e) => updateDraftRow(card.id, 'frontText', e.target.value)}
                        disabled={savingNewSentences}
                      />
                      <label className="uiFieldLabel">뜻 (뒷면)</label>
                      <textarea
                        className="uiInput libraryTextarea"
                        rows={2}
                        value={card.backText}
                        onChange={(e) => updateDraftRow(card.id, 'backText', e.target.value)}
                        disabled={savingNewSentences}
                      />
                      <label className="uiFieldLabel">메모 (선택)</label>
                      <input
                        className="uiInput"
                        value={card.memo}
                        onChange={(e) => updateDraftRow(card.id, 'memo', e.target.value)}
                        disabled={savingNewSentences}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="librarySetAddActions">
                <button
                  type="button"
                  className="headerGhostButton"
                  onClick={addDraftRow}
                  disabled={savingNewSentences}
                >
                  + 입력 행 추가
                </button>
                <button
                  type="button"
                  className="primaryButton"
                  onClick={handleSaveNewSentences}
                  disabled={savingNewSentences || savingEdit}
                >
                  {savingNewSentences ? '저장 중…' : '세트에 저장'}
                </button>
              </div>
              {addSentenceError ? (
                <p className="libraryFormError" role="alert">
                  {addSentenceError}
                </p>
              ) : null}
            </div>

            {sentences.length === 0 ? (
              <p className="libraryStatusText">
                아직 이 세트에 저장된 문장이 없습니다. 위에서 카드를 추가해 보세요.
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
          </>
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
