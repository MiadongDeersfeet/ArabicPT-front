# ArabicPT · Frontend

**ArabicPT** 아랍어 학습 웹앱의 프론트엔드입니다.  
문장 세트·폴더·카드 학습 흐름을 **모바일 우선**으로 다루며, 백엔드 REST API와 연동합니다.

---

## 스택

| 구분 | 기술 |
|------|------|
| UI | **React 19** · JSX |
| 빌드 | **Vite 7** |
| 라우팅 | **React Router 7** |
| HTTP | **Axios** |
| PWA | `vite-plugin-pwa` (프로덕션 빌드 시 서비스 워커 생성) |
| 스타일 | 전역 CSS (`App.css` 등) |

---

## 필요 환경

- **Node.js** (LTS 권장, 예: 20.x 이상)
- **npm** 또는 **pnpm** / **yarn**

백엔드 API 서버가 동작해야 로그인·라이브러리 등 대부분의 기능을 확인할 수 있습니다. 로컬에서는 보통 `http://localhost:8080` 을 바라봅니다.

---

## 시작하기

### 1. 의존성 설치

```bash
cd front
npm install
```

### 2. 환경 변수

루트에 `.env` 파일을 만들고, 예시는 다음과 같습니다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | 백엔드 베이스 URL (기본: `http://localhost:8080`) |

> `VITE_*` 는 **빌드 시점**에 주입됩니다. 값을 바꾼 뒤에는 `npm run dev` / `npm run build` 를 다시 실행하세요.

### 3. 개발 서버

```bash
npm run dev
```

브라우저에서 Vite가 안내하는 주소(일반적으로 `http://localhost:5173`)로 접속합니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

산출물은 `dist/` 입니다. 미리보기:

```bash
npm run preview
```

---

## npm 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (HMR) |
| `npm run build` | 프로덕션 번들 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run lint` | ESLint |

---

## API 클라이언트 참고

- OAuth·회원 등 일부 API는 `VITE_API_BASE_URL` 을 쓰는 **`axiosInstance`** 를 사용합니다.
- 라이브러리/문장 세트 전용 모듈은 `src/api/httpClient.js` 에 **베이스 URL이 고정**되어 있을 수 있습니다.  
  배포 시 백엔드 주소가 바뀌면 해당 파일도 함께 점검하거나, 환경 변수로 통일하는 것을 권장합니다.

`withCredentials: true` 로 쿠키 기반 세션을 맞춰 두었습니다. 백엔드 CORS·쿠키 설정과 짝이 맞아야 합니다.

---

## 주요 라우트

| 경로 | 설명 |
|------|------|
| `/` | 홈 |
| `/library` | 문장 세트·폴더 목록 |
| `/library/folders/:folderId` | 폴더 상세·해당 폴더 세트 |
| `/library/sets/new` | 새 문장 세트 만들기 |
| `/library/sets/:setId` | 세트 상세·문장 관리 |
| `/study/sets/:setId` | 세트 기준 카드 학습 |
| `/ui-kit` | UI 스케치(개발용) |

레거시 `/library/all`·`/study/sentences` 는 리다이렉트로 정리되어 있습니다.

---

## 폴더 구조(요약)

```
src/
├── api/           # axios 래퍼, 도메인별 API
├── components/    # 레이아웃·공통 UI
├── pages/         # 화면별 라우트 컴포넌트
├── App.jsx        # 라우트 정의
└── main.jsx       # 엔트리
```

---

## 개발 시 팁

- API 응답은 백엔드 `ApiResponseDTO` 형태인 경우가 많으므로, `response.data.data` 를 꺼내는 패턴이 반복될 수 있습니다.
- PWA 캐시로 이전 `dist` 가 남으면 API 주소가 꼬일 수 있습니다. 의심되면 브라우저에서 해당 사이트 데이터를 비우거나 시크릿 창으로 확인해 보세요.

---

## 라이선스

저장소 상위 정책에 따릅니다. 팀 내 규약이 있으면 README 하단에 맞춰 두면 됩니다.
