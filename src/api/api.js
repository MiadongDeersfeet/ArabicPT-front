import axiosInstance from './axiosInstance'

/**
 * 구글 로그인 요청
 * 백엔드의 Google OAuth2 로그인 진입 URL로 이동할 때 사용합니다.
 */
export const requestGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`
}

/**
 * 현재 로그인한 회원 정보 조회
 * 로그인 유지 여부 확인 또는 마이페이지 진입 시 사용합니다.
 */
export const getMyInfo = () => axiosInstance.get('/api/members/me')

/**
 * 로그아웃 요청
 * 서버 로그아웃 처리에 사용합니다.
 */
export const logout = () => axiosInstance.post('/api/auth/logout')

/**
 * 단어 카테고리 목록 조회
 * 단어 학습 화면에서 카테고리 목록을 불러올 때 사용합니다.
 */
export const getWordCategories = () => axiosInstance.get('/api/word-categories')

/**
 * 카테고리별 단어 목록 조회
 * 특정 카테고리에 속한 단어들을 불러올 때 사용합니다.
 */
export const getWordsByCategory = (categoryId) =>
  axiosInstance.get('/api/words', {
    params: { categoryId },
  })

/**
 * 카테고리별 3지선다 단어 퀴즈 생성 요청
 * 학습자가 선택한 카테고리를 기준으로 퀴즈 문제를 생성할 때 사용합니다.
 */
export const getWordQuizByCategory = (categoryId) =>
  axiosInstance.get('/api/quizzes/words', {
    params: { categoryId },
  })

/**
 * 퀴즈 정답 제출 요청
 * 사용자가 선택한 답안을 백엔드에 제출하고 결과를 받을 때 사용합니다.
 */
export const submitQuizAnswer = (data) => axiosInstance.post('/api/quizzes/submit', data)

/**
 * 관리자 단어 등록 요청
 * 관리자 화면에서 새 단어를 등록할 때 사용합니다.
 */
export const createWord = (data) => axiosInstance.post('/api/admin/words', data)

/**
 * 관리자 단어 수정 요청
 * 관리자 화면에서 기존 단어 정보를 수정할 때 사용합니다.
 */
export const updateWord = (wordId, data) => axiosInstance.put(`/api/admin/words/${wordId}`, data)

/**
 * 관리자 단어 삭제 요청
 * 관리자 화면에서 단어를 비활성화 또는 삭제할 때 사용합니다.
 */
export const deleteWord = (wordId) => axiosInstance.delete(`/api/admin/words/${wordId}`)
