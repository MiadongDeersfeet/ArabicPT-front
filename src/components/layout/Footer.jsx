import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import './Footer.css'

/**
 * 공통 푸터.
 *
 * variant
 * - 'public' : 비로그인 공개 화면 (태그라인 포함)
 * - 'app'    : 로그인 후 앱 화면 (태그라인 생략)
 *
 * 두 variant는 문구만 다르고 마크업·높이·정렬·반응형 규칙은 완전히 같다.
 * 서로 다른 컴포넌트처럼 보이지 않도록 variant 전용 CSS는 두지 않는다.
 *
 * 링크 정책
 * - 실제 라우트가 있는 항목만 <Link>로 연결한다.
 * - 아직 페이지가 없는 항목은 존재하지 않는 경로나 href="#"를 만들지 않고
 *   비활성 텍스트로 둔다. 페이지가 생기면 아래 목록에 `to`만 채우면 링크가 된다.
 */
const FOOTER_LINKS = [
  { label: '이용약관', to: null },
  { label: '개인정보처리방침', to: null },
  { label: 'FAQ', to: null },
  { label: '문의하기', to: null },
]

function FooterLink({ item }) {
  if (item.to) {
    return (
      <Link to={item.to} className="footerLink">
        {item.label}
      </Link>
    )
  }

  // 준비 중인 항목: 클릭 가능한 것처럼 보이지 않도록 링크가 아닌 텍스트로 렌더한다.
  return (
    <span className="footerLink footerLinkPending" title="준비 중입니다">
      {item.label}
    </span>
  )
}

function Footer({ variant = 'public' }) {
  const year = new Date().getFullYear()

  return (
    <footer className="siteFooter">
      <div className="container siteFooterInner">
        <div className="footerIdentity">
          <BrandLogo as="plain" size="sm" />
          {variant === 'public' ? (
            <p className="footerTagline">아랍어를 가장 쉽고 가볍게, 매일 10분의 변화</p>
          ) : null}
        </div>

        <nav className="footerLinks" aria-label="푸터 메뉴">
          {FOOTER_LINKS.map((item) => (
            <FooterLink key={item.label} item={item} />
          ))}
        </nav>

        <span className="footerCopyright">© {year} ArabicPT</span>
      </div>
    </footer>
  )
}

export default Footer
