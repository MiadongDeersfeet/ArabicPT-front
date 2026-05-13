import './Footer.css'

function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container siteFooterInner">
        <div>
          <strong>ArabicPT</strong>
          <p>"ليس اسم آخر قد أعطي بين الناس به ينبغي أن نخلص"</p>
        </div>

        <div className="siteFooterLinks">
          <a href="#privacy">개인정보처리방침</a>
          <a href="#terms">이용약관</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
