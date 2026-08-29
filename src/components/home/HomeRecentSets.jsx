import { Link } from 'react-router-dom'
import './HomeRecentSets.css'

function formatUpdatedDate(value) {
  if (value == null || value === '') return null
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}.${m}.${day}`
  } catch {
    return null
  }
}

function HomeRecentSets({ loading, error, sets }) {
  return (
    <section className="homeRecent" aria-labelledby="home-recent-title">
      <div className="homeRecentHead">
        <h2 id="home-recent-title" className="homeRecentTitle">
          최근 수정한 세트
        </h2>
        <Link to="/library" className="homeRecentAll">
          전체 보기
          <span aria-hidden="true"> ↗</span>
        </Link>
      </div>

      {loading ? (
        <p className="homeRecentStatus">문장 세트를 불러오는 중입니다.</p>
      ) : error ? (
        <p className="homeRecentStatus">문장 세트 목록을 불러오지 못했습니다.</p>
      ) : sets.length === 0 ? (
        <div className="homeRecentEmpty">
          <p className="homeRecentEmptyTitle">아직 만든 문장 세트가 없습니다.</p>
          <p className="homeRecentEmptyText">나만의 문장을 저장하고 반복해서 학습할 수 있어요.</p>
          <Link to="/library/sets/new" className="homeRecentCreate">
            첫 문장 세트 만들기
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>
      ) : (
        <ul className="homeRecentList">
          {sets.map((set, index) => {
            const updated = formatUpdatedDate(set.updatedAt) ?? formatUpdatedDate(set.createdAt)
            const num = String(index + 1).padStart(2, '0')
            return (
              <li key={set.setId}>
                <Link to={`/library/sets/${set.setId}`} className="homeRecentRow">
                  <span className="homeRecentIndex" aria-hidden="true">
                    {num}
                  </span>
                  <span className="homeRecentMain">
                    <span className="homeRecentName">{set.setName}</span>
                    <span className="homeRecentMeta">
                      {set.folderName ? set.folderName : '개인 문장 세트'}
                    </span>
                  </span>
                  <span className="homeRecentAside">
                    {updated ? (
                      <span className="homeRecentDate">{updated}</span>
                    ) : null}
                    <span className="homeRecentGo" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default HomeRecentSets
