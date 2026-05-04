import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFolders } from '../api/folderApi.js'
import { deleteSet, getSet, updateSet } from '../api/sentenceSetApi.js'
import { createSentence, deleteSentence, getSentencesBySet, updateSentence } from '../api/sentenceApi.js'

const DEFAULT_FRONT_LANG = 'ko-KR'
const DEFAULT_BACK_LANG = 'ar-SA'

function LibrarySetDetail() {
  const { setId: setIdParam } = useParams()
  const navigate = useNavigate()
  const setIdNum = Number(setIdParam)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [setMeta, setSetMeta] = useState(null)
  const [folders, setFolders] = useState([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [folderMoveBusy, setFolderMoveBusy] = useState(false)
  const [folderMoveError, setFolderMoveError] = useState(false)
  const [editMetaOpen, setEditMetaOpen] = useState(false)
  const [editSetName, setEditSetName] = useState('')
  const [editSetDesc, setEditSetDesc] = useState('')
  const [metaSaving, setMetaSaving] = useState(false)
  const [metaError, setMetaError] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(false)

  const [frontText, setFrontText] = useState('')
  const [backText, setBackText] = useState('')
  const [memo, setMemo] = useState('')
  const [frontLang, setFrontLang] = useState(DEFAULT_FRONT_LANG)
  const [backLang, setBackLang] = useState(DEFAULT_BACK_LANG)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')
  const [editMemo, setEditMemo] = useState('')
  const [editFrontLang, setEditFrontLang] = useState('')
  const [editBackLang, setEditBackLang] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const loadAll = useCallback(async () => {
    if (!setIdValid) return
    setLoading(true)
    setListError(false)
    try {
      const [meta, list] = await Promise.all([getSet(setIdNum), getSentencesBySet(setIdNum)])
      setSetMeta(meta)
      setSentences(Array.isArray(list) ? list : [])
    } catch (e) {
      console.error(e)
      setSetMeta(null)
      setSentences([])
      setListError(true)
    } finally {
      setLoading(false)
    }
  }, [setIdNum, setIdValid])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    let alive = true
    const loadFolders = async () => {
      if (!setIdValid) return
      setFoldersLoading(true)
      try {
        const list = await getFolders()
        if (alive) setFolders(Array.isArray(list) ? list : [])
      } catch (e) {
        console.error(e)
        if (alive) setFolders([])
      } finally {
        if (alive) setFoldersLoading(false)
      }
    }
    loadFolders()
    return () => {
      alive = false
    }
  }, [setIdValid])

  const openEditMeta = () => {
    if (!setMeta) return
    setEditSetName(setMeta.setName ?? '')
    setEditSetDesc(setMeta.description ?? '')
    setMetaError(false)
    setEditMetaOpen(true)
  }

  const saveEditMeta = async () => {
    if (!setIdValid || metaSaving) return
    const name = editSetName.trim()
    if (!name) return
    setMetaSaving(true)
    setMetaError(false)
    try {
      await updateSet(setIdNum, {
        setName: name,
        // 백엔드: null = 유지, "" = 비우기
        description: editSetDesc.trim(),
      })
      setEditMetaOpen(false)
      await loadAll()
    } catch (e) {
      console.error(e)
      setMetaError(true)
    } finally {
      setMetaSaving(false)
    }
  }

  /** 백엔드는 폴더 제거 시 `clearFolder: true`를 기대합니다(null folderId만으로는 분리되지 않음). */
  const handleFolderSelectChange = async (event) => {
    if (!setIdValid || folderMoveBusy || !setMeta) return
    const raw = event.target.value
    const currentId = setMeta.folderId != null ? String(setMeta.folderId) : ''
    if (raw === currentId) return
    setFolderMoveBusy(true)
    setFolderMoveError(false)
    try {
      if (raw === '') {
        await updateSet(setIdNum, { clearFolder: true })
      } else {
        await updateSet(setIdNum, { folderId: Number(raw) })
      }
      await loadAll()
    } catch (e) {
      console.error(e)
      setFolderMoveError(true)
    } finally {
      setFolderMoveBusy(false)
    }
  }

  const handleDeleteSet = async () => {
    if (!setIdValid || deleteBusy) return
    if (
      !window.confirm(
        '이 문장 세트를 삭제할까요? 세트 안의 모든 문장도 함께 삭제될 수 있습니다.',
      )
    ) {
      return
    }
    setDeleteBusy(true)
    try {
      await deleteSet(setIdNum)
      navigate('/library', { replace: true })
    } catch (e) {
      console.error(e)
      window.alert('문장 세트를 삭제하지 못했습니다.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!setIdValid || createSubmitting) return
    const tf = frontText.trim()
    const tb = backText.trim()
    if (!tf || !tb) return
    setCreateSubmitting(true)
    setCreateError(false)
    try {
      await createSentence(setIdNum, {
        frontLang: frontLang.trim() || DEFAULT_FRONT_LANG,
        frontText: tf,
        backLang: backLang.trim() || DEFAULT_BACK_LANG,
        backText: tb,
        memo: memo.trim() === '' ? null : memo.trim(),
      })
      setFrontText('')
      setBackText('')
      setMemo('')
      await loadAll()
    } catch (e) {
      console.error(e)
      setCreateError(true)
    } finally {
      setCreateSubmitting(false)
    }
  }

  const startEdit = (s) => {
    setEditingId(s.sentenceId)
    setEditFront(s.frontText ?? '')
    setEditBack(s.backText ?? '')
    setEditMemo(s.memo ?? '')
    setEditFrontLang(s.frontLang ?? DEFAULT_FRONT_LANG)
    setEditBackLang(s.backLang ?? DEFAULT_BACK_LANG)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async () => {
    if (editingId == null || editSaving) return
    setEditSaving(true)
    try {
      await updateSentence(editingId, {
        frontLang: editFrontLang.trim() || undefined,
        frontText: editFront.trim() || undefined,
        backLang: editBackLang.trim() || undefined,
        backText: editBack.trim() || undefined,
        // 백엔드: null = 유지, "" = 비우기
        memo: editMemo.trim(),
      })
      setEditingId(null)
      await loadAll()
    } catch (e) {
      console.error(e)
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (sentenceId) => {
    if (!window.confirm('이 문장을 삭제할까요?')) return
    try {
      await deleteSentence(sentenceId)
      if (editingId === sentenceId) setEditingId(null)
      await loadAll()
    } catch (e) {
      console.error(e)
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
    <section className="container sectionSpacing">
      <div className="introCard">
        <h2>{setMeta?.setName ?? '문장 세트'}</h2>
        {setMeta?.description ? <p>{setMeta.description}</p> : null}
        {setMeta?.folderName ? (
          <p className="libraryPolicyHint">폴더: {setMeta.folderName}</p>
        ) : null}
        <div className="libraryTopActions">
          <Link to="/library" className="textLink">
            ← 라이브러리로
          </Link>
          <Link to={`/study/sets/${setIdNum}`} className="primaryButton libraryStudyLink">
            이 세트로 학습
          </Link>
        </div>
      </div>

      <div className="introCard librarySetManageSection" aria-label="세트 관리">
        <h3 className="librarySectionTitle">세트 관리</h3>
        <div className="librarySetManageRow">
          <button type="button" className="headerGhostButton" onClick={openEditMeta}>
            제목·설명 수정
          </button>
          <button
            type="button"
            className="libraryDangerButton"
            onClick={handleDeleteSet}
            disabled={deleteBusy}
          >
            {deleteBusy ? '삭제 중…' : '세트 삭제'}
          </button>
        </div>
        <div className="uiField libraryFolderMoveField">
          <label className="uiFieldLabel" htmlFor="set-folder-select">
            폴더
          </label>
          <select
            id="set-folder-select"
            className="uiInput librarySelect"
            value={setMeta?.folderId != null ? String(setMeta.folderId) : ''}
            onChange={handleFolderSelectChange}
            disabled={loading || folderMoveBusy || foldersLoading}
          >
            <option value="">폴더 없음</option>
            {folders.map((f) => (
              <option key={f.folderId} value={String(f.folderId)}>
                {f.folderName}
              </option>
            ))}
          </select>
          {folderMoveError ? (
            <p className="libraryFormError" role="alert">
              폴더를 변경하지 못했습니다.
            </p>
          ) : null}
        </div>
      </div>

      {editMetaOpen ? (
        <div
          className="libraryModalOverlay"
          role="presentation"
          onClick={() => !metaSaving && setEditMetaOpen(false)}
        >
          <div
            className="libraryModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="set-meta-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="set-meta-edit-title" className="libraryModalTitle">
              세트 정보 수정
            </h3>
            <div className="formGrid">
              <div className="uiField">
                <label className="uiFieldLabel" htmlFor="edit-set-name">
                  세트 제목 <span className="libraryRequired">*</span>
                </label>
                <input
                  id="edit-set-name"
                  className="uiInput"
                  value={editSetName}
                  onChange={(e) => setEditSetName(e.target.value)}
                />
              </div>
              <div className="uiField">
                <label className="uiFieldLabel" htmlFor="edit-set-desc">
                  설명 (선택)
                </label>
                <textarea
                  id="edit-set-desc"
                  className="uiInput libraryTextarea"
                  rows={3}
                  value={editSetDesc}
                  onChange={(e) => setEditSetDesc(e.target.value)}
                />
              </div>
            </div>
            {metaError ? (
              <p className="libraryFormError" role="alert">
                저장하지 못했습니다.
              </p>
            ) : null}
            <div className="libraryModalActions">
              <button
                type="button"
                className="primaryButton"
                onClick={saveEditMeta}
                disabled={metaSaving || editSetName.trim() === ''}
              >
                {metaSaving ? '저장 중…' : '저장'}
              </button>
              <button
                type="button"
                className="headerGhostButton"
                onClick={() => !metaSaving && setEditMetaOpen(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="introCard libraryCreateSection">
        <h3 className="librarySectionTitle">문장 추가</h3>
        <p className="libraryCreateHint">문장은 이 문장 세트에만 저장됩니다.</p>
        <form className="formGrid libraryCreateFormOnly" onSubmit={handleCreate}>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="add-front-lang">앞면 언어</label>
            <input
              id="add-front-lang"
              className="uiInput"
              value={frontLang}
              onChange={(e) => setFrontLang(e.target.value)}
            />
          </div>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="add-back-lang">뒷면 언어</label>
            <input
              id="add-back-lang"
              className="uiInput"
              value={backLang}
              onChange={(e) => setBackLang(e.target.value)}
            />
          </div>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="add-front-text">
              앞면 문장 <span className="libraryRequired">*</span>
            </label>
            <textarea
              id="add-front-text"
              className="uiInput libraryTextarea"
              rows={3}
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              required
            />
          </div>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="add-back-text">
              뒷면 문장 <span className="libraryRequired">*</span>
            </label>
            <textarea
              id="add-back-text"
              className="uiInput libraryTextarea"
              rows={3}
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              required
            />
          </div>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="add-memo">메모 (선택)</label>
            <input id="add-memo" className="uiInput" value={memo} onChange={(e) => setMemo(e.target.value)} />
          </div>
          <button type="submit" className="primaryButton" disabled={createSubmitting}>
            {createSubmitting ? '저장 중…' : '문장 저장'}
          </button>
          {createError ? (
            <p className="libraryFormError" role="alert">
              문장을 저장하지 못했습니다.
            </p>
          ) : null}
        </form>
      </div>

      <div className="librarySentenceBlock">
        <h3 className="librarySectionTitle">이 세트의 문장</h3>
        {loading ? (
          <p className="libraryStatusText">불러오는 중입니다.</p>
        ) : listError ? (
          <p className="libraryStatusText">불러오지 못했습니다.</p>
        ) : sentences.length === 0 ? (
          <p className="libraryStatusText">
            아직 이 세트에 문장이 없습니다. 첫 문장을 추가해보세요.
          </p>
        ) : (
          <ul className="librarySentenceList">
            {sentences.map((sentence) => (
              <li key={sentence.sentenceId} className="librarySentenceRow">
                {editingId === sentence.sentenceId ? (
                  <div className="libraryEditForm">
                    <div className="uiField">
                      <label className="uiFieldLabel">앞면 언어</label>
                      <input
                        className="uiInput"
                        value={editFrontLang}
                        onChange={(e) => setEditFrontLang(e.target.value)}
                      />
                    </div>
                    <div className="uiField">
                      <label className="uiFieldLabel">뒷면 언어</label>
                      <input
                        className="uiInput"
                        value={editBackLang}
                        onChange={(e) => setEditBackLang(e.target.value)}
                      />
                    </div>
                    <div className="uiField">
                      <label className="uiFieldLabel">앞면 문장</label>
                      <textarea
                        className="uiInput libraryTextarea"
                        rows={3}
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                      />
                    </div>
                    <div className="uiField">
                      <label className="uiFieldLabel">뒷면 문장</label>
                      <textarea
                        className="uiInput libraryTextarea"
                        rows={3}
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                      />
                    </div>
                    <div className="uiField">
                      <label className="uiFieldLabel">메모</label>
                      <input className="uiInput" value={editMemo} onChange={(e) => setEditMemo(e.target.value)} />
                    </div>
                    <div className="libraryEditActions">
                      <button type="button" className="primaryButton" onClick={saveEdit} disabled={editSaving}>
                        {editSaving ? '저장 중…' : '저장'}
                      </button>
                      <button type="button" className="headerGhostButton" onClick={cancelEdit}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="librarySentenceMeta">
                      <span className="librarySentenceLangs">
                        {sentence.frontLang} → {sentence.backLang}
                      </span>
                    </div>
                    <p className="librarySentenceFront">{sentence.frontText}</p>
                    <p className="librarySentenceBack" dir="auto">
                      {sentence.backText}
                    </p>
                    {sentence.memo ? <p className="librarySentenceMemo">메모: {sentence.memo}</p> : null}
                    <div className="librarySentenceActions">
                      <button type="button" className="headerGhostButton" onClick={() => startEdit(sentence)}>
                        수정
                      </button>
                      <button
                        type="button"
                        className="headerGhostButton"
                        onClick={() => handleDelete(sentence.sentenceId)}
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default LibrarySetDetail
