import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CreateParagraphBlocksForm } from '../components/CreateParagraphBlocksForm.jsx'
import { getFolders } from '../api/folderApi.js'
import { createParagraphSet } from '../api/paragraphSetApi.js'
import { createParagraph } from '../api/paragraphApi.js'
import {
  BACK_LANG,
  emptyParagraph,
  FRONT_LANG,
  validateParagraphBlocks,
} from '../lib/paragraphCardDraft.js'

function validateForm(title, blocks) {
  const t = title.trim()
  if (!t) {
    return { ok: false, message: '세트 제목을 입력해 주세요.' }
  }
  const blockResult = validateParagraphBlocks(blocks)
  if (!blockResult.ok) {
    return { ok: false, message: blockResult.message }
  }
  return { ok: true, title: t, validParagraphs: blockResult.validParagraphs }
}

function ParagraphSetCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const folderIdFromUrl = searchParams.get('folderId')

  const [setTitle, setSetTitle] = useState('')
  const [setDescription, setSetDescription] = useState('')
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const [folderId, setFolderId] = useState('')
  const [folders, setFolders] = useState([])

  const [blocks, setBlocks] = useState(() => [emptyParagraph()])
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

  const addBlock = () => setBlocks((prev) => [...prev, emptyParagraph()])

  const removeBlock = (id) => {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((b) => b.id !== id)
    })
  }

  const updateBlock = (id, field, value) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const toggleBlockMemo = (id) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, memoOpen: !b.memoOpen } : b)))
  }

  const persistSetAndParagraphs = async (afterSaveNavigate) => {
    setSubmitError('')
    const validation = validateForm(setTitle, blocks)
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
      const created = await createParagraphSet({
        setName: validation.title,
        description: setDescription.trim() === '' ? undefined : setDescription.trim(),
        folderId: folderIdNum,
      })
      const paragraphSetId = created?.paragraphSetId
      if (paragraphSetId == null) {
        throw new Error('세트 생성 응답에 paragraphSetId가 없습니다.')
      }

      let order = 1
      for (const row of validation.validParagraphs) {
        await createParagraph(paragraphSetId, {
          frontLang: FRONT_LANG,
          frontText: row.front,
          backLang: BACK_LANG,
          backText: row.back,
          memo: row.memo === '' ? null : row.memo,
          displayOrder: order,
        })
        order += 1
      }

      navigate(afterSaveNavigate(paragraphSetId), { replace: true })
    } catch (e) {
      console.error(e)
      setSubmitError(
        e?.response?.data?.message ??
          e?.response?.data?.data?.reason ??
          e?.message ??
          '저장 중 오류가 발생했습니다. 이후 페이지는 저장되지 않았을 수 있습니다.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    persistSetAndParagraphs((id) => `/library/paragraph-sets/${id}`)
  }

  const handleSaveAndRead = () => {
    persistSetAndParagraphs((id) => `/study/paragraph-sets/${id}`)
  }

  return (
    <section className="container sectionSpacing createSetPage createSetSimplePage paragraphCreatePage">
      <div className="createSetHeader">
        <Link to="/library/paragraph-sets" className="textLink createSetBackLink">
          X
        </Link>
        <h1 className="createSetTitle">문단 Ebook 세트 만들기</h1>
      </div>

      <div className="introCard createSetMetaCard createSetSimpleMetaCard">
        <div className="uiField">
          <label className="uiFieldLabel" htmlFor="create-paragraph-set-title">
            제목 <span className="libraryRequired">*</span>
          </label>
          <input
            id="create-paragraph-set-title"
            className="uiInput"
            value={setTitle}
            onChange={(e) => setSetTitle(e.target.value)}
            placeholder="주제, 상황, 학습 목적 등"
            autoComplete="off"
          />
        </div>
        {descriptionOpen ? (
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="create-paragraph-set-desc">
              설명 (선택)
            </label>
            <textarea
              id="create-paragraph-set-desc"
              className="uiInput createSetDescArea"
              rows={2}
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              placeholder="이 세트에 대한 간단한 설명"
            />
          </div>
        ) : null}
        <div className="createSetDescToggleRow">
          <button
            type="button"
            className="createSetDescToggleBtn"
            onClick={() => setDescriptionOpen((prev) => !prev)}
            aria-expanded={descriptionOpen}
          >
            {descriptionOpen ? '- 설명' : '+ 설명'}
          </button>
        </div>
        {folderOpen ? (
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="create-paragraph-set-folder">
              폴더 위치 (선택)
            </label>
            <select
              id="create-paragraph-set-folder"
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
          >
            {folderOpen ? '- 폴더' : '+ 폴더'}
          </button>
        </div>
      </div>

      <CreateParagraphBlocksForm
        blocks={blocks}
        onAddBlock={addBlock}
        onRemoveBlock={removeBlock}
        onUpdateBlock={updateBlock}
        onToggleBlockMemo={toggleBlockMemo}
        disabled={saving}
        error={submitError}
        primaryLabel={saving ? '저장 중…' : '저장하기'}
        secondaryLabel={saving ? null : '저장하고 읽기 시작'}
        onPrimaryClick={handleSave}
        onSecondaryClick={handleSaveAndRead}
        showFab
      />
    </section>
  )
}

export default ParagraphSetCreate
