import { LEARNING_CATEGORIES } from '../../constants/learningCategories.js'
import LearningCategoryCard from './LearningCategoryCard.jsx'
import './LearningCategoryGrid.css'

function LearningCategoryGrid({
  descriptionKey = 'description',
  statusLabel = '준비 중',
  asLink = true,
}) {
  return (
    <ul className="learningCategoryGrid">
      {LEARNING_CATEGORIES.map((item) => (
        <li key={item.id}>
          <LearningCategoryCard
            title={item.title}
            description={item[descriptionKey] ?? item.description}
            icon={item.icon}
            statusLabel={statusLabel}
            to="/learn"
            asLink={asLink}
          />
        </li>
      ))}
    </ul>
  )
}

export default LearningCategoryGrid
