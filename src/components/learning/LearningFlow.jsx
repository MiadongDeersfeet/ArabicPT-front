import { LEARNING_FLOW_STEPS } from '../../constants/learningCategories.js'
import './LearningFlow.css'

function LearningFlow() {
  return (
    <section className="learnFlow" aria-labelledby="learn-flow-title">
      <div className="learnFlowHead">
        <h2 id="learn-flow-title" className="learnFlowTitle">
          ArabicPT에서는
          <br />
          배운 것을 반복해 내 것으로 만듭니다.
        </h2>
      </div>

      <ol className="learnFlowList">
        {LEARNING_FLOW_STEPS.map((step, index) => (
          <li key={step.number} className="learnFlowStep">
            <span className="learnFlowNum">{step.number}</span>
            <span className="learnFlowStepTitle">{step.title}</span>
            <span className="learnFlowStepText">{step.text}</span>
            {index < LEARNING_FLOW_STEPS.length - 1 ? (
              <span className="learnFlowArrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default LearningFlow
