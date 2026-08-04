import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'weather-home',
    component: () => import('@/views/WeatherHomeView.vue'),
  },
  {
    path: '/about',
    name: 'weather-about',
    component: () => import('@/views/WeatherAboutView.vue'),
  },
  {
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('@/views/WeatherDetailView.vue'),
  },
  {
    // Code Challenge 6. Pinia 연습용 라우트. nav bar에는 링크가 없으므로
    // 브라우저에서 이 경로(http://localhost:5173/practices/store-counter)로 직접 접속해야 확인할 수 있게 설계함.
    // 헷갈리지 않도록 따로 설계한 점 참고해주시면 감사하겠습니다!
    path: '/practices/store-counter',
    name: 'practice-store-counter',
    component: () => import('@/views/PracticeStoreCounterView.vue'),
  },
  {
    // Catch-all Route: 정의되지 않은 모든 경로를 404 페이지로 연결한다.
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
