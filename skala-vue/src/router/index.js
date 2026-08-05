import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    // [실습 8] 메인 메타 설명을 실시간 지구본 중심으로 갱신했다.
    path: '/',
    name: 'weather-home',
    component: () => import('@/views/WeatherHomeView.vue'),
    meta: {
      label: 'LIVE WEATHER',
      icon: '📊',
      title: '날씨 대시보드',
      description: '회전하는 지구본과 함께 전 세계 날씨를 한눈에 살펴보세요.',
    },
  },
  {
    path: '/about',
    name: 'weather-about',
    component: () => import('@/views/WeatherAboutView.vue'),
    meta: {
      label: 'ABOUT SERVICE',
      icon: '📄',
      title: '서비스 소개',
      description: '날씨 대시보드의 핵심 기능과 프로젝트 구성을 안내합니다.',
    },
  },
  {
    // [실습 8] 상세 화면은 24시간 예보와 옷차림 추천을 제공한다.
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('@/views/WeatherDetailView.vue'),
    meta: {
      label: 'CITY OBSERVATION',
      icon: '📍',
      title: '지역별 상세 관측',
      description: '선택한 도시의 24시간 예보와 시간대별 옷차림을 확인하세요.',
    },
  },
  {
    // [과제 확장 - 대기질 메뉴] Modern JavaScript 과제 확장: 새 메뉴 + 새 API(OpenWeather
    // Air Pollution) 연동 화면. App.vue의 사이드바 메뉴(RouterLink)에서 이 라우트로 진입한다.
    path: '/air-quality',
    name: 'weather-air-quality',
    component: () => import('@/views/WeatherAirQualityView.vue'),
    meta: {
      label: 'AIR QUALITY',
      icon: '🌫️',
      title: '대기질 정보',
      description: '대시보드 도시들의 실시간 미세먼지·대기질 지수를 확인하세요.',
    },
  },
  {
    // [과제 확장 - 도시 정보 메뉴] Modern JavaScript 과제 확장 2탄: 세계 시각(timeapi.io) +
    // 위키백과 요약(Wikipedia REST API)을 도시별로 보여주는 화면.
    path: '/city-info',
    name: 'weather-city-info',
    component: () => import('@/views/WeatherCityInsightView.vue'),
    meta: {
      label: 'CITY INFO',
      icon: '🕒',
      title: '도시 정보',
      description: '대시보드 도시들의 현지 시각과 위키백과 요약을 확인하세요.',
    },
  },
  {
    // Code Challenge 6. Pinia 연습용 라우트. nav bar에는 링크가 없으므로
    // 브라우저에서 이 경로(http://localhost:5173/practices/store-counter)로 직접 접속해야 확인할 수 있게 설계함.
    // 헷갈리지 않도록 따로 설계한 점 참고해주시면 감사하겠습니다!
    path: '/practices/store-counter',
    name: 'practice-store-counter',
    component: () => import('@/views/PracticeStoreCounterView.vue'),
    meta: {
      label: 'PINIA PRACTICE',
      icon: '🧮',
      title: 'Pinia Store 예제',
      description: '전역 상태 관리 실습 화면입니다.',
    },
  },
  {
    // Catch-all Route: 정의되지 않은 모든 경로를 404 페이지로 연결한다.
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      label: 'PAGE NOT FOUND',
      icon: '🧭',
      title: '길을 찾을 수 없어요',
      description: '요청하신 페이지가 없거나 이동되었습니다.',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
