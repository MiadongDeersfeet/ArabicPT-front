import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiBaseUrl } from '../api/baseUrl.js'
import { getFolders } from '../api/folderApi.js'
import { getParagraphSet, updateParagraphSet } from '../api/paragraphSetApi.js'
import {
  createParagraph,
  deleteParagraph,
  getParagraphsBySet,
  updateParagraph,
} from '../api/paragraphApi.js'
import { createParagraphAudio, getParagraphAudio } from '../api/paragraphAudioApi.js'
import {
  BACK_LANG,
  emptyParagraph,
  FRONT_LANG,
  validateParagraphBlocks,
} from '../lib/paragraphCardDraft.js'

function mapParagraphToEditRow(p) {
  const ft = p.frontText ?? ''
  const bt = p.backText ?? ''
  const m = p.memo ?? ''
  return {
    key: `e-${p.paragraphId}`,
    paragraphId: p.paragraphId,
    frontText: ft,
    backText: bt,
    memo: m,
    memoOpen: Boolean(m),
    original: { frontText: ft, backText: bt, memo: m },
  }
}

function newEmptyEditRow() {
  const c = emptyParagraph()
  return {
    key: `n-${c.id}`,
    paragraphId: null,
    frontText: '',
    backText: '',
    memo: '',
    memoOpen: false,
    original: null,
  }
}

function getFullAudioUrl(audioUrl) {
  if (!audioUrl) return ''
  if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) return audioUrl
  const base = getApiBaseUrl().replace(/\/$/, '')
  if (audioUrl.startsWith('/')) return `${base}${audioUrl}`
  return `${base}/${audioUrl}`
}

function ParagraphSetEdit() {
  const navigate = useNavigate()
  const { paragraphSetId: setIdParam } = useParams()
  const setIdNum = Number(setIdParam)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [setName, setSetName] = useState('')
  const [setDescription, setSetDescription] = useState('')
  const [initialSetName, setInitialSetName] = useState('')
  const [initialSetDescription, setInitialSetDescription] = useState('')
  const [folderId, setFolderId] = useState('')
  const [initialFolderId, setInitialFolderId] = useState('')
  const [folders, setFolders] = useState([])
  const [rows, setRows] = useState([])
  const [removedParagraphIds, setRemovedParagraphIds] = useState(() => new Set())
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [audioStateByParagraphId, setAudioStateByParagraphId] = useState({})
  const [modifiedParagraphMap, setModifiedParagraphMap] = useState({})

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
    if (!setIdValid) return
    let alive = true
    ;(async () => {
      setLoading(true)
      setLoadError(false)
      try {
        const [meta, list] = await Promise.all([getParagraphSet(setIdNum), getParagraphsBySet(setIdNum)])
        if (!alive) return
        const name = meta?.setName ?? ''
        const desc = meta?.description ?? ''
        setSetName(name)
        setSetDescription(desc)
        setInitialSetName(name)
        setInitialSetDescription(desc)
        const fId = meta?.folderId != null ? String(meta.folderId) : ''
        setFolderId(fId)
        setInitialFolderId(fId)
        const mapped = Array.isArray(list) ? list.map(mapParagraphToEditRow) : []
        setRows(mapped.length > 0 ? mapped : [newEmptyEditRow()])
        setRemovedParagraphIds(new Set())
      } catch (e) {
        console.error(e)
        if (!alive) return
        setLoadError(true)
        setRows([newEmptyEditRow()])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [setIdNum, setIdValid])

  const paragraphIdsKey = useMemo(
    () =>
      rows
        .map((r) => r.paragraphId)
        .filter((id) => id != null)
        .sort((a, b) => a - b)
        .join(','),
    [rows],
  )

  useEffect(() => {
    const ids = paragraphIdsKey === '' ? [] : paragraphIdsKey.split(',').map(Number)
    if (ids.length === 0) {
      setAudioStateByParagraphId({})
      setModifiedParagraphMap({})
      return
    }
    let alive = true
    ;(async () => {
      const entries = await Promise.all(
        ids.map(async (paragraphId) => {
          try {
            const audio = await getParagraphAudio(paragraphId)
            if (audio?.audioUrl) {
              return [paragraphId, { status: 'done', audioUrl: audio.audioUrl }]
            }
            return [paragraphId, { status: 'none', audioUrl: null }]
          } catch {
            return [paragraphId, { status: 'none', audioUrl: null }]
          }
        }),
      )
      if (!alive) return
      setAudioStateByParagraphId(Object.fromEntries(entries))
      setModifiedParagraphMap((prev) => {
        const next = {}
        for (const id of ids) {
          next[id] = Boolean(prev[id])
        }
        return next
      })
    })()
    return () => {
      alive = false
    }
  }, [paragraphIdsKey])

  useEffect(() => {
    setModifiedParagraphMap((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        if (row.paragraphId == null || !row.original) continue
        const o = row.original
        const changed =
          row.frontText.trim() !== (o.frontText ?? '').trim() ||
          row.backText.trim() !== (o.backText ?? '').trim() ||
          (row.memo ?? '').trim() !== (o.memo ?? '').trim()
        if (changed) next[row.paragraphId] = true
      }
      return next
    })
  }, [rows])

  const folderOptions = useMemo(() => {
    return [...folders].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  }, [folders])

  const updateRow = (key, field, value) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
  }

  const toggleMemo = (key) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, memoOpen: !r.memoOpen } : r)))
  }

  const addRow = () => setRows((prev) => [...prev, newEmptyEditRow()])

  const removeRow = (key) => {
    setRows((prev) => {
      const row = prev.find((r) => r.key === key)
      if (row?.paragraphId != null) {
        setRemovedParagraphIds((s) => new Set([...s, row.paragraphId]))
      }
      const next = prev.filter((r) => r.key !== key)
      return next.length === 0 ? [newEmptyEditRow()] : next
    })
  }

  const handleGenerateAudio = async (paragraphId) => {
    setAudioStateByParagraphId((prev) => ({
      ...prev,
      [paragraphId]: { ...(prev[paragraphId] ?? {}), status: 'loading' },
    }))
    try {
      const created = await createParagraphAudio(paragraphId)
      setAudioStateByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: {
          status: created?.audioUrl ? 'done' : 'error',
          audioUrl: created?.audioUrl ?? null,
        },
      }))
      if (created?.audioUrl) {
        setModifiedParagraphMap((prev) => ({ ...prev, [paragraphId]: false }))
      }
    } catch {
      setAudioStateByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: { ...(prev[paragraphId] ?? {}), status: 'error' },
      }))
    }
  }

  const handlePlayAudio = async (paragraphId) => {
    const entry = audioStateByParagraphId[paragraphId]
    const url = getFullAudioUrl(entry?.audioUrl)
    if (!url) return
    try {
      const audio = new Audio(url)
      await audio.play()
    } catch {
      setAudioStateByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: { ...(prev[paragraphId] ?? {}), status: 'error' },
      }))
    }
  }

  const handleSave = async () => {
    if (!setIdValid || saving) return
    setSaveError('')
    const nameTrim = setName.trim()
    if (!nameTrim) {
      setSaveError('세트 제목을 입력해 주세요.')
      return
    }

    const validation = validateParagraphBlocks(rows, { allowEmptySet: true })
    if (!validation.ok) {
      setSaveError(validation.message)
      return
    }

    const toDelete = new Set(removedParagraphIds)
    for (const row of rows) {
      if (row.paragraphId != null && !row.frontText.trim() && !row.backText.trim()) {
        toDelete.add(row.paragraphId)
      }
    }

    setSaving(true)
    try {
      const setPatch = {}
      if (nameTrim !== initialSetName.trim()) setPatch.setName = nameTrim
      if (setDescription.trim() !== initialSetDescription.trim()) {
        setPatch.description = setDescription.trim()
      }
      if (folderId !== initialFolderId) {
        if (folderId === '') {
          setPatch.clearFolder = true
        } else {
          setPatch.folderId = Number(folderId)
        }
      }
      if (Object.keys(setPatch).length > 0) {
        await updateParagraphSet(setIdNum, setPatch)
      }

      for (const id of toDelete) {
        await deleteParagraph(id)
      }

      let order = 1
      for (const row of rows) {
        if (row.paragraphId == null || toDelete.has(row.paragraphId)) continue
        const ft = row.frontText.trim()
        const bt = row.backText.trim()
        if (!ft && !bt) continue
        const o = row.original
        const memoTrim = row.memo.trim() === '' ? null : row.memo.trim()
        const origMemo =
          !o || o.memo == null || String(o.memo).trim() === '' ? null : String(o.memo).trim()
        if (o && (ft !== (o.frontText ?? '').trim() || bt !== (o.backText ?? '').trim() || memoTrim !== origMemo)) {
          await updateParagraph(row.paragraphId, {
            frontText: ft,
            backText: bt,
            memo: row.memo,
            displayOrder: order,
          })
        } else if (row.paragraphId != null) {
          await updateParagraph(row.paragraphId, { displayOrder: order })
        }
        order += 1
      }

      let newOrder = order
      for (const row of rows) {
        if (row.paragraphId != null) continue
        const ft = row.frontText.trim()
        const bt = row.backText.trim()
        if (!ft || !bt) continue
        await createParagraph(setIdNum, {
          frontLang: FRONT_LANG,
          frontText: ft,
          backLang: BACK_LANG,
          backText: bt,
          memo: row.memo.trim() === '' ? null : row.memo.trim(),
          displayOrder: newOrder,
        })
        newOrder += 1
      }

      navigate(`/library/paragraph-sets/${setIdNum}`, { replace: true })
    } catch (e) {
      console.error(e)
      setSaveError(
        e?.response?.data?.message ??
          e?.response?.data?.data?.reason ??
          e?.message ??
          '저장 중 오류가 발생했습니다.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!setIdValid) {
    return (
      <section className="container sectionSpacing">
        <div className="introCard">
          <h2>잘못된 주소입니다</h2>
          <Link to="/library/paragraph-sets" className="textLink">
            ← 문단 라이브러리로
          </Link>
        </div>
      </section>
    )
  }

  if (loading) {
    return <p className="libraryStatusText container sectionSpacing">불러오는 중입니다.</p>
  }

  if (loadError) {
    return (
      <section className="container sectionSpacing">
        <p className="libraryStatusText">불러오지 못했습니다.</p>
        <Link to={`/library/paragraph-sets/${setIdNum}`} className="textLink">
          ← 상세로
        </Link>
      </section>
    )
  }

  return (
    <section className="container sectionSpacing librarySetEditPage paragraphSetEditPage">
      <div className="librarySetEditHeader">
        <Link to={`/library/paragraph-sets/${setIdNum}`} className="textLink createSetBackLink">
          X
        </Link>
        <h1 className="librarySetEditTitle">문단 세트 편집</h1>
      </div>

      <div className="introCard librarySetEditMetaCard">
        <div className="uiField">
          <label className="uiFieldLabel">제목</label>
          <input className="uiInput librarySetEditUnderlineInput" value={setName} onChange={(e) => setSetName(e.target.value)} />
        </div>
        <div className="uiField">
          <label className="uiFieldLabel">설명</label>
          <textarea
            className="uiInput librarySetEditUnderlineArea"
            rows={2}
            value={setDescription}
            onChange={(e) => setSetDescription(e.target.value)}
          />
        </div>
        <div className="uiField">
          <label className="uiFieldLabel">폴더</label>
          <select className="uiInput createSetSelect" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
            <option value="">폴더 없음</option>
            {folderOptions.map((f) => (
              <option key={f.folderId} value={String(f.folderId)}>
                {f.folderName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="librarySetEditCardList paragraphEditBlockList">
        {rows.map((row, index) => {
          const audioEntry = row.paragraphId != null ? audioStateByParagraphId[row.paragraphId] : null
          const modified = row.paragraphId != null && modifiedParagraphMap[row.paragraphId]
          return (
            <li key={row.key} className="librarySetEditCard paragraphEditBlock">
              <div className="createSetCardToolbar">
                <span className="createSetCardNumber">페이지 {index + 1}</span>
                <button type="button" className="createSetCardRemove" onClick={() => removeRow(row.key)} disabled={rows.length <= 1}>
                  삭제
                </button>
              </div>
              <div className="librarySetEditTwoCol paragraphEditTwoCol">
                <div className="uiField">
                  <label className="uiFieldLabel">한국어 문단</label>
                  <textarea
                    className="uiInput libraryTextarea paragraphTextarea paragraphTextarea--ko"
                    dir="ltr"
                    rows={5}
                    value={row.frontText}
                    onChange={(e) => updateRow(row.key, 'frontText', e.target.value)}
                  />
                </div>
                <div className="uiField">
                  <label className="uiFieldLabel">아랍어 문단</label>
                  <textarea
                    className="uiInput libraryTextarea paragraphTextarea paragraphTextarea--ar"
                    dir="rtl"
                    rows={5}
                    value={row.backText}
                    onChange={(e) => updateRow(row.key, 'backText', e.target.value)}
                  />
                </div>
              </div>
              {row.memoOpen ? (
                <div className="uiField">
                  <label className="uiFieldLabel">메모</label>
                  <textarea
                    className="uiInput libraryTextarea"
                    rows={2}
                    value={row.memo}
                    onChange={(e) => updateRow(row.key, 'memo', e.target.value)}
                  />
                </div>
              ) : null}
              <button type="button" className="createSetDescToggleBtn" onClick={() => toggleMemo(row.key)}>
                {row.memoOpen ? '- 메모' : '+ 메모'}
              </button>
              {row.paragraphId != null ? (
                <div className="librarySetEditAudioRow">
                  {audioEntry?.status === 'done' && !modified ? (
                    <>
                      <span className="libraryAudioDone">✓ 음성 있음</span>
                      <button type="button" className="libraryAudioButton" onClick={() => handlePlayAudio(row.paragraphId)}>
                        재생
                      </button>
                    </>
                  ) : null}
                  {(modified || audioEntry?.status === 'error' || audioEntry?.status === 'none') && (
                    <button
                      type="button"
                      className="libraryAudioButton"
                      disabled={audioEntry?.status === 'loading'}
                      onClick={() => handleGenerateAudio(row.paragraphId)}
                    >
                      {audioEntry?.status === 'loading' ? '생성 중…' : modified ? '다시 생성' : '음성 생성'}
                    </button>
                  )}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <button type="button" className="createSetAddCardBtn" onClick={addRow}>
        + 페이지 추가
      </button>

      {saveError ? (
        <p className="libraryFormError createSetError" role="alert">
          {saveError}
        </p>
      ) : null}

      <div className="librarySetEditStickyActions">
        <button type="button" className="uiButton uiButton--secondary" onClick={() => navigate(`/library/paragraph-sets/${setIdNum}`)}>
          취소
        </button>
        <button type="button" className="primaryButton" disabled={saving} onClick={handleSave}>
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>
    </section>
  )
}

export default ParagraphSetEdit
