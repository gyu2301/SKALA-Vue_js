<script setup>
// [실습 8] 전역 헤더 문구와 기술 표기를 지구본·24시간 예보·옷차림·Element Plus 기준으로 갱신했다.
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="dashboard-shell">
    <header class="dashboard-header">
      <div class="header-copy">
        <span class="eyebrow">SKALA · ELEMENT PLUS WEATHER EXPERIENCE</span>
        <h1>세계 곳곳 도시들의 날씨<br /> 그리고 옷차림</h1>
        <p>
          전 세계 바람을 지구본으로 살펴보고, 관심 도시의 24시간 예보와 생활 알림,
          시간대별 옷차림을 확인하세요.
        </p>

        <div class="header-tags" aria-label="제공하는 날씨 정보">
          <span>🌍 실시간 지구본</span>
          <span>📊 24시간 예보</span>
          <span>🧥 옷차림 추천</span>
          <span>🚀 Vercel로 배포완료</span>
        </div>

        <a class="sibling-link" href="https://skala-vue-jscode-challenge.vercel.app" target="_blank" rel="noopener noreferrer">
          🧪 Vue Code Challenge 사이트 보러가기 <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="weather-overview" aria-label="날씨 서비스 안내">
        <div class="overview-topline">
          <span class="live-badge"><i></i> LIVE DATA</span>
          <span>ELEMENT PLUS UI</span>
        </div>

        <div class="overview-visual" aria-hidden="true">
          <span class="weather-orb">☀️</span>
          <span class="floating-cloud cloud-one">☁️</span>
          <span class="floating-cloud cloud-two">☁️</span>
        </div>

        <div class="overview-copy">
          <strong>오늘 날씨, 한눈에</strong>
          <span>우산 챙기기 전에 다시 확인해요 ☁️</span>
        </div>
      </div>
    </header>

    <div class="dashboard-layout">
      <aside class="app-navigation">
        <div class="navigation-title">
          <span>WEATHER MENU</span>
          <strong>서비스 메뉴</strong>
        </div>

        <nav aria-label="날씨 서비스 메뉴">
          <RouterLink class="navigation-menu" to="/">
            <span class="menu-icon">📊</span>
            <span class="menu-copy">
              <strong>날씨 대시보드</strong>
              <small>도시별 날씨 비교</small>
            </span>
            <span class="menu-arrow">›</span>
          </RouterLink>

          <RouterLink class="navigation-menu" to="/about">
            <span class="menu-icon">📄</span>
            <span class="menu-copy">
              <strong>서비스 소개</strong>
              <small>프로젝트 구성 안내</small>
            </span>
            <span class="menu-arrow">›</span>
          </RouterLink>

          <!-- [과제 확장 - 대기질 메뉴] Modern JavaScript 과제 확장으로 추가한 세 번째 메뉴.
               router/index.js의 /air-quality 라우트로 연결된다. -->
          <RouterLink class="navigation-menu" to="/air-quality">
            <span class="menu-icon">🌫️</span>
            <span class="menu-copy">
              <strong>대기질 정보</strong>
              <small>도시별 미세먼지 지수</small>
            </span>
            <span class="menu-arrow">›</span>
          </RouterLink>

          <!-- [과제 확장 - 도시 정보 메뉴] Modern JavaScript 과제 확장 2탄으로 추가한 네 번째 메뉴.
               router/index.js의 /city-info 라우트로 연결된다. -->
          <RouterLink class="navigation-menu" to="/city-info">
            <span class="menu-icon">🕒</span>
            <span class="menu-copy">
              <strong>도시 정보</strong>
              <small>현지 시각 · 위키 요약</small>
            </span>
            <span class="menu-arrow">›</span>
          </RouterLink>
        </nav>

        <!--
          [반응형 지구본]
          넓은 화면에서 실시간 지구본이 Teleport로 WEATHER MENU 바로 아래에 배치된다.
          1050px 이하에서는 Teleport가 해제되어 본문의 도시 카드 아래로 돌아간다.
        -->
        <div v-if="$route.name === 'weather-home'" id="desktop-globe-slot"></div>

        <div class="unit-panel">
          <div>
            <span>DISPLAY UNIT</span>
            <strong>온도 단위 설정</strong>
          </div>
          <UnitToggler />
        </div>

        <p class="source-note">
          <span>●</span>
          OpenWeatherMap API 연결
        </p>

      </aside>

      <main class="dashboard-content">
        <header class="page-heading">
          <div>
            <span class="page-label">{{ $route.meta.label || 'WEATHER CENTER' }}</span>
            <h2>{{ $route.meta.icon || '⛅' }} {{ $route.meta.title || '날씨 서비스' }}</h2>
            <p>{{ $route.meta.description || '도시별 날씨 정보를 확인해 보세요.' }}</p>
          </div>
          <div
            v-if="$route.name === 'weather-home' || $route.name === 'weather-detail'"
            class="page-status"
          >
            <i></i> 실시간 데이터
          </div>
        </header>

        <RouterView />
      </main>
    </div>

    <footer class="dashboard-footer">
      <strong>SKALA Weather Center</strong>
      <span>Vue 3 · Element Plus · Pinia · Vue Router · Axios</span>
    </footer>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
