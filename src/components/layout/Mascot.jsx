import './Mascot.css'

/**
 * 낙타 마스코트 (재사용 컴포넌트)
 *
 * 이미지 추가 방법
 *   src/assets/mascot/ 에 투명 배경 webp(권장) 또는 png를 아래 이름으로 넣는다.
 *     camel-welcome  · 비로그인 홈 히어로
 *     camel-study    · 학습 화면
 *     camel-complete · 학습 완료
 *     camel-empty    · 빈 라이브러리 / 검색 결과 없음
 *     camel-error    · 오류 화면
 *     camel-face     · 작은 얼굴 아이콘 (헤더 등)
 *
 * 파일이 아직 없어도 빌드가 깨지지 않는다.
 * import.meta.glob은 정적 import와 달리 매칭되는 파일이 없으면 빈 목록을 돌려주고,
 * 이 컴포넌트는 그때 아무것도 렌더하지 않는다(레이아웃 영향 없음).
 *
 * 사용 예
 *   <Mascot variant="welcome" size="large" />                     장식용 (aria-hidden)
 *   <Mascot variant="complete" size="medium" alt="학습 완료" />    의미 전달용
 */
const MASCOT_FILES = import.meta.glob('../../assets/mascot/*.{webp,png}', {
  eager: true,
  import: 'default',
})

const VARIANT_BASENAME = {
  welcome: 'camel-welcome',
  study: 'camel-study',
  complete: 'camel-complete',
  empty: 'camel-empty',
  error: 'camel-error',
  face: 'camel-face',
}

function resolveSrc(variant) {
  const basename = VARIANT_BASENAME[variant]
  if (!basename) return null

  const paths = Object.keys(MASCOT_FILES)
  // 같은 이름이 둘 다 있으면 webp를 우선한다.
  const match =
    paths.find((path) => path.endsWith(`/${basename}.webp`)) ??
    paths.find((path) => path.endsWith(`/${basename}.png`))

  return match ? MASCOT_FILES[match] : null
}

/**
 * @param {'welcome'|'study'|'complete'|'empty'|'error'|'face'} variant
 * @param {'small'|'medium'|'large'} size
 * @param {string} alt          빈 문자열이면 장식 이미지로 처리한다.
 * @param {boolean} hideOnMobile 모바일에서 숨길지 여부
 */
function Mascot({
  variant = 'welcome',
  size = 'medium',
  alt = '',
  hideOnMobile = false,
  className = '',
}) {
  const src = resolveSrc(variant)
  if (!src) return null

  const isDecorative = alt === ''
  const classNames = ['mascot', `mascot--${size}`, hideOnMobile ? 'mascot--hideMobile' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={isDecorative || undefined}
      loading="lazy"
      decoding="async"
      className={classNames}
    />
  )
}

export default Mascot
