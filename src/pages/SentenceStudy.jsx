import { useCallback, useEffect, useState } from 'react'
import SentenceBox from '../components/ui/SentenceBox.jsx'
import StudySettingsMenu from '../components/ui/StudySettingsMenu.jsx'
import { useParams, Link } from 'react-router-dom'
import { getSentencesBySet } from '../api/sentenceApi.js'
import { resumeCountdownAudio } from '../utils/countdownAudio.js'
import { useSentenceCountdown } from '../hooks/useSentenceCountdown.js'
import { useLongPressAdjust } from '../hooks/useLongPressAdjust.js'

const AUTO_FLIP_SECONDS = 10
const MIN_COUNTDOWN_SECONDS = 5
const MAX_COUNTDOWN_SECONDS = 20
const LONG_PRESS_DELAY_MS = 350
const LONG_PRESS_INTERVAL_MS = 170
const LONG_PRESS_STEP_SECONDS = 5

const CARD_SIDE_ORDER_STORAGE_KEY = 'arabicpt.sentenceStudy.cardSideOrder'

function readCardSideReversed() {
  try {
    return localStorage.getItem(CARD_SIDE_ORDER_STORAGE_KEY) === 'reversed'
  } catch {
    return false
  }
}

function persistCardSideReversed(reversed) {
  try {
    localStorage.setItem(CARD_SIDE_ORDER_STORAGE_KEY, reversed ? 'reversed' : 'default')
  } catch {
    /* ignore */
  }
}

function resolveCardSides(sentence, reversed) {
  if (!sentence) {
    return { frontText: '', backText: '', frontDir: 'ltr', backDir: 'ltr' }
  }
  const isRtl = (lang) => typeof lang === 'string' && lang.toLowerCase().includes('ar')

  const apiFront = {
    text: sentence.frontText,
    dir: isRtl(sentence.frontLang) ? 'rtl' : 'ltr',
  }
  const apiBack = {
    text: sentence.backText,
    dir: isRtl(sentence.backLang) ? 'rtl' : 'ltr',
  }
  if (!reversed) {
    return {
      frontText: apiFront.text,
      backText: apiBack.text,
      frontDir: apiFront.dir,
      backDir: apiBack.dir,
    }
  }
  return {
    frontText: apiBack.text,
    backText: apiFront.text,
    frontDir: apiBack.dir,
    backDir: apiFront.dir,
  }
}

function SentenceStudy() {
  const { setId } = useParams()
  const setIdNum = Number(setId)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardSideReversed, setCardSideReversed] = useState(readCardSideReversed)
  const currentSentence = sentences[currentIndex]
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
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [setIdNum, setIdValid])

  useEffect(() => {
    if (currentIndex >= sentences.length && sentences.length > 0) {
      setCurrentIndex(0)
      setIsFlipped(false)
    }
  }, [currentIndex, sentences.length])

  const goPrev = () => {
    if (sentences.length === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === 0 ? sentences.length - 1 : prev - 1))
  }

  const goNext = () => {
    if (sentences.length === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === sentences.length - 1 ? 0 : prev + 1))
  }

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => {
      if (prev) {
        // 뒷면에서 앞면으로 돌아올 때는 자동 카운트를 멈춥니다.
        setAllowCountdown(false)
      }
      return !prev
    })
  }, [])
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
        flipCard()
      }
    }

    window.addEventListener('keydown', handleSpaceFlip)
    return () => window.removeEventListener('keydown', handleSpaceFlip)
  }, [flipCard])

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
    <section className="container">
      <div className="studyPageIntro">
        <div className="studyPageIntroHeadingRow">
          <div>
            <h2>문장 학습</h2>
            <p>
              {sentences.length === 0 ? 0 : currentIndex + 1} / {sentences.length} 문장
            </p>
            <Link to={`/library/sets/${setIdNum}`} className="textLink studyBackToSetLink">
              ← 문장 세트로
            </Link>
          </div>
          <StudySettingsMenu cardSideReversed={cardSideReversed} onToggleCardSide={toggleCardSideOrder} />
        </div>
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
      </div>

      {countdownEnabled ? (
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
        <SentenceBox title="문장 학습 카드" status="학습 중" progress="로딩" text="문장을 불러오는 중입니다." />
      ) : error ? (
        <SentenceBox
          title="문장 학습 카드"
          status="오류"
          progress="불러오기 실패"
          text="문장을 불러오지 못했습니다."
        />
      ) : sentences.length === 0 ? (
        <SentenceBox
          title="문장 학습 카드"
          status="학습 중"
          progress="문장 없음"
          text="아직 등록된 문장이 없습니다."
        />
      ) : (
        <SentenceBox
          title="문장 학습 카드"
          status="학습 중"
          progress={`문장 ${currentIndex + 1}`}
          frontText={cardSides.frontText}
          backText={cardSides.backText}
          frontDir={cardSides.frontDir}
          backDir={cardSides.backDir}
          isFlipped={isFlipped}
          onFlip={flipCard}
        />
      )}

      <div className="studyActionRow">
        <button type="button" className="headerGhostButton" onClick={goPrev} disabled={loading || sentences.length === 0}>
          이전 문장
        </button>
        <button type="button" className="headerPrimaryButton" onClick={goNext} disabled={loading || sentences.length === 0}>
          다음 문장
        </button>
      </div>
    </section>
  )
}

export default SentenceStudy
