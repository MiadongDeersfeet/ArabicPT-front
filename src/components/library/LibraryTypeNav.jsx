import { NavLink } from 'react-router-dom'
import './Library.css'

function LibraryTypeNav() {
  return (
    <nav className="libTypeNav" aria-label="라이브러리 유형">
      <NavLink
        to="/library"
        end
        className={({ isActive }) => `libTypeTab${isActive ? ' isActive' : ''}`}
      >
        문장
      </NavLink>
      <NavLink
        to="/library/paragraph-sets"
        className={({ isActive }) => `libTypeTab${isActive ? ' isActive' : ''}`}
      >
        Ebook
      </NavLink>
    </nav>
  )
}

export default LibraryTypeNav
