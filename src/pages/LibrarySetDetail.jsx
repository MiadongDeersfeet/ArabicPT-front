import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMyMemberProfile } from '../api/api.js'
import { getSet } from '../api/sentenceSetApi.js'
import { getSentencesBySet, updateSentence } from '../api/sentenceApi.js'
import { generateSentenceAudio, getSentenceAudio } from '../api/audioApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import SentenceBox from '../components/ui/SentenceBox.jsx'
import StudySettingsMenu from '../components/ui/StudySettingsMenu.jsx'
import { readCardSideReversed, persistCardSideReversed, resolveCardSides } from '../utils/sentenceCardSides.js'

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="librarySetQuizletIconSvg">
      <path
        d="M12 2l2.9 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7-6-4.6h7.1L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="librarySetQuizletIconSvg">
      <path
        d="M11 5L6 9H3v6h3l5 4V5zm8.5 3.5a5 5 0 010 7M17 9a3 3 0 010 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="librarySetQuizletIconSvg">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 113 3L8 18l-4 1 1-4 11.5-11.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LibrarySetDetail() {
  const { auth } = useAuth()
  const { setId: setIdParam } = useParams()
  const setIdNum = Number(setIdParam)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [setMeta, setSetMeta] = useState(null)
  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardSideReversed, setCardSideReversed] = useState(readCardSideReversed)
  const [audioStateBySentenceId, setAudioStateBySentenceId] = useState({})
  const [modifiedSentenceMap, setModifiedSentenceMap] = useState({})
  const [memberProfile, setMemberProfile] = useState(null)

  const [starredIds, setStarredIds] = useState(() => new Set())
  const [editingSentenceId, setEditingSentenceId] = useState(null)
  const [editingFrontText, setEditingFrontText] = useState('')
  const [editingBackText, setEditingBackText] = useState('')
  const [editingMemo, setEditingMemo] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const starStorageKey = useMemo(() => `arabicpt-set-stars-${setIdNum}`, [setIdNum])

  const displayName = useMemo(() => {
    const n = (memberProfile?.name ?? auth?.name ?? '').trim()
    return n || '회원'
  }, [memberProfile?.name, auth?.name])

  const profileImageUrl = useMemo(() => {
    const u = memberProfile?.profileImage
    return u != null && String(u).trim() !== '' ? String(u).trim() : null
  }, [memberProfile?.profileImage])

  useEffect(() => {
    if (!setIdValid) return
    try {
      const raw = localStorage.getItem(starStorageKey)
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) setStarredIds(new Set(arr.map(Number).filter(Number.isFinite)))
      } else {
        setStarredIds(new Set())
      }
    } catch {
      setStarredIds(new Set())
    }
  }, [setIdValid, starStorageKey])

  const persistStars = useCallback(
    (next) => {
      setStarredIds(next)
      try {
        localStorage.setItem(starStorageKey, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
    },
    [starStorageKey],
  )

  const toggleStar = (sentenceId) => {
    const next = new Set(starredIds)
    if (next.has(sentenceId)) next.delete(sentenceId)
    else next.add(sentenceId)
    persistStars(next)
  }

  useEffect(() => {
    if (!auth?.accessToken) {
      setMemberProfile(null)
      return
    }
    let alive = true
    ;(async () => {
      try {
        const p = await fetchMyMemberProfile()
        if (!alive) return
        setMemberProfile({
          name: p?.name ?? '',
          profileImage: p?.profileImage ?? null,
        })
      } catch {
        if (alive) setMemberProfile(null)
      }
    })()
    return () => {
      alive = false
    }
  }, [auth?.accessToken])

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
        setPreviewIndex(0)
        setIsFlipped(false)
        setEditingSentenceId(null)
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

  const toggleCardSideOrder = useCallback(() => {
    setCardSideReversed((prev) => {
      const next = !prev
      persistCardSideReversed(next)
      return next
    })
    setIsFlipped(false)
  }, [])

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  useEffect(() => {
    if (previewIndex >= sentences.length && sentences.length > 0) {
      setPreviewIndex(0)
      setIsFlipped(false)
    }
  }, [previewIndex, sentences.length])

  useEffect(() => {
    const handleSpaceFlip = (event) => {
      const targetTag = event.target?.tagName?.toLowerCase()
      const isEditable =
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        targetTag === 'select' ||
        event.target?.isContentEditable

      if (isEditable) return

      if (event.code === 'Space') {
        event.preventDefault()
        flipCard()
      }
    }

    window.addEventListener('keydown', handleSpaceFlip)
    return () => window.removeEventListener('keydown', handleSpaceFlip)
  }, [flipCard])

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

  const goPreviewPrev = () => {
    if (sentences.length === 0) return
    setIsFlipped(false)
    setPreviewIndex((prev) => (prev === 0 ? sentences.length - 1 : prev - 1))
  }

  const goPreviewNext = () => {
    if (sentences.length === 0) return
    setIsFlipped(false)
    setPreviewIndex((prev) => (prev === sentences.length - 1 ? 0 : prev + 1))
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

  const handleAudioIconClick = (sentenceId) => {
    const st = audioStateBySentenceId[sentenceId]?.status
    if (st === 'done') {
      void handlePlayAudio(sentenceId)
    } else {
      void handleGenerateAudio(sentenceId)
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

  const starredCount = starredIds.size

  const previewSentence =
    sentences.length === 0 ? null : sentences[Math.min(previewIndex, sentences.length - 1)]
  const cardSides = resolveCardSides(previewSentence, cardSideReversed)
  const previewAudioStatus = previewSentence ? audioStateBySentenceId[previewSentence.sentenceId]?.status : undefined

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
        <div className="librarySetTopActions">
          <Link to={`/library/sets/${setIdNum}/edit`} className="headerGhostButton librarySetTopEditButton">
            카드 편집
          </Link>
          <Link to={`/study/sets/${setIdNum}`} className="primaryButton librarySetTopStudyButton">
            학습하기
          </Link>
        </div>
      </div>

      <section className="librarySetSlideSection librarySetPreviewSection">
        {!loading && !listError && sentences.length > 0 ? (
          <div className="librarySetPreviewHeadingRow">
            <h3 className="librarySetPreviewHeading">카드 미리보기</h3>
            <StudySettingsMenu cardSideReversed={cardSideReversed} onToggleCardSide={toggleCardSideOrder} />
          </div>
        ) : null}
        {loading ? (
          <p className="libraryStatusText">불러오는 중입니다.</p>
        ) : listError ? (
          <p className="libraryStatusText">불러오지 못했습니다.</p>
        ) : sentences.length === 0 ? (
          <p className="libraryStatusText">표시할 문장이 없습니다.</p>
        ) : (
          <>
            <div className="librarySetPreviewSentenceWrap">
              <SentenceBox
                className="librarySetPreviewSentenceBox"
                title="문장 세트 카드 미리보기"
                status="미리보기"
                progress={`문장 ${previewIndex + 1} / ${sentences.length}`}
                frontText={cardSides.frontText}
                backText={cardSides.backText}
                frontDir={cardSides.frontDir}
                backDir={cardSides.backDir}
                isFlipped={isFlipped}
                onFlip={flipCard}
                showAudioButton={Boolean(previewSentence)}
                audioButtonDisabled={previewAudioStatus === 'loading'}
                onAudioPlay={() => {
                  if (!previewSentence) return
                  handleAudioIconClick(previewSentence.sentenceId)
                }}
              />
            </div>
            <div className="studyActionRow librarySetPreviewActionRow">
              <button type="button" className="headerGhostButton" onClick={goPreviewPrev}>
                이전 문장
              </button>
              <button type="button" className="headerPrimaryButton" onClick={goPreviewNext}>
                다음 문장
              </button>
            </div>
          </>
        )}
      </section>

      <section className="librarySetMiddleSpacer" aria-hidden="true" />

      <section className="librarySetMetaSection introCard">
        <h2>{setMeta?.setName ?? '문장 세트'}</h2>
        <div className="librarySetAuthorRow">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt=""
              className="librarySetAuthorAvatar librarySetAuthorAvatar--photo"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="librarySetAuthorAvatar" aria-hidden="true">
              🌊
            </span>
          )}
          <span className="librarySetAuthorName">{displayName}</span>
          <span className="librarySetAuthorDivider" aria-hidden="true" />
          <span className="librarySetWordCount">{wordCount} 단어</span>
        </div>
      </section>

      <div className="librarySentenceBlock">
        {loading ? (
          <p className="libraryStatusText">불러오는 중입니다.</p>
        ) : listError ? (
          <p className="libraryStatusText">불러오지 못했습니다.</p>
        ) : sentences.length === 0 ? (
          <div className="introCard librarySetDetailEmptyCta">
            <p className="libraryStatusText" style={{ marginBottom: 12 }}>
              아직 이 세트에 문장이 없습니다.
            </p>
            <Link to={`/library/sets/${setIdNum}/edit`} className="primaryButton">
              카드 편집에서 추가하기
            </Link>
          </div>
        ) : (
          <div className="librarySetQuizletPanel">
            <div className="librarySetQuizletPanelHeader">
              <div>
              </div>
              <div className="librarySetQuizletPanelMeta">
                <span className="librarySetQuizletStarCount" aria-live="polite">
                  <StarIcon filled />
                  <span className="librarySetQuizletStarCountNum">{starredCount}</span>
                  개 표시
                </span>
                {/*<Link to={`/library/sets/${setIdNum}/edit`} className="textLink librarySetQuizletEditAllLink">
                  전체 편집
                </Link>*/}
              </div>
            </div>

            <ul className="librarySetQuizletList">
              {sentences.map((sentence) => (
                <li key={sentence.sentenceId} className="librarySetQuizletCard">
                  <div className="librarySetQuizletToolbar">
                    <button
                      type="button"
                      className={`librarySetQuizletIconBtn${starredIds.has(sentence.sentenceId) ? ' isStarred' : ''}`}
                      onClick={() => toggleStar(sentence.sentenceId)}
                      aria-label={starredIds.has(sentence.sentenceId) ? '표시 해제' : '표시하기'}
                      aria-pressed={starredIds.has(sentence.sentenceId)}
                    >
                      <StarIcon filled={starredIds.has(sentence.sentenceId)} />
                    </button>
                    <button
                      type="button"
                      className="librarySetQuizletIconBtn"
                      onClick={() => handleAudioIconClick(sentence.sentenceId)}
                      disabled={audioStateBySentenceId[sentence.sentenceId]?.status === 'loading'}
                      aria-label={
                        audioStateBySentenceId[sentence.sentenceId]?.status === 'done'
                          ? '음성 재생'
                          : '음성 생성'
                      }
                    >
                      <SpeakerIcon />
                    </button>
                    <button
                      type="button"
                      className="librarySetQuizletIconBtn"
                      onClick={() => startEditingSentence(sentence)}
                      disabled={savingEdit || editingSentenceId === sentence.sentenceId}
                      aria-label="문장 수정"
                    >
                      <PencilIcon />
                    </button>
                  </div>

                  {editingSentenceId === sentence.sentenceId ? (
                    <div className="librarySetQuizletEditBlock">
                      <div className="librarySetQuizletEditGrid">
                        <div className="librarySetQuizletEditCol">
                          <label className="librarySetQuizletEditLabel" htmlFor={`ed-ko-${sentence.sentenceId}`}>
                            문장 (한국어)
                          </label>
                          <textarea
                            id={`ed-ko-${sentence.sentenceId}`}
                            className="uiInput libraryTextarea librarySetQuizletEditArea"
                            rows={3}
                            value={editingFrontText}
                            onChange={(e) => setEditingFrontText(e.target.value)}
                            dir="ltr"
                          />
                        </div>
                        <div className="librarySetQuizletEditCol">
                          <label className="librarySetQuizletEditLabel" htmlFor={`ed-ar-${sentence.sentenceId}`}>
                            뜻 (아랍어)
                          </label>
                          <textarea
                            id={`ed-ar-${sentence.sentenceId}`}
                            className="uiInput libraryTextarea librarySetQuizletEditArea"
                            rows={3}
                            value={editingBackText}
                            onChange={(e) => setEditingBackText(e.target.value)}
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <label className="librarySetQuizletEditLabel" htmlFor={`ed-m-${sentence.sentenceId}`}>
                        메모 (선택)
                      </label>
                      <input
                        id={`ed-m-${sentence.sentenceId}`}
                        className="uiInput"
                        value={editingMemo}
                        onChange={(e) => setEditingMemo(e.target.value)}
                      />
                      <div className="librarySetQuizletEditActions">
                        <button
                          type="button"
                          className="primaryButton"
                          onClick={() => void handleSaveSentenceEdit(sentence.sentenceId)}
                          disabled={savingEdit}
                        >
                          {savingEdit ? '저장 중…' : '저장'}
                        </button>
                        <button
                          type="button"
                          className="headerGhostButton"
                          onClick={cancelEditingSentence}
                          disabled={savingEdit}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="librarySetQuizletCardBody">
                        <div className="librarySetQuizletCol librarySetQuizletCol--ko">
                          <p className="librarySetQuizletText librarySetQuizletText--ko" dir="ltr">
                            {sentence.frontText}
                          </p>
                        </div>
                        <div className="librarySetQuizletDivider" aria-hidden="true" />
                        <div className="librarySetQuizletCol librarySetQuizletCol--ar">
                          <p className="librarySetQuizletText librarySetQuizletText--ar" dir="rtl">
                            {sentence.backText}
                          </p>
                        </div>
                      </div>
                      {sentence.memo ? (
                        <p className="librarySetQuizletMemo" dir="auto">
                          메모: {sentence.memo}
                        </p>
                      ) : null}
                      <div className="librarySetQuizletAudioHint">
                        {audioStateBySentenceId[sentence.sentenceId]?.status === 'loading' ? (
                          <span className="librarySetQuizletAudioHintText">음성 생성 중…</span>
                        ) : audioStateBySentenceId[sentence.sentenceId]?.status === 'done' ? (
                          <span className="librarySetQuizletAudioHintText"></span>
                        ) : (
                          <span className="librarySetQuizletAudioHintText"></span>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default LibrarySetDetail
