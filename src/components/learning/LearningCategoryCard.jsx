import { Link } from 'react-router-dom'
import { LearningCategoryIcon } from './LearningCategoryIcons.jsx'
import './LearningCategoryCard.css'

/**
 * 공식 학습 카테고리 shell 카드.
 * 개별 course URL이 없으므로 to(기본 /learn)로만 이동한다.
 * asLink=false 이면 준비 중 shell(비클릭)로 렌더한다.
 */
function LearningCategoryCard({
  title,
  description,
  icon,
  statusLabel = '준비 중',
  to = '/learn',
  asLink = true,
}) {
  const body = (
    <>
      <span className="learningCategoryCardIcon" aria-hidden="true">
        <LearningCategoryIcon name={icon} />
      </span>
      <span className="learningCategoryCardBody">
        <span className="learningCategoryCardTitle">{title}</span>
        <span className="learningCategoryCardDesc">{description}</span>
      </span>
      {statusLabel ? (
        <span className="learningCategoryCardStatus">{statusLabel}</span>
      ) : null}
    </>
  )

  if (!asLink) {
    return <div className="learningCategoryCard learningCategoryCard--static">{body}</div>
  }

  return (
    <Link to={to} className="learningCategoryCard">
      {body}
    </Link>
  )
}

export default LearningCategoryCard
