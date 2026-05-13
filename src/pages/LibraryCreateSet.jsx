import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CreateSetCardsForm } from '../components/CreateSetCardsForm.jsx'
import { getFolders } from '../api/folderApi.js'
import { createSet } from '../api/sentenceSetApi.js'
import { createSentence } from '../api/sentenceApi.js'
import { BACK_LANG, emptyCard, FRONT_LANG, validateSentenceCards } from '../lib/sentenceCardDraft.js'

function validateForm(title, cards) {
  const t = title.trim()
  if (!t) {
    return { ok: false, message: '세트 제목을 입력해 주세요.' }
  }
  const cardResult = validateSentenceCards(cards)
  if (!cardResult.ok) {
    return { ok: false, message: cardResult.message }
  }
  return { ok: true, title: t, validCards: cardResult.validCards }
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

      <CreateSetCardsForm
        cards={cards}
        onAddCard={addCard}
        onRemoveCard={removeCard}
        onUpdateCard={updateCard}
        onToggleCardMemo={toggleCardMemo}
        disabled={saving}
        error={submitError}
        primaryLabel={saving ? '저장 중…' : '완료'}
        onPrimaryClick={handleMake}
        showFab
      />
    </section>
  )
}

export default LibraryCreateSet
