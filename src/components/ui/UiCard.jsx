function UiCard({ title, description, usage }) {
  return (
    <article className="uiCard">
      <h3>{title}</h3>
      <p>{description}</p>
      <small>{usage}</small>
    </article>
  )
}

export default UiCard
