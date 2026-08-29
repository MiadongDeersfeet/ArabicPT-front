import './LearnHero.css'

function LearnHero() {
  return (
    <section className="learnHero" aria-labelledby="learn-hero-title">
      <div className="learnHeroCopy">
        <p className="learnHeroEyebrow">LEARN ARABIC WITH ARABICPT</p>
        <h1 id="learn-hero-title" className="learnHeroTitle">
          <span className="learnHeroPhrase">기초부터 실전까지,</span>{' '}
          <span className="learnHeroPhrase">하나의 흐름으로.</span>
        </h1>
        <p className="learnHeroLead">
          문법을 이해하고,
          <br />
          표현과 어휘를 익히고,
          <br />
          읽고 들으며 아랍어를 확장하세요.
        </p>
      </div>

      <aside className="learnHeroVisual" aria-hidden="true">
        <div className="learnHeroCompose">
          <span className="learnHeroWord learnHeroWord--a" lang="ar" dir="rtl">
            قواعد
          </span>
          <i className="learnHeroLine learnHeroLine--h1" />
          <span className="learnHeroWord learnHeroWord--b" lang="ar" dir="rtl">
            تعبير
          </span>

          <i className="learnHeroLine learnHeroLine--v" />

          <span className="learnHeroWord learnHeroWord--c" lang="ar" dir="rtl">
            قراءة
          </span>
          <i className="learnHeroLine learnHeroLine--h2" />
          <span className="learnHeroWord learnHeroWord--d" lang="ar" dir="rtl">
            كلمات
          </span>
        </div>
      </aside>
    </section>
  )
}

export default LearnHero
