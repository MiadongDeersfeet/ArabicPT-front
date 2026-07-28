import { Link } from 'react-router-dom'
import './BrandLogo.css'

/**
 * ArabicPT 브랜드 로고 (모노라인 낙타 심벌 + 워드마크).
 *
 * 구성
 * - 심벌: src/assets/brand/logo-symbol.webp/png/svg 중 하나를 넣으면 자동으로 잡힌다.
 * - 워드마크: 이미지가 아니라 HTML 텍스트다. 그래야 'Arabic'에 에메랄드,
 *   'PT'에 골드 토큰을 그대로 적용할 수 있고 화면 크기에 따라 자연스럽게 줄어든다.
 *
 * 최종 심벌 넣는 법
 *   우선순위: logo-symbol.webp -> logo-symbol.png -> logo-symbol.svg
 *   세 파일 중 하나만 추가해도 A 배지가 심벌로 바뀐다.
 *   컴포넌트 수정은 필요 없다. 심벌 슬롯 크기가 고정이라 헤더 높이도 변하지 않는다.
 *
 * 같은 폴더의 나머지 자산은 앱에서 import하지 않는다.
 * - logo-full.svg / logo-full-white.svg : 메일·OG 이미지·인쇄 등 외부 배포용
 * - favicon.svg / app-icon-192.png / app-icon-512.png : public/ 로 복사해 쓰는 정적 자산
 *
 * 마스코트(전신 낙타 캐릭터)는 이 컴포넌트와 분리되어 있다. Mascot.jsx를 쓴다.
 *
 * @param {'full'|'symbol'} variant  'full'은 심벌+워드마크, 'symbol'은 심벌만
 * @param {'link'|'plain'} as        'plain'이면 링크가 아닌 텍스트로만 렌더한다.
 * @param {'sm'|'md'|'lg'} size
 */

/**
 * 파일이 없어도 빌드가 깨지지 않도록 정적 import 대신 glob으로 찾는다.
 * (매칭되는 파일이 없으면 빈 목록이 되고, 아래에서 fallback 배지를 쓴다.)
 */
const BRAND_ASSETS = import.meta.glob('../../assets/brand/*.{webp,png,svg}', {
  eager: true,
  import: 'default',
})

const SYMBOL_CANDIDATES = ['logo-symbol.webp', 'logo-symbol.png', 'logo-symbol.svg']

const SYMBOL_SRC =
  SYMBOL_CANDIDATES
    .map((fileName) =>
      BRAND_ASSETS[
        Object.keys(BRAND_ASSETS).find((path) => path.endsWith(`/${fileName}`))
      ] ?? null,
    )
    .find(Boolean) ?? null

function BrandLogo({ variant = 'full', as = 'link', size = 'md', className = '' }) {
  const showWordmark = variant !== 'symbol'

  const classNames = ['brandLogo', `brandLogo--${size}`, `brandLogo--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  // 심벌은 장식 요소다. 이름은 워드마크 텍스트나 링크의 aria-label이 제공한다.
  const symbol = SYMBOL_SRC ? (
    <img
      src={SYMBOL_SRC}
      alt=""
      aria-hidden="true"
      draggable="false"
      className="brandSymbol"
    />
  ) : (
    // 최종 logo-symbol.svg가 들어오기 전까지 쓰는 대체 배지. 차지하는 크기는 동일하다.
    <span className="brandSymbol brandSymbol--fallback" aria-hidden="true">
      A
    </span>
  )

  const content = (
    <>
      {symbol}
      {showWordmark ? (
        <span className="brandWordmark">
          Arabic<span className="brandWordmarkAccent">PT</span>
        </span>
      ) : null}
    </>
  )

  if (as === 'plain') {
    // 워드마크가 없으면 읽어 줄 텍스트가 사라지므로 래퍼에 이름을 준다.
    const labelProps = showWordmark ? {} : { role: 'img', 'aria-label': 'ArabicPT' }
    return (
      <span className={classNames} {...labelProps}>
        {content}
      </span>
    )
  }

  return (
    <Link to="/" className={classNames} aria-label="ArabicPT 홈으로 이동">
      {content}
    </Link>
  )
}

export default BrandLogo
