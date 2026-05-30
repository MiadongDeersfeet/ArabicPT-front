import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="container">
      <div className="introCard homeIntroCard" role="region" aria-label="ArabicPT 홈">
        <h2>ArabicPT</h2>
        <p>문장 세트를 만들고 학습하세요.</p>
        <Link to="/library" className="primaryButton homeLibraryButton">
          라이브러리
        </Link>
      </div>
    </section>
  )
}

export default Home
