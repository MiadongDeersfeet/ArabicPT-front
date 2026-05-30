import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SentenceBox from '../components/ui/SentenceBox.jsx'
import StudyEbookView from '../components/ui/StudyEbookView.jsx'
import StudySettingsMenu from '../components/ui/StudySettingsMenu.jsx'
import StudyMarkBar from '../components/ui/StudyMarkBar.jsx'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { getSentencesBySet } from '../api/sentenceApi.js'
import { getSentenceAudio } from '../api/audioApi.js'
import { resumeCountdownAudio } from '../utils/countdownAudio.js'
import { useSentenceCountdown } from '../hooks/useSentenceCountdown.js'
import { useLongPressAdjust } from '../hooks/useLongPressAdjust.js'
import { readCardSideReversed, persistCardSideReversed, resolveCardSides } from '../utils/sentenceCardSides.js'
import {
  loadMarks,
  loadWeakOnly,
  persistMarks,
  persistWeakOnly,
  pruneMarks,
} from '../utils/sentenceStudyMarks.js'

const AUTO_FLIP_SECONDS = 10
const MIN_COUNTDOWN_SECONDS = 5
const MAX_COUNTDOWN_SECONDS = 20
const LONG_PRESS_DELAY_MS = 350
const LONG_PRESS_INTERVAL_MS = 170
const LONG_PRESS_STEP_SECONDS = 5
const VIEW_MODE_STORAGE_KEY = 'arabicpt.study.viewMode'

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

function SentenceStudy() {
  const { setId } = useParams()
  const [searchParams] = useSearchParams()
  const setIdNum = Number(setId)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardSideReversed, setCardSideReversed] = useState(readCardSideReversed)
  const [audioStateBySentenceId, setAudioStateBySentenceId] = useState({})
  const [marks, setMarks] = useState({})
  const [weakOnlyMode, setWeakOnlyMode] = useState(false)
  const [viewMode, setViewMode] = useState(() => readInitialViewMode(searchParams))
  const [showBack, setShowBack] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  const previousIsFlippedRef = useRef(false)
  const ebookAudioRef = useRef(null)

  const activeSentences = useMemo(() => {
    if (sentences.length === 0) return []
    if (!weakOnlyMode) return sentences
    return sentences.filter((s) => marks[String(s.sentenceId)] === 'unknown')
  }, [sentences, weakOnlyMode, marks])

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

  const currentSentence = activeSentences[currentIndex] ?? null
  const cardSides = resolveCardSides(currentSentence, cardSideReversed)

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
    isFlipped,
    currentIndex,
    defaultSeconds: AUTO_FLIP_SECONDS,
    minSeconds: MIN_COUNTDOWN_SECONDS,
    maxSeconds: MAX_COUNTDOWN_SECONDS,
    onAutoFlip: handleAutoFlip,
  })

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
    setWeakOnlyMode(loadWeakOnly(setIdNum))
  }, [setIdNum, setIdValid])

  useEffect(() => {
    if (!setIdValid) return
    if (sentences.length === 0) {
      setMarks({})
      return
    }
    const ids = sentences.map((s) => s.sentenceId)
    setMarks(pruneMarks(loadMarks(setIdNum), ids))
  }, [setIdNum, setIdValid, sentences])

  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowBack(false)
  }, [setIdNum, setIdValid])

  useEffect(() => {
    if (activeSentences.length === 0) return
    if (currentIndex >= activeSentences.length) {
      setCurrentIndex(Math.max(0, activeSentences.length - 1))
      setIsFlipped(false)
    }
  }, [currentIndex, activeSentences.length])

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

  /*
  const goPrev = () => {
    if (activeSentences.length === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === 0 ? activeSentences.length - 1 : prev - 1))
  }

  const goNext = () => {
    if (activeSentences.length === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === activeSentences.length - 1 ? 0 : prev + 1))
  }
  */

  const handleWeakOnlyChange = useCallback(
    (event) => {
      const next = event.target.checked
      setWeakOnlyMode(next)
      persistWeakOnly(setIdNum, next)
      setCurrentIndex(0)
      setIsFlipped(false)
      setShowBack(false)
      setFadeKey((k) => k + 1)
    },
    [setIdNum],
  )

  const handleMark = useCallback(
    (kind) => {
      if (loading || error) return
      const deck = activeSentences
      const s = deck[currentIndex]
      if (!s) return
      const id = String(s.sentenceId)
      const nextMarks = pruneMarks({ ...marks, [id]: kind }, sentences.map((x) => x.sentenceId))
      setMarks(nextMarks)
      persistMarks(setIdNum, nextMarks)

      const nextActive = weakOnlyMode
        ? sentences.filter((x) => nextMarks[String(x.sentenceId)] === 'unknown')
        : sentences

      setIsFlipped(false)

      if (nextActive.length === 0) {
        setCurrentIndex(0)
        return
      }

      let nextIdx
      if (weakOnlyMode && kind === 'known') {
        nextIdx = Math.min(currentIndex, nextActive.length - 1)
      } else {
        nextIdx = (currentIndex + 1) % nextActive.length
      }
      setCurrentIndex(nextIdx)
    },
    [
      loading,
      error,
      activeSentences,
      currentIndex,
      marks,
      sentences,
      weakOnlyMode,
      setIdNum,
    ],
  )

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => {
      if (prev) {
        // 뒷면에서 앞면으로 돌아올 때는 자동 카운트를 멈춥니다.
        setAllowCountdown(false)
      }
      return !prev
    })
  }, [setAllowCountdown])

  const handleViewModeChange = useCallback((mode) => {
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
  }, [setAllowCountdown])

  const handleEbookToggleSide = useCallback(() => {
    setShowBack((prev) => !prev)
    setFadeKey((k) => k + 1)
  }, [])

  const goToEbookPage = useCallback(
    (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= activeSentences.length) return
      setCurrentIndex(nextIndex)
      setShowBack(false)
      setFadeKey((k) => k + 1)
      if (ebookAudioRef.current) {
        ebookAudioRef.current.pause()
        ebookAudioRef.current = null
      }
    },
    [activeSentences.length],
  )

  const goEbookPrev = useCallback(() => {
    goToEbookPage(currentIndex - 1)
  }, [currentIndex, goToEbookPage])

  const goEbookNext = useCallback(() => {
    goToEbookPage(currentIndex + 1)
  }, [currentIndex, goToEbookPage])

  const getFullAudioUrl = useCallback((audioUrl) => {
    if (!audioUrl) return ''
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl
    }
    return audioUrl
  }, [])

  const playCurrentSentenceAudio = useCallback(async () => {
    const sentenceId = currentSentence?.sentenceId
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
    } catch (error) {
      console.error(error)
    }
  }, [audioStateBySentenceId, currentSentence?.sentenceId, getFullAudioUrl, viewMode])

  useEffect(() => {
    const wasFlipped = previousIsFlippedRef.current
    const nowFlipped = isFlipped
    previousIsFlippedRef.current = nowFlipped

    if (!wasFlipped && nowFlipped && countdownEnabled) {
      void playCurrentSentenceAudio()
    }
  }, [countdownEnabled, isFlipped, playCurrentSentenceAudio])
  const { startLongPressAdjust, stopLongPressAdjust, handleStepButtonClick } = useLongPressAdjust({
    enabled: countdownEnabled,
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
        } else {
          flipCard()
        }
      }
    }

    window.addEventListener('keydown', handleSpaceFlip)
    return () => window.removeEventListener('keydown', handleSpaceFlip)
  }, [flipCard, handleEbookToggleSide, viewMode])

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
    <section className={viewMode === 'ebook' ? 'paragraphReaderPage studyEbookPage' : 'container'}>
      <div className={viewMode === 'ebook' ? 'studyEbookIntro' : 'studyPageIntro'}>
        <div className="studyPageIntroTopRow">
          <div className="studyPageIntroHeadingRow">
            <div>
              <h2>{viewMode === 'ebook' ? 'Ebook 모드' : '문장 학습'}</h2>
              <p className="studyDeckPosition">
                {activeSentences.length === 0
                  ? weakOnlyMode
                    ? '모름 카드 0장'
                    : `${sentences.length === 0 ? 0 : currentIndex + 1} / ${sentences.length} 문장`
                  : viewMode === 'ebook'
                    ? `${currentIndex + 1} / ${activeSentences.length} 페이지`
                    : `${currentIndex + 1} / ${activeSentences.length}장 · ${weakOnlyMode ? '모름만 복습' : '전체'}`}
              </p>
              <Link to={`/library/sets/${setIdNum}`} className="textLink studyBackToSetLink">
                ← 문장 세트로
              </Link>
            </div>
            <StudySettingsMenu cardSideReversed={cardSideReversed} onToggleCardSide={toggleCardSideOrder} />
          </div>
          <div className="libraryModeTabs studyViewModeTabs" role="tablist" aria-label="학습 보기 방식">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'card'}
              className={`libraryModeTab${viewMode === 'card' ? ' libraryModeTab--active' : ''}`}
              onClick={() => handleViewModeChange('card')}
            >
              카드 모드
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'ebook'}
              className={`libraryModeTab${viewMode === 'ebook' ? ' libraryModeTab--active' : ''}`}
              onClick={() => handleViewModeChange('ebook')}
            >
              Ebook 모드
            </button>
          </div>
          {viewMode === 'card' ? (
          <div className="countdownControlPanel">
            <label className="countToggle" aria-label="Count ON/OFF">
              <span className="countToggleLabel">Count</span>
              <input type="checkbox" checked={countdownEnabled} onChange={handleCountdownToggle} />
              <span className="countToggleTrack" aria-hidden="true">
                <span className="countToggleThumb" />
                <span className="countToggleState">{countdownEnabled ? 'ON' : 'OFF'}</span>
              </span>
            </label>
            {countdownEnabled ? (
              <div className="countStepper" aria-label="카운트다운 시간 설정">
                <button
                  type="button"
                  className="countStepperButton"
                  onClick={() => handleStepButtonClick(-1)}
                  onPointerDown={(event) => startLongPressAdjust(-1, event)}
                  onPointerUp={stopLongPressAdjust}
                  onPointerLeave={stopLongPressAdjust}
                  onPointerCancel={stopLongPressAdjust}
                  disabled={isCountdownRunning || countdownSeconds <= MIN_COUNTDOWN_SECONDS}
                  aria-label="카운트다운 시간 1초 감소"
                >
                  -
                </button>
                <input
                  type="number"
                  min={MIN_COUNTDOWN_SECONDS}
                  max={MAX_COUNTDOWN_SECONDS}
                  className="countStepperValue"
                  value={countdownSeconds}
                  onChange={handleCountdownSecondsChange}
                  aria-label="카운트다운 시간(초)"
                />
                <button
                  type="button"
                  className="countStepperButton"
                  onClick={() => handleStepButtonClick(1)}
                  onPointerDown={(event) => startLongPressAdjust(1, event)}
                  onPointerUp={stopLongPressAdjust}
                  onPointerLeave={stopLongPressAdjust}
                  onPointerCancel={stopLongPressAdjust}
                  disabled={isCountdownRunning || countdownSeconds >= MAX_COUNTDOWN_SECONDS}
                  aria-label="카운트다운 시간 1초 증가"
                >
                  +
                </button>
              </div>
            ) : null}
          </div>
          ) : null}
        </div>
        {viewMode === 'card' && !loading && !error && sentences.length > 0 ? (
          <div className="studyDeckMetaRow">
            <div className="studyMarkStats" role="status" aria-live="polite">
              <span className="studyMarkStat studyMarkStat--total">전체 {markStats.total}</span>
              <span className="studyMarkStatSep" aria-hidden="true">
                ·
              </span>
              <span className="studyMarkStat studyMarkStat--unknown">모름 {markStats.unknown}</span>
              <span className="studyMarkStatSep" aria-hidden="true">
                ·
              </span>
              <span className="studyMarkStat studyMarkStat--known">알고 있음 {markStats.known}</span>
              <span className="studyMarkStatSep" aria-hidden="true">
                ·
              </span>
              <span className="studyMarkStat studyMarkStat--neutral">미표시 {markStats.unmarked}</span>
            </div>
            <label className="studyWeakOnlyToggle">
              <input
                type="checkbox"
                checked={weakOnlyMode}
                onChange={handleWeakOnlyChange}
                disabled={loading}
              />
              <span>모름만 복습</span>
            </label>
          </div>
        ) : null}
      </div>

      {viewMode === 'card' && countdownEnabled ? (
        <div className="studyCountdown" aria-live="polite">
          {isFlipped ? (
            <p className="studyCountdownHint">앞면을 다시 보려면 카드를 뒤집으세요.</p>
          ) : allowCountdown ? (
            <div className="studyCountdownInner">
              <span className="studyCountdownValue">{secondsLeft}</span>
              <span className="studyCountdownUnit">초</span>
            </div>
          ) : (
            <p className="studyCountdownHint">뒷면을 다시 보려면 카드를 뒤집으세요.</p>
          )}
        </div>
      ) : null}

      {loading ? (
        viewMode === 'ebook' ? (
          <p className="libraryStatusText paragraphReaderStatus">문장을 불러오는 중입니다.</p>
        ) : (
          <SentenceBox title="문장 학습 카드" status="학습 중" progress="로딩" text="문장을 불러오는 중입니다." />
        )
      ) : error ? (
        viewMode === 'ebook' ? (
          <p className="libraryStatusText paragraphReaderStatus">문장을 불러오지 못했습니다.</p>
        ) : (
          <SentenceBox
            title="문장 학습 카드"
            status="오류"
            progress="불러오기 실패"
            text="문장을 불러오지 못했습니다."
          />
        )
      ) : sentences.length === 0 ? (
        viewMode === 'ebook' ? (
          <p className="libraryStatusText paragraphReaderStatus">아직 등록된 문장이 없습니다.</p>
        ) : (
          <SentenceBox
            title="문장 학습 카드"
            status="학습 중"
            progress="문장 없음"
            text="아직 등록된 문장이 없습니다."
          />
        )
      ) : activeSentences.length === 0 ? (
        viewMode === 'ebook' ? (
          <div className="studyWeakEmptyWrap">
            <p className="libraryStatusText paragraphReaderStatus">
              모름(×)으로 표시된 카드가 없습니다. 카드 모드에서 전체 학습으로 돌아가 주세요.
            </p>
            <button
              type="button"
              className="headerGhostButton studyWeakEmptyBackBtn"
              onClick={() => {
                setWeakOnlyMode(false)
                persistWeakOnly(setIdNum, false)
                setCurrentIndex(0)
                setShowBack(false)
              }}
            >
              전체 문장 학습으로
            </button>
          </div>
        ) : (
          <div className="studyWeakEmptyWrap">
            <SentenceBox
              title="문장 학습 카드"
              status="복습"
              progress="모름 0장"
              text="모름(×)으로 표시된 카드가 없습니다. 어려운 문장에서 ×를 누르거나, 전체 학습으로 돌아가 주세요."
            />
            <button
              type="button"
              className="headerGhostButton studyWeakEmptyBackBtn"
              onClick={() => {
                setWeakOnlyMode(false)
                persistWeakOnly(setIdNum, false)
                setCurrentIndex(0)
                setIsFlipped(false)
              }}
            >
              전체 문장 학습으로
            </button>
          </div>
        )
      ) : viewMode === 'ebook' ? (
        <StudyEbookView
          frontText={cardSides.frontText}
          backText={cardSides.backText}
          frontDir={cardSides.frontDir}
          backDir={cardSides.backDir}
          showBack={showBack}
          fadeKey={fadeKey}
          onToggleSide={handleEbookToggleSide}
          currentIndex={currentIndex}
          totalPages={activeSentences.length}
          onPrev={goEbookPrev}
          onNext={goEbookNext}
          hasAudio={Boolean(audioStateBySentenceId[currentSentence?.sentenceId]?.audioUrl)}
          onPlayAudio={playCurrentSentenceAudio}
        />
      ) : (
        <SentenceBox
          title="문장 학습 카드"
          status="학습 중"
          progress={`문장 ${currentIndex + 1} / ${activeSentences.length}`}
          frontText={cardSides.frontText}
          backText={cardSides.backText}
          frontDir={cardSides.frontDir}
          backDir={cardSides.backDir}
          isFlipped={isFlipped}
          onFlip={flipCard}
          showAudioButton={Boolean(audioStateBySentenceId[currentSentence?.sentenceId]?.audioUrl)}
          onAudioPlay={playCurrentSentenceAudio}
        />
      )}

      {viewMode === 'card' && !loading && !error && sentences.length > 0 && activeSentences.length > 0 ? (
        <StudyMarkBar onWrong={() => handleMark('unknown')} onCorrect={() => handleMark('known')} />
      ) : null}

      {/* 이전/다음 문장 — O/X(모름·알고 있음)로만 이동하도록 비표시
      <div className="studyActionRow">
        <button
          type="button"
          className="headerGhostButton"
          onClick={goPrev}
          disabled={loading || activeSentences.length === 0}
        >
          이전 문장
        </button>
        <button
          type="button"
          className="headerPrimaryButton"
          onClick={goNext}
          disabled={loading || activeSentences.length === 0}
        >
          다음 문장
        </button>
      </div>
      */}
    </section>
  )
}

export default SentenceStudy
