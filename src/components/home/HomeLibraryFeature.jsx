import { Link } from 'react-router-dom'
import './HomeLibraryFeature.css'

function HomeLibraryFeature() {
  return (
    <section className="homeLib" aria-labelledby="home-lib-title">
      <p className="homeLibGlyph" aria-hidden="true">
        مكتبة
      </p>
      <p className="homeLibMark" aria-hidden="true">
        L
      </p>
      <h2 id="home-lib-title" className="homeLibTitle">
        내 라이브러리
      </h2>
      <p className="homeLibText">
        내가 만든 문장과
        <br />
        학습 자료를 한곳에서.
      </p>
      <Link to="/library" className="homeLibCta">
        라이브러리 바로가기
        <span aria-hidden="true"> ↗</span>
      </Link>
    </section>
  )
}

export default HomeLibraryFeature
