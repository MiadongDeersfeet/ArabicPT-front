import SentenceBox from './SentenceBox.jsx'

function StudyCard({ title, text, dir = 'ltr' }) {
  return (
    <section className="studyCard" aria-label={title}>
      <SentenceBox title={title} text={text} dir={dir} />

      <div className="studyCardFooter">
        <button type="button" className="studyCircleButton studyCircleButton--wrong" aria-label="오답">
          ×
        </button>
        <button type="button" className="studyCircleButton studyCircleButton--correct" aria-label="정답">
          ✓
        </button>
      </div>
    </section>
  )
}

export default StudyCard
