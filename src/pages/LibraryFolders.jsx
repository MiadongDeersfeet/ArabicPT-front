import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createFolder,
  deleteFolder,
  getFolders,
  updateFolder,
} from '../api/folderApi.js'

function LibraryFolders() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDesc, setNewFolderDesc] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [createFolderErr, setCreateFolderErr] = useState(false)

  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [folderEditId, setFolderEditId] = useState(null)
  const [folderEditName, setFolderEditName] = useState('')
  const [folderEditDesc, setFolderEditDesc] = useState('')
  const [folderSaving, setFolderSaving] = useState(false)
  const [folderSaveErr, setFolderSaveErr] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const folderList = await getFolders()
      setFolders(Array.isArray(folderList) ? folderList : [])
    } catch (fetchError) {
      console.error(fetchError)
      setFolders([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      const ao = a.displayOrder ?? 0
      const bo = b.displayOrder ?? 0
      return ao - bo
    })
  }, [folders])

  const handleCreateFolder = async (event) => {
    event.preventDefault()
    if (creatingFolder) return
    const name = newFolderName.trim()
    if (!name) return
    setCreatingFolder(true)
    setCreateFolderErr(false)
    try {
      await createFolder({
        folderName: name,
        description: newFolderDesc.trim() === '' ? undefined : newFolderDesc.trim(),
      })
      setNewFolderName('')
      setNewFolderDesc('')
      await load()
    } catch (e) {
      console.error(e)
      setCreateFolderErr(true)
    } finally {
      setCreatingFolder(false)
    }
  }

  const openFolderEdit = (folder) => {
    setFolderEditId(folder.folderId)
    setFolderEditName(folder.folderName ?? '')
    setFolderEditDesc(folder.description ?? '')
    setFolderSaveErr(false)
    setFolderModalOpen(true)
  }

  const saveFolderEdit = async () => {
    if (folderEditId == null || folderSaving) return
    const name = folderEditName.trim()
    if (!name) return
    setFolderSaving(true)
    setFolderSaveErr(false)
    try {
      await updateFolder(folderEditId, {
        folderName: name,
        description: folderEditDesc.trim(),
      })
      setFolderModalOpen(false)
      setFolderEditId(null)
      await load()
    } catch (e) {
      console.error(e)
      setFolderSaveErr(true)
    } finally {
      setFolderSaving(false)
    }
  }

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`“${folder.folderName}” 폴더를 삭제할까요? 세트는 폴더에서만 빠지고 목록에는 남습니다.`)) {
      return
    }
    try {
      await deleteFolder(folder.folderId)
      await load()
    } catch (e) {
      console.error(e)
      window.alert('폴더를 삭제하지 못했습니다.')
    }
  }

  return (
    <section className="container sectionSpacing">
      <div className="introCard" role="region" aria-label="폴더 페이지">
        <h2>폴더 페이지</h2>
        <p className="libraryPolicyHint">폴더 생성/수정/삭제를 여기에서 관리합니다.</p>
        <Link to="/library" className="textLink">
          문장 세트 페이지로 돌아가기
        </Link>
      </div>

      <div className="introCard libraryFolderCreateCard">
        <h3 className="librarySectionTitle">폴더 만들기</h3>
        <form className="formGrid libraryCreateFormOnly" onSubmit={handleCreateFolder}>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="lib-new-folder-name">
              폴더 이름 <span className="libraryRequired">*</span>
            </label>
            <input
              id="lib-new-folder-name"
              className="uiInput"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
            />
          </div>
          <div className="uiField">
            <label className="uiFieldLabel" htmlFor="lib-new-folder-desc">
              설명 (선택)
            </label>
            <input
              id="lib-new-folder-desc"
              className="uiInput"
              value={newFolderDesc}
              onChange={(e) => setNewFolderDesc(e.target.value)}
            />
          </div>
          <button type="submit" className="primaryButton" disabled={creatingFolder}>
            {creatingFolder ? '만드는 중…' : '폴더 만들기'}
          </button>
          {createFolderErr ? (
            <p className="libraryFormError" role="alert">
              폴더를 만들지 못했습니다.
            </p>
          ) : null}
        </form>
      </div>

      {loading ? (
        <p className="libraryStatusText">폴더 목록을 불러오는 중입니다.</p>
      ) : error ? (
        <p className="libraryStatusText">폴더 목록을 불러오지 못했습니다.</p>
      ) : sortedFolders.length === 0 ? (
        <p className="libraryStatusText">아직 만든 폴더가 없습니다.</p>
      ) : (
        <div className="cardGrid">
          {sortedFolders.map((folder) => (
            <article key={folder.folderId} className="learningCard libraryFolderCard">
              <Link to={`/library/folders/${folder.folderId}`} className="libraryFolderCardMainLink">
                <div className="libraryFolderCardHead">
                  <span className="libraryFolderIcon" aria-hidden="true">
                    📁
                  </span>
                  <h3>{folder.folderName}</h3>
                  {folder.isDefault === 'Y' ? <span className="libraryFolderBadge">기본</span> : null}
                </div>
                {folder.description ? <p>{folder.description}</p> : null}
              </Link>
              <div className="libraryFolderCardActions">
                <button type="button" className="headerGhostButton" onClick={() => openFolderEdit(folder)}>
                  수정
                </button>
                <button
                  type="button"
                  className="libraryDangerButton"
                  onClick={() => handleDeleteFolder(folder)}
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

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
            aria-labelledby="folder-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="folder-edit-title" className="libraryModalTitle">
              폴더 수정
            </h3>
            <div className="formGrid">
              <div className="uiField">
                <label className="uiFieldLabel" htmlFor="lib-edit-folder-name">
                  폴더 이름 <span className="libraryRequired">*</span>
                </label>
                <input
                  id="lib-edit-folder-name"
                  className="uiInput"
                  value={folderEditName}
                  onChange={(e) => setFolderEditName(e.target.value)}
                />
              </div>
              <div className="uiField">
                <label className="uiFieldLabel" htmlFor="lib-edit-folder-desc">
                  설명 (선택)
                </label>
                <textarea
                  id="lib-edit-folder-desc"
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
    </section>
  )
}

export default LibraryFolders
