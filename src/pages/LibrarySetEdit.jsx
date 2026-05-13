import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getSet, updateSet } from '../api/sentenceSetApi.js'
import { createSentence, deleteSentence, getSentencesBySet, updateSentence } from '../api/sentenceApi.js'
import { generateSentenceAudio, getSentenceAudio } from '../api/audioApi.js'
import { BACK_LANG, emptyCard, FRONT_LANG, validateSentenceCards } from '../lib/sentenceCardDraft.js'

function mapSentenceToEditRow(s) {
  const ft = s.frontText ?? ''
  const bt = s.backText ?? ''
  const m = s.memo ?? ''
  return {
    key: `e-${s.sentenceId}`,
    sentenceId: s.sentenceId,
    frontText: ft,
    backText: bt,
    memo: m,
    memoOpen: Boolean(m),
    original: { frontText: ft, backText: bt, memo: m },
  }
}

function newEmptyEditRow() {
  const c = emptyCard()
  return {
    key: `n-${c.id}`,
    sentenceId: null,
    frontText: '',
    backText: '',
    memo: '',
    memoOpen: false,
    original: null,
  }
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" className="librarySetEditTrashSvg">
      <path
        d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LibrarySetEdit() {
  const navigate = useNavigate()
  const { setId: setIdParam } = useParams()
  const setIdNum = Number(setIdParam)
  const setIdValid = Number.isInteger(setIdNum) && setIdNum > 0

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [setName, setSetName] = useState('')
  const [setDescription, setSetDescription] = useState('')
  const [initialSetName, setInitialSetName] = useState('')
  const [initialSetDescription, setInitialSetDescription] = useState('')
  const [rows, setRows] = useState([])
  const [removedSentenceIds, setRemovedSentenceIds] = useState(() => new Set())
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [audioStateBySentenceId, setAudioStateBySentenceId] = useState({})
  const [modifiedSentenceMap, setModifiedSentenceMap] = useState({})

  useEffect(() => {
    if (!setIdValid) return
    let alive = true
    ;(async () => {
      setLoading(true)
      setLoadError(false)
      try {
        const [meta, list] = await Promise.all([getSet(setIdNum), getSentencesBySet(setIdNum)])
        if (!alive) return
        const name = meta?.setName ?? ''
        const desc = meta?.description ?? ''
        setSetName(name)
        setSetDescription(desc)
        setInitialSetName(name)
        setInitialSetDescription(desc)
        const mapped = Array.isArray(list) ? list.map(mapSentenceToEditRow) : []
        setRows(mapped.length > 0 ? mapped : [newEmptyEditRow()])
        setRemovedSentenceIds(new Set())
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

  const sentenceIdsKey = useMemo(
    () =>
      rows
        .map((r) => r.sentenceId)
        .filter((id) => id != null)
        .sort((a, b) => a - b)
        .join(','),
    [rows],
  )

  useEffect(() => {
    const ids = sentenceIdsKey === '' ? [] : sentenceIdsKey.split(',').map(Number)
    if (ids.length === 0) {
      setAudioStateBySentenceId({})
      setModifiedSentenceMap({})
      return
    }
    let alive = true
    ;(async () => {
      const entries = await Promise.all(
        ids.map(async (sentenceId) => {
          try {
            const audio = await getSentenceAudio(sentenceId)
            if (audio?.audioUrl) {
              return [sentenceId, { status: 'done', audioUrl: audio.audioUrl }]
            }
            return [sentenceId, { status: 'none', audioUrl: null }]
          } catch {
            return [sentenceId, { status: 'none', audioUrl: null }]
          }
        }),
      )
      if (!alive) return
      setAudioStateBySentenceId(Object.fromEntries(entries))
      setModifiedSentenceMap((prev) => {
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
  }, [sentenceIdsKey])

  useEffect(() => {
    setModifiedSentenceMap((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        if (row.sentenceId == null || !row.original) continue
        const o = row.original
        const changed =
          row.frontText.trim() !== (o.frontText ?? '').trim() ||
          row.backText.trim() !== (o.backText ?? '').trim() ||
          (row.memo ?? '').trim() !== (o.memo ?? '').trim()
        if (changed) next[row.sentenceId] = true
      }
      return next
    })
  }, [rows])

  const updateRow = (key, field, value) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
  }

  const toggleMemo = (key) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, memoOpen: !r.memoOpen } : r)))
  }

  const addRow = () => {
    setRows((prev) => [...prev, newEmptyEditRow()])
  }

  const removeRow = (key) => {
    setRows((prev) => {
      const row = prev.find((r) => r.key === key)
      if (row?.sentenceId != null) {
        setRemovedSentenceIds((s) => new Set([...s, row.sentenceId]))
      }
      const next = prev.filter((r) => r.key !== key)
      return next.length === 0 ? [newEmptyEditRow()] : next
    })
  }

  const handleGenerateAudio = async (sentenceId) => {
    setAudioStateBySentenceId((prev) => ({
      ...prev,
      [sentenceId]: { ...(prev[sentenceId] ?? {}), status: 'loading' },
    }))
    try {
      const created = await generateSentenceAudio(sentenceId)
      setAudioStateBySentenceId((prev) => ({
        ...prev,
        [sentenceId]: {
          status: created?.audioUrl ? 'done' : 'error',
          audioUrl: created?.audioUrl ?? null,
        },
      }))
      if (created?.audioUrl) {
        setModifiedSentenceMap((prev) => ({ ...prev, [sentenceId]: false }))
      }
    } catch {
      setAudioStateBySentenceId((prev) => ({
        ...prev,
        [sentenceId]: { ...(prev[sentenceId] ?? {}), status: 'error' },
      }))
    }
  }

  const handlePlayAudio = async (sentenceId) => {
    const entry = audioStateBySentenceId[sentenceId]
    const url = entry?.audioUrl
    if (!url) return
    const fullUrl = url.startsWith('http') ? url : url
    try {
      const audio = new Audio(fullUrl)
      await audio.play()
    } catch {
      setAudioStateBySentenceId((prev) => ({
        ...prev,
        [sentenceId]: { ...(prev[sentenceId] ?? {}), status: 'error' },
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

    const validation = validateSentenceCards(rows, { allowEmptySet: true })
    if (!validation.ok) {
      setSaveError(validation.message)
      return
    }

    const toDelete = new Set(removedSentenceIds)
    for (const row of rows) {
      if (row.sentenceId != null && !row.frontText.trim() && !row.backText.trim()) {
        toDelete.add(row.sentenceId)
      }
    }

    setSaving(true)
    try {
      if (nameTrim !== initialSetName.trim() || setDescription.trim() !== initialSetDescription.trim()) {
        await updateSet(setIdNum, {
          setName: nameTrim,
          description: setDescription.trim() === '' ? undefined : setDescription.trim(),
        })
      }

      for (const id of toDelete) {
        await deleteSentence(id)
      }

      for (const row of rows) {
        if (row.sentenceId == null || toDelete.has(row.sentenceId)) continue
        const ft = row.frontText.trim()
        const bt = row.backText.trim()
        if (!ft && !bt) continue
        const memoTrim = row.memo.trim() === '' ? null : row.memo.trim()
        const o = row.original
        const origMemo =
          !o || o.memo == null || String(o.memo).trim() === '' ? null : String(o.memo).trim()
        if (o && (ft !== (o.frontText ?? '').trim() || bt !== (o.backText ?? '').trim() || memoTrim !== origMemo)) {
          await updateSentence(row.sentenceId, {
            frontText: ft,
            backText: bt,
            memo: row.memo,
          })
        }
      }

      for (const row of rows) {
        if (row.sentenceId != null) continue
        const ft = row.frontText.trim()
        const bt = row.backText.trim()
        if (!ft || !bt) continue
        await createSentence(setIdNum, {
          frontLang: FRONT_LANG,
          frontText: ft,
          backLang: BACK_LANG,
          backText: bt,
          memo: row.memo.trim() === '' ? null : row.memo.trim(),
        })
      }

      navigate(`/library/sets/${setIdNum}`, { replace: true })
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

  const handleCancel = () => {
    navigate(`/library/sets/${setIdNum}`)
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
    <section className="container sectionSpacing librarySetEditPage">
      <div className="librarySetEditHeader">
        <Link to={`/library/sets/${setIdNum}`} className="textLink librarySetEditBack">
          ← 세트로
        </Link>
        <h1 className="librarySetEditTitle">카드 편집</h1>
      </div>

      {loading ? (
        <p className="libraryStatusText">불러오는 중입니다.</p>
      ) : loadError ? (
        <p className="libraryStatusText">불러오지 못했습니다.</p>
      ) : (
        <>
          <div className="introCard librarySetEditMetaCard">
            <div className="librarySetEditMetaField">
              <label className="librarySetEditFieldLabel" htmlFor="edit-set-title">
                제목 <span className="libraryRequired">*</span>
              </label>
              <input
                id="edit-set-title"
                className="librarySetEditUnderlineInput"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="librarySetEditMetaField librarySetEditMetaField--stack">
              <label className="librarySetEditFieldLabel" htmlFor="edit-set-desc">
                설명 (선택)
              </label>
              <textarea
                id="edit-set-desc"
                className="librarySetEditUnderlineArea librarySetEditMetaDescArea"
                rows={2}
                value={setDescription}
                onChange={(e) => setSetDescription(e.target.value)}
              />
            </div>
          </div>


          <div className="librarySetEditCardList">
            {rows.map((row, index) => (
              <article key={row.key} className="librarySetEditCard">
                <div className="librarySetEditCardTop">
                  <span className="librarySetEditCardIndex">{index + 1}</span>
                  <span className="librarySetEditCardDrag" aria-hidden="true" title="순서 변경은 추후 지원">
                    ⋮⋮
                  </span>
                  <button
                    type="button"
                    className="librarySetEditIconBtn"
                    onClick={() => removeRow(row.key)}
                    disabled={saving}
                    aria-label={`카드 ${index + 1} 삭제`}
                  >
                    <TrashIcon />
                  </button>
                </div>
                <div className="librarySetEditTwoCol">
                  <div className="librarySetEditCol">
                    <label className="librarySetEditFieldLabel" htmlFor={`edit-front-${row.key}`}>
                      문장
                    </label>
                    <textarea
                      id={`edit-front-${row.key}`}
                      className="librarySetEditUnderlineArea librarySetEditTermArea"
                      dir="auto"
                      rows={1}
                      value={row.frontText}
                      onChange={(e) => updateRow(row.key, 'frontText', e.target.value)}
                      disabled={saving}
                    />
                    <div className="librarySetEditLangHint">한국어</div>
                  </div>
                  <div className="librarySetEditCol">
                    <label className="librarySetEditFieldLabel" htmlFor={`edit-back-${row.key}`}>
                      뜻
                    </label>
                    <textarea
                      id={`edit-back-${row.key}`}
                      className="librarySetEditUnderlineArea librarySetEditTermArea"
                      dir="auto"
                      rows={1}
                      value={row.backText}
                      onChange={(e) => updateRow(row.key, 'backText', e.target.value)}
                      disabled={saving}
                    />
                    <div className="librarySetEditLangHint">아랍어</div>
                  </div>
                </div>
                {row.memoOpen ? (
                  <div className="librarySetEditMemoBlock">
                    <label className="librarySetEditFieldLabel" htmlFor={`edit-memo-${row.key}`}>
                      메모 (선택)
                    </label>
                    <textarea
                      id={`edit-memo-${row.key}`}
                      className="librarySetEditUnderlineArea librarySetEditMemoArea"
                      rows={1}
                      value={row.memo}
                      onChange={(e) => updateRow(row.key, 'memo', e.target.value)}
                      disabled={saving}
                    />
                  </div>
                ) : null}
                <div className="librarySetEditMemoToggleRow">
                  <button
                    type="button"
                    className="createSetDescToggleBtn"
                    onClick={() => toggleMemo(row.key)}
                    disabled={saving}
                  >
                    {row.memoOpen ? '- 메모' : '+ 메모'}
                  </button>
                </div>
                {row.sentenceId != null ? (
                  <div className="librarySetEditAudioRow">
                    {audioStateBySentenceId[row.sentenceId]?.status === 'loading' ? (
                      <button type="button" className="libraryAudioButton" disabled>
                        생성 중…
                      </button>
                    ) : audioStateBySentenceId[row.sentenceId]?.status === 'done' ? (
                      <>
                        <span className="libraryAudioDone" aria-label="오디오 있음">
                          ✓
                        </span>
                        <button
                          type="button"
                          className="libraryAudioButton"
                          onClick={() => handlePlayAudio(row.sentenceId)}
                        >
                          재생
                        </button>
                        {modifiedSentenceMap[row.sentenceId] ? (
                          <button
                            type="button"
                            className="libraryAudioButton"
                            onClick={() => handleGenerateAudio(row.sentenceId)}
                          >
                            다시 생성
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="libraryAudioButton"
                        onClick={() => handleGenerateAudio(row.sentenceId)}
                      >
                        {modifiedSentenceMap[row.sentenceId] ||
                        audioStateBySentenceId[row.sentenceId]?.status === 'error'
                          ? '다시 생성'
                          : '음성 생성'}
                      </button>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <button type="button" className="headerGhostButton createSetAddCardBtn" onClick={addRow} disabled={saving}>
            + 카드 추가
          </button>

          {saveError ? (
            <p className="libraryFormError createSetError" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className="librarySetEditStickyActions">
            <button type="button" className="headerGhostButton" onClick={handleCancel} disabled={saving}>
              취소
            </button>
            <button type="button" className="primaryButton" onClick={() => void handleSave()} disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default LibrarySetEdit
