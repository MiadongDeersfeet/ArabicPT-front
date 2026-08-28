import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StudySessionHeader from '../components/study/StudySessionHeader.jsx'
import StudyCardPanel from '../components/study/StudyCardPanel.jsx'
import StudyEbookPanel from '../components/study/StudyEbookPanel.jsx'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { getSentencesBySet } from '../api/sentenceApi.js'
import { getSentenceAudio } from '../api/audioApi.js'
import { resumeCountdownAudio } from '../utils/countdownAudio.js'
import { useSentenceCountdown } from '../hooks/useSentenceCountdown.js'
import { useLongPressAdjust } from '../hooks/useLongPressAdjust.js'
import { readCardSideReversed, persistCardSideReversed, resolveCardSides } from '../utils/sentenceCardSides.js'
import {
  loadMarks,
  persistMarks,
  persistWeakOnly,
  pruneMarks,
} from '../utils/sentenceStudyMarks.js'
import './SentenceStudy.css'

const AUTO_FLIP_SECONDS = 10
const MIN_COUNTDOWN_SECONDS = 5
const MAX_COUNTDOWN_SECONDS = 20
const LONG_PRESS_DELAY_MS = 350
const LONG_PRESS_INTERVAL_MS = 170
const LONG_PRESS_STEP_SECONDS = 5
const VIEW_MODE_STORAGE_KEY = 'arabicpt.study.viewMode'
/** UI-only: mark → next card motion (ms) */
const CARD_EXIT_MS = 90
const CARD_ENTER_MS = 160

function readInitialViewMode(searchParams) {
  if (searchParams.get('mode') === 'ebook') return 'ebook'
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (saved === 'ebook' || saved === 'card') return saved
  } catch {
    /* ignore */
  }
  return 'card'
}

/** 세션 queue snapshot — marks 변경과 무관한 고정 목록 */
function buildStudyQueue(list) {
  return Array.isArray(list) ? [...list] : []
}

function SentenceStudy() {
  const { setId } = useParams()
  const [searchParams] = useSearchParams()
  const setIdNum = Number(setId)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // —— persistent marks (localStorage) ——
  const [marks, setMarks] = useState({})

  // —— card session (ephemeral; refresh = new session) ——
  const [studyQueue, setStudyQueue] = useState([])
  const [sessionIndex, setSessionIndex] = useState(0)
  const [sessionMode, setSessionMode] = useState('all') // 'all' | 'weak'
  const [sessionCompleted, setSessionCompleted] = useState(false)

  // —— ebook index (분리: Card session과 공유하지 않음) ——
  const [ebookIndex, setEbookIndex] = useState(0)

  const [isFlipped, setIsFlipped] = useState(false)
  const [cardSideReversed, setCardSideReversed] = useState(readCardSideReversed)
  const [audioStateBySentenceId, setAudioStateBySentenceId] = useState({})
  const [viewMode, setViewMode] = useState(() => readInitialViewMode(searchParams))
  const [showBack, setShowBack] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  const previousIsFlippedRef = useRef(false)
  const ebookAudioRef = useRef(null)
  const sessionStartedForSetRef = useRef(null)
  /** UI-only mark → card motion (session logic과 분리) */
  const [cardMotion, setCardMotion] = useState('idle') // idle | exit | enter
  const [isCardTransitioning, setIsCardTransitioning] = useState(false)
  const [statPulse, setStatPulse] = useState(null) // 'known' | 'unknown' | null
  const markMotionTimersRef = useRef([])

  const clearMarkMotionTimers = useCallback(() => {
    for (const id of markMotionTimersRef.current) window.clearTimeout(id)
    markMotionTimersRef.current = []
  }, [])

  useEffect(() => () => clearMarkMotionTimers(), [clearMarkMotionTimers])

  const markStats = useMemo(() => {
    let unknown = 0
    let known = 0
    for (const s of sentences) {
      const m = marks[String(s.sentenceId)]
      if (m === 'unknown') unknown += 1
      else if (m === 'known') known += 1
    }
    const total = sentences.length
    const unmarked = Math.max(0, total - unknown - known)
    return { unknown, known, unmarked, total }
  }, [sentences, marks])

  /** 완료 패널용 — 현재 studyQueue에 속한 문장의 marks만 (세션 기준) */
  const sessionResultStats = useMemo(() => {
    let known = 0
    let unknown = 0
    for (const s of studyQueue) {
      const m = marks[String(s.sentenceId)]
      if (m === 'unknown') unknown += 1
      else if (m === 'known') known += 1
    }
    return { known, unknown, total: studyQueue.length }
  }, [studyQueue, marks])

  const remainingUnknownCount = markStats.unknown

  const cardSentence =
    !sessionCompleted && studyQueue.length > 0 ? (studyQueue[sessionIndex] ?? null) : null
  const ebookSentence = sentences.length > 0 ? (sentences[ebookIndex] ?? null) : null
  const focusSentence = viewMode === 'ebook' ? ebookSentence : cardSentence
  const cardSides = resolveCardSides(focusSentence, cardSideReversed)

  const progressCurrent =
    studyQueue.length === 0
      ? 0
      : sessionCompleted
        ? studyQueue.length
        : Math.min(sessionIndex + 1, studyQueue.length)

  const toggleCardSideOrder = useCallback(() => {
    setCardSideReversed((prev) => {
      const next = !prev
      persistCardSideReversed(next)
      return next
    })
    setIsFlipped(false)
  }, [])

  const handleAutoFlip = useCallback(() => {
    setIsFlipped(true)
  }, [])

  const {
    countdownEnabled,
    countdownSeconds,
    secondsLeft,
    allowCountdown,
    isCountdownRunning,
    setAllowCountdown,
    handleCountdownToggle,
    handleCountdownSecondsChange,
    adjustCountdownSeconds,
  } = useSentenceCountdown({
    isFlipped: sessionCompleted ? true : isFlipped,
    currentIndex: sessionIndex,
    defaultSeconds: AUTO_FLIP_SECONDS,
    minSeconds: MIN_COUNTDOWN_SECONDS,
    maxSeconds: MAX_COUNTDOWN_SECONDS,
    onAutoFlip: handleAutoFlip,
  })

  const finishSession = useCallback(() => {
    setSessionCompleted(true)
    setIsFlipped(false)
    setAllowCountdown(false)
  }, [setAllowCountdown])

  const startFullSession = useCallback(
    (sourceList) => {
      const list = sourceList ?? sentences
      const queue = buildStudyQueue(list)
      setStudyQueue(queue)
      setSessionMode('all')
      setSessionIndex(0)
      setSessionCompleted(false)
      setIsFlipped(false)
      setAllowCountdown(false)
      if (setIdValid) persistWeakOnly(setIdNum, false)
    },
    [sentences, setIdNum, setIdValid, setAllowCountdown],
  )

  const startWeakSession = useCallback(
    (sourceList, sourceMarks) => {
      const list = sourceList ?? sentences
      const m = sourceMarks ?? marks
      const weak = list.filter((s) => m[String(s.sentenceId)] === 'unknown')
      const queue = buildStudyQueue(weak)
      setStudyQueue(queue)
      setSessionMode('weak')
      setSessionIndex(0)
      setSessionCompleted(queue.length === 0)
      setIsFlipped(false)
      setAllowCountdown(false)
      if (setIdValid) persistWeakOnly(setIdNum, true)
    },
    [sentences, marks, setIdNum, setIdValid, setAllowCountdown],
  )

  useEffect(() => {
    let isMounted = true

    const fetchSentences = async () => {
      if (!setIdValid) {
        setLoading(false)
        setSentences([])
        setError(false)
        return
      }
      setLoading(true)
      setError(false)
      setSentences([])
      sessionStartedForSetRef.current = null

      try {
        const sentenceList = await getSentencesBySet(setIdNum)
        if (isMounted) {
          setSentences(Array.isArray(sentenceList) ? sentenceList : [])
        }
      } catch (fetchError) {
        console.error(fetchError)
        if (isMounted) {
          setSentences([])
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSentences()

    return () => {
      isMounted = false
    }
  }, [setIdNum, setIdValid])

  useEffect(() => {
    const unlock = () => {
      resumeCountdownAudio()
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [setAllowCountdown])

  useEffect(() => {
    if (!setIdValid) return
    if (sentences.length === 0) {
      setMarks({})
      return
    }
    const ids = sentences.map((s) => s.sentenceId)
    setMarks(pruneMarks(loadMarks(setIdNum), ids))
  }, [setIdNum, setIdValid, sentences])

  // 문장 로드 후(또는 세트 변경 후) 새 full session — 새로고침 시 완료 UI 없음
  useEffect(() => {
    if (!setIdValid || loading || error) return
    if (sentences.length === 0) {
      setStudyQueue([])
      setSessionCompleted(false)
      setSessionIndex(0)
      setEbookIndex(0)
      return
    }
    if (sessionStartedForSetRef.current === setIdNum) return
    sessionStartedForSetRef.current = setIdNum
    startFullSession(sentences)
    setEbookIndex(0)
  }, [setIdNum, setIdValid, loading, error, sentences, startFullSession])

  useEffect(() => {
    if (sentences.length === 0) {
      setAudioStateBySentenceId({})
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
    })()

    return () => {
      alive = false
    }
  }, [sentences])

  useEffect(() => {
    if (sessionCompleted) {
      setAllowCountdown(false)
    }
  }, [sessionCompleted, setAllowCountdown])

  const handleWeakChipChange = useCallback(
    (event) => {
      const next = event.target.checked
      if (next) {
        if (remainingUnknownCount === 0) return
        startWeakSession()
      } else {
        startFullSession()
      }
    },
    [remainingUnknownCount, startWeakSession, startFullSession],
  )

  const handleMark = useCallback(
    (kind) => {
      if (loading || error || sessionCompleted) return
      const s = studyQueue[sessionIndex]
      if (!s) return

      const id = String(s.sentenceId)
      const nextMarks = pruneMarks({ ...marks, [id]: kind }, sentences.map((x) => x.sentenceId))
      setMarks(nextMarks)
      persistMarks(setIdNum, nextMarks)
      setIsFlipped(false)

      const isLast = sessionIndex >= studyQueue.length - 1
      if (isLast) {
        finishSession()
        return
      }
      setSessionIndex((i) => i + 1)
    },
    [
      loading,
      error,
      sessionCompleted,
      studyQueue,
      sessionIndex,
      marks,
      sentences,
      setIdNum,
      finishSession,
    ],
  )

  /** Presentation-only wrap: short content motion + rapid-click lock */
  const requestMark = useCallback(
    (kind) => {
      if (loading || error || sessionCompleted || isCardTransitioning) return
      if (!studyQueue[sessionIndex]) return

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      clearMarkMotionTimers()
      setIsCardTransitioning(true)
      setStatPulse(kind === 'known' ? 'known' : 'unknown')

      const unlock = () => {
        setCardMotion('idle')
        setIsCardTransitioning(false)
        setStatPulse(null)
      }

      if (prefersReduced) {
        handleMark(kind)
        unlock()
        return
      }

      setCardMotion('exit')
      const t1 = window.setTimeout(() => {
        handleMark(kind)
        setCardMotion('enter')
        const t2 = window.setTimeout(unlock, CARD_ENTER_MS)
        markMotionTimersRef.current.push(t2)
      }, CARD_EXIT_MS)
      markMotionTimersRef.current.push(t1)
    },
    [
      loading,
      error,
      sessionCompleted,
      isCardTransitioning,
      studyQueue,
      sessionIndex,
      clearMarkMotionTimers,
      handleMark,
    ],
  )

  const flipCard = useCallback(() => {
    if (sessionCompleted || isCardTransitioning) return
    setIsFlipped((prev) => {
      if (prev) {
        setAllowCountdown(false)
      }
      return !prev
    })
  }, [sessionCompleted, isCardTransitioning, setAllowCountdown])

  const handleViewModeChange = useCallback(
    (mode) => {
      setViewMode(mode)
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
      } catch {
        /* ignore */
      }
      if (mode === 'ebook') {
        setAllowCountdown(false)
        setShowBack(false)
        setFadeKey((k) => k + 1)
      } else {
        setIsFlipped(false)
      }
    },
    [setAllowCountdown],
  )

  const handleEbookToggleSide = useCallback(() => {
    setShowBack((prev) => !prev)
    setFadeKey((k) => k + 1)
  }, [])

  const goToEbookPage = useCallback(
    (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= sentences.length) return
      setEbookIndex(nextIndex)
      setShowBack(false)
      setFadeKey((k) => k + 1)
      if (ebookAudioRef.current) {
        ebookAudioRef.current.pause()
        ebookAudioRef.current = null
      }
    },
    [sentences.length],
  )

  const goEbookPrev = useCallback(() => {
    goToEbookPage(ebookIndex - 1)
  }, [ebookIndex, goToEbookPage])

  const goEbookNext = useCallback(() => {
    goToEbookPage(ebookIndex + 1)
  }, [ebookIndex, goToEbookPage])

  const getFullAudioUrl = useCallback((audioUrl) => {
    if (!audioUrl) return ''
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl
    }
    return audioUrl
  }, [])

  const playCurrentSentenceAudio = useCallback(async () => {
    const sentenceId = focusSentence?.sentenceId
    if (!sentenceId) return
    const entry = audioStateBySentenceId[sentenceId]
    const fullUrl = getFullAudioUrl(entry?.audioUrl)
    if (!fullUrl) return
    try {
      if (viewMode === 'ebook' && ebookAudioRef.current) {
        ebookAudioRef.current.pause()
      }
      const audio = new Audio(fullUrl)
      if (viewMode === 'ebook') {
        ebookAudioRef.current = audio
      }
      await audio.play()
    } catch (playError) {
      console.error(playError)
    }
  }, [audioStateBySentenceId, focusSentence?.sentenceId, getFullAudioUrl, viewMode])

  useEffect(() => {
    const wasFlipped = previousIsFlippedRef.current
    const nowFlipped = isFlipped
    previousIsFlippedRef.current = nowFlipped

    if (!sessionCompleted && !wasFlipped && nowFlipped && countdownEnabled) {
      void playCurrentSentenceAudio()
    }
  }, [countdownEnabled, isFlipped, playCurrentSentenceAudio, sessionCompleted])

  const { startLongPressAdjust, stopLongPressAdjust, handleStepButtonClick } = useLongPressAdjust({
    enabled: countdownEnabled && !sessionCompleted,
    longPressDelayMs: LONG_PRESS_DELAY_MS,
    longPressIntervalMs: LONG_PRESS_INTERVAL_MS,
    longPressStep: LONG_PRESS_STEP_SECONDS,
    onAdjust: adjustCountdownSeconds,
  })

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
        if (viewMode === 'ebook') {
          handleEbookToggleSide()
        } else if (!sessionCompleted) {
          flipCard()
        }
      }
    }

    window.addEventListener('keydown', handleSpaceFlip)
    return () => window.removeEventListener('keydown', handleSpaceFlip)
  }, [flipCard, handleEbookToggleSide, viewMode, sessionCompleted])

  if (!setIdValid) {
    return (
      <section className="container sectionSpacing">
        <div className="introCard">
          <h2>문장 세트를 선택해 주세요</h2>
          <p>라이브러리에서 문장 세트를 고른 뒤 학습을 시작할 수 있습니다.</p>
          <Link to="/library" className="textLink">
            라이브러리로 이동
          </Link>
        </div>
      </section>
    )
  }

  const sessionHeader = (
    <StudySessionHeader
      setIdNum={setIdNum}
      cardSideReversed={cardSideReversed}
      onToggleCardSide={toggleCardSideOrder}
      showCountdown={viewMode === 'card' && !sessionCompleted}
      countdownEnabled={countdownEnabled}
      countdownSeconds={countdownSeconds}
      isCountdownRunning={isCountdownRunning}
      minSeconds={MIN_COUNTDOWN_SECONDS}
      maxSeconds={MAX_COUNTDOWN_SECONDS}
      onCountdownToggle={handleCountdownToggle}
      onCountdownSecondsChange={handleCountdownSecondsChange}
      onStepClick={handleStepButtonClick}
      onLongPressStart={startLongPressAdjust}
      onLongPressStop={stopLongPressAdjust}
    />
  )

  /* —— Card mode —— */
  if (viewMode === 'card') {
    return (
      <>
        {sessionHeader}
        <section className="container studyPageSection studyPageSection--session">
          <StudyCardPanel
            progress={{
              current: progressCurrent,
              total: studyQueue.length,
              knownCount: markStats.known,
              unknownCount: markStats.unknown,
              weakOnlyActive: sessionMode === 'weak',
              weakOnlyDisabled: loading || sessionCompleted || remainingUnknownCount === 0,
              progressCompact: sessionCompleted,
              pulseStat: statPulse,
            }}
            countdown={{
              showLive: countdownEnabled && !isFlipped && allowCountdown,
              secondsLeft,
              totalSeconds: countdownSeconds,
            }}
            session={{
              completed: sessionCompleted,
              completionTotal: sessionResultStats.total,
              completionKnown: sessionResultStats.known,
              completionUnknown: sessionResultStats.unknown,
              remainingUnknownCount,
              setId: setIdNum,
            }}
            card={{
              loading,
              error,
              sentencesEmpty: sentences.length === 0,
              weakQueueEmpty: sessionMode === 'weak' && studyQueue.length === 0,
              hasSentence: Boolean(cardSentence),
              frontText: cardSides.frontText,
              backText: cardSides.backText,
              frontDir: cardSides.frontDir,
              backDir: cardSides.backDir,
              isFlipped,
              hasAudio: Boolean(audioStateBySentenceId[cardSentence?.sentenceId]?.audioUrl),
              cardMotion,
              showMarkBar: !loading && !error && studyQueue.length > 0,
              markBarDisabled: isCardTransitioning,
            }}
            onViewModeChange={handleViewModeChange}
            onWeakChange={handleWeakChipChange}
            onFlip={flipCard}
            onPlayAudio={playCurrentSentenceAudio}
            onMarkKnown={() => requestMark('known')}
            onMarkUnknown={() => requestMark('unknown')}
            onRestartWeak={() => startWeakSession()}
            onRestartAll={() => startFullSession()}
          />
        </section>
      </>
    )
  }

  /* —— Ebook mode —— */
  const ebookSides = resolveCardSides(ebookSentence, cardSideReversed)

  return (
    <>
      {sessionHeader}
      <section className="container studyPageSection studyPageSection--session">
        <StudyEbookPanel
          loading={loading}
          error={error}
          totalPages={sentences.length}
          currentIndex={ebookIndex}
          frontText={ebookSides.frontText}
          backText={ebookSides.backText}
          frontDir={ebookSides.frontDir}
          backDir={ebookSides.backDir}
          showBack={showBack}
          fadeKey={fadeKey}
          hasAudio={Boolean(audioStateBySentenceId[ebookSentence?.sentenceId]?.audioUrl)}
          onToggleSide={handleEbookToggleSide}
          onPrev={goEbookPrev}
          onNext={goEbookNext}
          onPlayAudio={playCurrentSentenceAudio}
          onViewModeChange={handleViewModeChange}
        />
      </section>
    </>
  )
}

export default SentenceStudy
