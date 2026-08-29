import { Link } from 'react-router-dom'
import './Library.css'

function LibraryResourceRow({
  to,
  index,
  title,
  description,
  metaPrimary,
  metaSecondary,
  dateLabel,
}) {
  const num = String(index).padStart(2, '0')

  return (
    <li>
      <Link to={to} className="libRow">
        <span className="libRowIndex" aria-hidden="true">
          {num}
        </span>
        <span className="libRowMain">
          <span className="libRowTitle">{title}</span>
          {description ? <span className="libRowDesc">{description}</span> : null}
          <span className="libRowMeta">
            {metaPrimary ? <span>{metaPrimary}</span> : null}
            {metaPrimary && metaSecondary ? (
              <span className="libRowMetaSep" aria-hidden="true">
                ·
              </span>
            ) : null}
            {metaSecondary ? <span>{metaSecondary}</span> : null}
          </span>
        </span>
        <span className="libRowAside">
          {dateLabel ? <span className="libRowDate">{dateLabel}</span> : null}
          <span className="libRowGo" aria-hidden="true">
            ↗
          </span>
        </span>
      </Link>
    </li>
  )
}

export default LibraryResourceRow
