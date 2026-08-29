import { Link } from 'react-router-dom'
import './Library.css'

function LibraryPageHeader({ title, description, createLabel, createTo }) {
  return (
    <header className="libHeader">
      <div className="libHeaderCopy">
        <h1 className="libHeaderTitle">{title}</h1>
        {description ? <p className="libHeaderLead">{description}</p> : null}
      </div>
      {createTo && createLabel ? (
        <Link to={createTo} className="libHeaderCreate">
          <span aria-hidden="true">+</span> {createLabel}
        </Link>
      ) : null}
    </header>
  )
}

export default LibraryPageHeader
