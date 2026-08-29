import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StudySessionHeader from '../components/study/StudySessionHeader.jsx'
import StudyCardPanel from '../components/study/StudyCardPanel.jsx'
import { useParams, Link } from 'react-router-dom'
import { getSentencesBySet } from '../api/sentenceApi.js'
import { getSentenceAudio } from '../api/audioApi.js'
import { unlockStudyAudio } from '../utils/unlockStudyAudio.js'
import { playSentenceMediaAudio } from '../utils/sentenceMediaAudio.js'
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
/** UI-only: mark → next card motion (ms) */
const CARD_EXIT_MS = 90
const CARD_ENTER_MS = 160

/** 세션 queue snapshot — marks 변경과 무관한 고정 목록 */
function buildStudyQueue(list) {
  return Array.isArray(list) ? [...list] : []
}

/**
 * /study/sets/:setId — 문장 카드 학습 전용 (Ebook presentation 없음).
 * Ebook 콘텐츠는 ParagraphSet / ParagraphReader 영역.
 */
function SentenceStudy() {
  const { setId } = useParams()
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

  const [isFlipped, setIsFlipped] = useState(false)
  const [cardSideReversed, setCardSideReversed] = useState(readCardSideReversed)
  const [audioStateBySentenceId, setAudioStateBySentenceId] = useState({})
  const previousIsFlippedRef = useRef(false)
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
  const cardSides = resolveCardSides(cardSentence, cardSideReversed)

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
      void unlockStudyAudio()
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  const onCountdownToggle = useCallback(
    (event) => {
      const enabled = event.target.checked
      if (enabled) {
        void unlockStudyAudio()
      }
      handleCountdownToggle(event)
    },
    [handleCountdownToggle],
  )

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
      return
    }
    if (sessionStartedForSetRef.current === setIdNum) return
    sessionStartedForSetRef.current = setIdNum
    startFullSession(sentences)
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

  const getFullAudioUrl = useCallback((audioUrl) => {
    if (!audioUrl) return ''
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl
    }
    return audioUrl
  }, [])

  const playCurrentSentenceAudio = useCallback(async () => {
    const sentenceId = cardSentence?.sentenceId
    if (!sentenceId) return
    const entry = audioStateBySentenceId[sentenceId]
    const fullUrl = getFullAudioUrl(entry?.audioUrl)
    if (!fullUrl) return
    await playSentenceMediaAudio(fullUrl)
  }, [audioStateBySentenceId, cardSentence?.sentenceId, getFullAudioUrl])

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
        if (!sessionCompleted) {
          flipCard()
        }
      }
    }

    window.addEventListener('keydown', handleSpaceFlip)
    return () => window.removeEventListener('keydown', handleSpaceFlip)
  }, [flipCard, sessionCompleted])

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

  return (
    <>
      <StudySessionHeader
        setIdNum={setIdNum}
        cardSideReversed={cardSideReversed}
        onToggleCardSide={toggleCardSideOrder}
        showCountdown={!sessionCompleted}
        countdownEnabled={countdownEnabled}
        countdownSeconds={countdownSeconds}
        isCountdownRunning={isCountdownRunning}
        minSeconds={MIN_COUNTDOWN_SECONDS}
        maxSeconds={MAX_COUNTDOWN_SECONDS}
        onCountdownToggle={onCountdownToggle}
        onCountdownSecondsChange={handleCountdownSecondsChange}
        onStepClick={handleStepButtonClick}
        onLongPressStart={startLongPressAdjust}
        onLongPressStop={stopLongPressAdjust}
      />
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

export default SentenceStudy
