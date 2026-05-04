import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getFolders } from '../api/folderApi.js'
import { createSet } from '../api/sentenceSetApi.js'
import { createSentence } from '../api/sentenceApi.js'

const FRONT_LANG = 'ko'
const BACK_LANG = 'ar'

function makeCardId() {
  return `card-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

function emptyCard() {
  return { id: makeCardId(), frontText: '', backText: '', memo: '' }
}

function validateForm(title, cards) {
  const t = title.trim()
  if (!t) {
    return { ok: false, message: '세트 제목을 입력해 주세요.' }
  }

  const partialLines = []
  const valid = []

  cards.forEach((card, index) => {
    const front = card.frontText.trim()
    const back = card.backText.trim()
    const empty = !front && !back
    if (empty) return
    if (!front || !back) {
      partialLines.push(index + 1)
    } else {
      valid.push({ front, back, memo: (card.memo ?? '').trim() })
    }
  })

  if (partialLines.length > 0) {
    return {
      ok: false,
      message: `카드 ${partialLines.join(', ')}번: 앞면과 뒷면 문장을 모두 입력해 주세요.`,
    }
  }

  if (valid.length === 0) {
    return { ok: false, message: '앞면과 뒷면이 모두 입력된 문장 카드를 최소 1개 추가해 주세요.' }
  }

  return { ok: true, title: t, validCards: valid }
}

function LibraryCreateSet() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const folderIdFromUrl = searchParams.get('folderId')

  const [setTitle, setSetTitle] = useState('')
  const [setDescription, setSetDescription] = useState('')
  const [folderId, setFolderId] = useState('')
  const [folders, setFolders] = useState([])

  const [cards, setCards] = useState(() => [emptyCard(), emptyCard()])
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const list = await getFolders()
        if (alive && Array.isArray(list)) setFolders(list)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (folderIdFromUrl && /^\d+$/.test(folderIdFromUrl)) {
      setFolderId(folderIdFromUrl)
    }
  }, [folderIdFromUrl])

  const folderOptions = useMemo(() => {
    return [...folders].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  }, [folders])

  const addCard = () => {
    setCards((prev) => [...prev, emptyCard()])
  }

  const removeCard = (id) => {
    setCards((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((c) => c.id !== id)
    })
  }

  const updateCard = (id, field, value) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const persistSetAndSentences = async (afterSaveNavigate) => {
    setSubmitError('')
    const validation = validateForm(setTitle, cards)
    if (!validation.ok) {
      setSubmitError(validation.message)
      return
    }

    const folderIdNum = folderId === '' ? null : Number(folderId)
    if (folderId !== '' && !Number.isInteger(folderIdNum)) {
      setSubmitError('폴더 선택이 올바르지 않습니다.')
      return
    }

    setSaving(true)
    try {
      const created = await createSet({
        setName: validation.title,
        description: setDescription.trim() === '' ? undefined : setDescription.trim(),
        folderId: folderIdNum,
      })
      const setId = created?.setId
      if (setId == null) {
        throw new Error('세트 생성 응답에 setId가 없습니다.')
      }

      for (const row of validation.validCards) {
        await createSentence(setId, {
          frontLang: FRONT_LANG,
          frontText: row.front,
          backLang: BACK_LANG,
          backText: row.back,
          memo: row.memo === '' ? null : row.memo,
        })
      }

      navigate(afterSaveNavigate(setId), { replace: true })
    } catch (e) {
      console.error(e)
      setSubmitError(
        e?.response?.data?.message ??
          e?.response?.data?.data?.reason ??
          e?.message ??
          '저장 중 오류가 발생했습니다. 이후 카드는 저장되지 않았을 수 있습니다.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleMake = () => {
    persistSetAndSentences((setId) => `/library/sets/${setId}`)
  }

  const handleMakeAndStudy = () => {
    persistSetAndSentences((setId) => `/study/sets/${setId}`)
  }

  return (
    <section className="container sectionSpacing createSetPage">
      <div className="createSetHeader">
        <Link to="/library" className="textLink createSetBackLink">
          ← 라이브러리
        </Link>
        <h1 className="createSetTitle">새 문장 세트 만들기</h1>
      </div>

      <div className="introCard createSetMetaCard">
        <div className="uiField">
          <label className="uiFieldLabel" htmlFor="create-set-title">
            세트 제목 <span className="libraryRequired">*</span>
          </label>
          <input
            id="create-set-title"
            className="uiInput"
            value={setTitle}
            onChange={(e) => setSetTitle(e.target.value)}
            placeholder="예: 요한복음 3장"
            autoComplete="off"
          />
        </div>
        <div className="uiField">
          <label className="uiFieldLabel" htmlFor="create-set-desc">
            세트 설명 (선택)
          </label>
          <textarea
            id="create-set-desc"
            className="uiInput createSetDescArea"
            rows={2}
            value={setDescription}
            onChange={(e) => setSetDescription(e.target.value)}
            placeholder="이 세트에 대한 메모"
          />
        </div>
        <div className="uiField">
          <label className="uiFieldLabel" htmlFor="create-set-folder">
            폴더에 넣기 (선택)
          </label>
          <select
            id="create-set-folder"
            className="uiInput createSetSelect"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
          >
            <option value="">폴더 없음</option>
            {folderOptions.map((f) => (
              <option key={f.folderId} value={String(f.folderId)}>
                {f.folderName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="createSetCardsSection">
        <h2 className="librarySectionTitle">문장 카드</h2>
        <p className="libraryPolicyHint">
          앞면·뒷면이 모두 입력된 카드만 저장됩니다. 언어는 기본값(앞 ko / 뒤 ar)으로 저장됩니다.
        </p>

        <ul className="createSetCardList">
          {cards.map((card, index) => (
            <li key={card.id} className="createSetCard">
              <div className="createSetCardToolbar">
                <span className="createSetCardNumber">{index + 1}</span>
                <button
                  type="button"
                  className="createSetCardRemove"
                  onClick={() => removeCard(card.id)}
                  disabled={cards.length <= 1 || saving}
                  aria-label={`카드 ${index + 1} 삭제`}
                >
                  삭제
                </button>
              </div>
              <div className="createSetCardFields">
                <div className="uiField">
                  <label className="uiFieldLabel">앞면 문장 <span className="libraryRequired">*</span></label>
                  <textarea
                    className="uiInput libraryTextarea"
                    rows={3}
                    value={card.frontText}
                    onChange={(e) => updateCard(card.id, 'frontText', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="uiField">
                  <label className="uiFieldLabel">뒷면 문장 <span className="libraryRequired">*</span></label>
                  <textarea
                    className="uiInput libraryTextarea"
                    rows={3}
                    value={card.backText}
                    onChange={(e) => updateCard(card.id, 'backText', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="uiField createSetMemoField">
                <label className="uiFieldLabel">메모 (선택)</label>
                <input
                  className="uiInput"
                  value={card.memo}
                  onChange={(e) => updateCard(card.id, 'memo', e.target.value)}
                  disabled={saving}
                />
              </div>
            </li>
          ))}
        </ul>

        <button type="button" className="headerGhostButton createSetAddCardBtn" onClick={addCard} disabled={saving}>
          + 카드 추가하기
        </button>
      </div>

      {submitError ? (
        <p className="libraryFormError createSetError" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="createSetActions">
        <button type="button" className="primaryButton" onClick={handleMake} disabled={saving}>
          {saving ? '저장 중…' : '만들기'}
        </button>
        <button
          type="button"
          className="uiButton uiButton--secondary createSetActionStudy"
          onClick={handleMakeAndStudy}
          disabled={saving}
        >
          {saving ? '저장 중…' : '만들고 연습하기'}
        </button>
      </div>
    </section>
  )
}

export default LibraryCreateSet
