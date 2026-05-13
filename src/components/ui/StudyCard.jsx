import SentenceBox from './SentenceBox.jsx'
import StudyMarkBar from './StudyMarkBar.jsx'

function StudyCard({ title, text, dir = 'ltr' }) {
  return (
    <section className="studyCard" aria-label={title}>
      <SentenceBox title={title} text={text} dir={dir} />
      <StudyMarkBar disabled hideCaptions onWrong={() => {}} onCorrect={() => {}} />
    </section>
  )
}

export default StudyCard
