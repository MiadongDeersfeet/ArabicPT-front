import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteFolder, getFolder, updateFolder } from '../api/folderApi.js'
import { createSet, getSetsByFolder } from '../api/sentenceSetApi.js'

function formatWhen(value) {
  if (value == null || value === '') return null
  try {
    return new Date(value).toLocaleString('ko-KR')
  } catch {
    return null
  }
}

function LibraryFolderDetail() {
  const navigate = useNavigate()
  const { folderId: folderIdParam } = useParams()
  const folderIdNum = Number(folderIdParam)
  const folderIdValid = Number.isInteger(folderIdNum) && folderIdNum > 0

  const [folderMeta, setFolderMeta] = useState(null)
  const [sets, setSets] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(false)

  const [newSetName, setNewSetName] = useState('')
  const [newSetDesc, setNewSetDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState(false)

  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [folderEditName, setFolderEditName] = useState('')
  const [folderEditDesc, setFolderEditDesc] = useState('')
  const [folderSaving, setFolderSaving] = useState(false)
  const [folderSaveErr, setFolderSaveErr] = useState(false)
  const [folderDeleting, setFolderDeleting] = useState(false)

  const loadSets = useCallback(async () => {
    if (!folderIdValid) return
    setListLoading(true)
    setListError(false)
    try {
      const list = await getSetsByFolder(folderIdNum)
      setSets(Array.isArray(list) ? list : [])
    } catch (fetchError) {
      console.error(fetchError)
      setSets([])
      setListError(true)
    } finally {
      setListLoading(false)
    }
  }, [folderIdNum, folderIdValid])

  useEffect(() => {
    let alive = true

    const loadFolder = async () => {
      if (!folderIdValid) return
      try {
        const folder = await getFolder(folderIdNum)
        if (alive) setFolderMeta(folder)
      } catch (fetchError) {
        console.error(fetchError)
        if (alive) setFolderMeta(null)
      }
    }

    loadFolder()
    return () => {
      alive = false
    }
  }, [folderIdNum, folderIdValid])

  useEffect(() => {
    if (folderMeta) {
      setFolderEditName(folderMeta.folderName ?? '')
      setFolderEditDesc(folderMeta.description ?? '')
    }
  }, [folderMeta])

  useEffect(() => {
    loadSets()
  }, [loadSets])

  const folderTitle = useMemo(() => {
    if (!folderIdValid) return '잘못된 폴더'
    return folderMeta?.folderName ?? `폴더 #${folderIdNum}`
  }, [folderIdValid, folderMeta, folderIdNum])

  const handleCreateSet = async (event) => {
    event.preventDefault()
    if (!folderIdValid || creating) return
    const name = newSetName.trim()
    if (!name) return
    setCreating(true)
    setCreateErr(false)
    try {
      await createSet({
        setName: name,
        description: newSetDesc.trim() === '' ? undefined : newSetDesc.trim(),
        folderId: folderIdNum,
      })
      setNewSetName('')
      setNewSetDesc('')
      await loadSets()
    } catch (e) {
      console.error(e)
      setCreateErr(true)
    } finally {
      setCreating(false)
    }
  }

  const openFolderEdit = () => {
    if (!folderMeta) return
    setFolderEditName(folderMeta.folderName ?? '')
    setFolderEditDesc(folderMeta.description ?? '')
    setFolderSaveErr(false)
    setFolderModalOpen(true)
  }

  const saveFolderEdit = async () => {
    if (!folderIdValid || folderSaving) return
    const name = folderEditName.trim()
    if (!name) return
    setFolderSaving(true)
    setFolderSaveErr(false)
    try {
      await updateFolder(folderIdNum, {
        folderName: name,
        // 백엔드: null = 유지, "" = 비우기
        description: folderEditDesc.trim(),
      })
      setFolderModalOpen(false)
      const folder = await getFolder(folderIdNum)
      setFolderMeta(folder)
      await loadSets()
    } catch (e) {
      console.error(e)
      setFolderSaveErr(true)
    } finally {
      setFolderSaving(false)
    }
  }

  const handleDeleteFolder = async () => {
    if (!folderIdValid || folderDeleting || !folderMeta) return
    if (
      !window.confirm(
        `“${folderMeta.folderName}” 폴더를 삭제할까요? 세트는 폴더에서만 빠지고 라이브러리 목록에는 남습니다.`,
      )
    ) {
      return
    }
    setFolderDeleting(true)
    try {
      await deleteFolder(folderIdNum)
      navigate('/library', { replace: true })
    } catch (e) {
      console.error(e)
      window.alert('폴더를 삭제하지 못했습니다.')
    } finally {
      setFolderDeleting(false)
    }
  }

  if (!folderIdValid) {
    return (
      <section className="container sectionSpacing">
        <div className="introCard">
          <h2>폴더를 찾을 수 없습니다</h2>
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
        <h2>{folderTitle}</h2>
        {folderMeta?.description ? <p>{folderMeta.description}</p> : null}
        <div className="libraryTopActions">
          <Link to="/library" className="textLink">
            ← 라이브러리로
          </Link>
          <Link to={`/library/sets/new?folderId=${folderIdNum}`} className="primaryButton libraryCreateSetLink">
            이 폴더에 새 세트 만들기
          </Link>
        </div>
        <div className="libraryFolderDetailManage">
          <button type="button" className="headerGhostButton" onClick={openFolderEdit}>
            폴더 정보 수정
          </button>
          <button
            type="button"
            className="libraryDangerButton"
            onClick={handleDeleteFolder}
            disabled={folderDeleting}
          >
            {folderDeleting ? '삭제 중…' : '폴더 삭제'}
          </button>
        </div>
      </div>

      {folderModalOpen ? (
        <div
          className="libraryModalOverlay"
          role="presentation"
          onClick={() => !folderSaving && setFolderModalOpen(false)}
        >
          <div
            className="libraryModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-detail-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="folder-detail-edit-title" className="libraryModalTitle">
              폴더 수정
            </h3>
            <div className="formGrid">
              <div className="uiField">
                <label className="uiFieldLabel" htmlFor="fld-edit-folder-name">
                  폴더 이름 <span className="libraryRequired">*</span>
                </label>
                <input
                  id="fld-edit-folder-name"
                  className="uiInput"
                  value={folderEditName}
                  onChange={(e) => setFolderEditName(e.target.value)}
                />
              </div>
              <div className="uiField">
                <label className="uiFieldLabel" htmlFor="fld-edit-folder-desc">
                  설명 (선택)
                </label>
                <textarea
                  id="fld-edit-folder-desc"
                  className="uiInput libraryTextarea"
                  rows={3}
                  value={folderEditDesc}
                  onChange={(e) => setFolderEditDesc(e.target.value)}
                />
              </div>
            </div>
            {folderSaveErr ? (
              <p className="libraryFormError" role="alert">
                저장하지 못했습니다.
              </p>
            ) : null}
            <div className="libraryModalActions">
              <button
                type="button"
                className="primaryButton"
                onClick={saveFolderEdit}
                disabled={folderSaving || folderEditName.trim() === ''}
              >
                {folderSaving ? '저장 중…' : '저장'}
              </button>
              <button
                type="button"
                className="headerGhostButton"
                onClick={() => !folderSaving && setFolderModalOpen(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="introCard libraryCreateSection">
        <h3 className="librarySectionTitle">이 폴더에 문장 세트 추가</h3>
        <form className="formGrid libraryCreateFormOnly" onSubmit={handleCreateSet}>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="fld-new-set-name">
              세트 이름 <span className="libraryRequired">*</span>
            </label>
            <input
              id="fld-new-set-name"
              className="uiInput"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              required
            />
          </div>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="fld-new-set-desc">설명 (선택)</label>
            <input
              id="fld-new-set-desc"
              className="uiInput"
              value={newSetDesc}
              onChange={(e) => setNewSetDesc(e.target.value)}
            />
          </div>
          <button type="submit" className="primaryButton" disabled={creating}>
            {creating ? '추가 중…' : '세트 추가'}
          </button>
          {createErr ? (
            <p className="libraryFormError" role="alert">
              문장 세트를 추가하지 못했습니다.
            </p>
          ) : null}
        </form>
      </div>

      <div className="librarySentenceBlock">
        <h3 className="librarySectionTitle">이 폴더의 문장 세트</h3>
        {listLoading ? (
          <p className="libraryStatusText">문장 세트를 불러오는 중입니다.</p>
        ) : listError ? (
          <p className="libraryStatusText">목록을 불러오지 못했습니다.</p>
        ) : sets.length === 0 ? (
          <p className="libraryStatusText">이 폴더에 들어간 문장 세트가 없습니다.</p>
        ) : (
          <div className="cardGrid">
            {sets.map((set) => (
              <Link key={set.setId} to={`/library/sets/${set.setId}`} className="librarySetCardLink">
                <article className="learningCard librarySetCard">
                  <div className="librarySetCardHead">
                    <span className="libraryFolderIcon" aria-hidden="true">
                      📚
                    </span>
                    <h3>{set.setName}</h3>
                  </div>
                  {set.description ? <p>{set.description}</p> : null}
                  <div className="librarySetMeta">
                    {set.folderName ? (
                      <span className="librarySentenceFolder">폴더: {set.folderName}</span>
                    ) : null}
                    {set.sentenceCount != null ? (
                      <span className="librarySetMetaItem">문장 {set.sentenceCount}개</span>
                    ) : null}
                    {formatWhen(set.updatedAt) ? (
                      <span className="librarySetMetaItem">수정 {formatWhen(set.updatedAt)}</span>
                    ) : formatWhen(set.createdAt) ? (
                      <span className="librarySetMetaItem">생성 {formatWhen(set.createdAt)}</span>
                    ) : null}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LibraryFolderDetail
