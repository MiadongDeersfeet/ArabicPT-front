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
  return { id: makeCardId(), frontText: '', backText: '', memo: '', memoOpen: false }
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
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
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
      setFolderOpen(true)
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

  const toggleCardMemo = (id) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, memoOpen: !c.memoOpen } : c)))
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

  return (
    <section className="container sectionSpacing createSetPage createSetSimplePage">
      <div className="createSetHeader">
        <Link to="/library" className="textLink createSetBackLink">
          X
        </Link>
        <h1 className="createSetTitle">문장카드 세트 만들기</h1>
      </div>

      <div className="introCard createSetMetaCard createSetSimpleMetaCard">
        <div className="uiField">
          <label className="uiFieldLabel" htmlFor="create-set-title">
            제목 <span className="libraryRequired">*</span>
          </label>
          <input
            id="create-set-title"
            className="uiInput"
            value={setTitle}
            onChange={(e) => setSetTitle(e.target.value)}
            placeholder="과목, 주제, 학년, 시험 등"
            autoComplete="off"
          />
        </div>
        {descriptionOpen ? (
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="create-set-desc">
              설명 (선택)
            </label>
            <textarea
              id="create-set-desc"
              className="uiInput createSetDescArea"
              rows={2}
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              placeholder="주제가 무엇인가요?"
            />
          </div>
        ) : null}
        <div className="createSetDescToggleRow">
          <button
            type="button"
            className="createSetDescToggleBtn"
            onClick={() => setDescriptionOpen((prev) => !prev)}
            aria-expanded={descriptionOpen}
            aria-controls="create-set-desc"
          >
            {descriptionOpen ? '- 설명' : '+ 설명'}
          </button>
        </div>
        {folderOpen ? (
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="create-set-folder">
              폴더 위치 (선택)
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
        ) : null}
        <div className="createSetDescToggleRow">
          <button
            type="button"
            className="createSetDescToggleBtn"
            onClick={() => setFolderOpen((prev) => !prev)}
            aria-expanded={folderOpen}
            aria-controls="create-set-folder"
          >
            {folderOpen ? '- 폴더' : '+ 폴더'}
          </button>
        </div>
      </div>

      <div className="createSetCardsSection">
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
                  <label className="uiFieldLabel">문장 <span className="libraryRequired">*</span></label>
                  <textarea
                    className="uiInput libraryTextarea"
                    rows={1}
                    value={card.frontText}
                    onChange={(e) => updateCard(card.id, 'frontText', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="uiField">
                  <label className="uiFieldLabel">뜻 <span className="libraryRequired">*</span></label>
                  <textarea
                    className="uiInput libraryTextarea"
                    rows={1}
                    value={card.backText}
                    onChange={(e) => updateCard(card.id, 'backText', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              {card.memoOpen ? (
                <div className="uiField createSetCardMemoField">
                  <label className="uiFieldLabel" htmlFor={`create-set-memo-${card.id}`}>
                    메모 (선택)
                  </label>
                  <textarea
                    id={`create-set-memo-${card.id}`}
                    className="uiInput libraryTextarea"
                    rows={1}
                    value={card.memo}
                    onChange={(e) => updateCard(card.id, 'memo', e.target.value)}
                    disabled={saving}
                  />
                </div>
              ) : null}
              <div className="createSetCardToggleRow">
                <button
                  type="button"
                  className="createSetDescToggleBtn"
                  onClick={() => toggleCardMemo(card.id)}
                  aria-expanded={Boolean(card.memoOpen)}
                  aria-controls={`create-set-memo-${card.id}`}
                  disabled={saving}
                >
                  {card.memoOpen ? '- 메모' : '+ 메모'}
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button type="button" className="headerGhostButton createSetAddCardBtn" onClick={addCard} disabled={saving}>
          + 카드 추가
        </button>
      </div>

      {submitError ? (
        <p className="libraryFormError createSetError" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="createSetActions createSetSimpleActions">
        <button
          type="button"
          className="createSetFabAdd"
          onClick={addCard}
          disabled={saving}
          aria-label="카드 추가"
        >
          +
        </button>
        <button type="button" className="primaryButton" onClick={handleMake} disabled={saving}>
          {saving ? '저장 중…' : '완료'}
        </button>
      </div>
    </section>
  )
}

export default LibraryCreateSet
