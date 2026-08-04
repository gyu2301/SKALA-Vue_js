<script setup>
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="dashboard-shell">
    <header class="dashboard-header">
      <div class="header-copy">
        <span class="eyebrow">SKALA · VUE 3 WEATHER DASHBOARD</span>
        <h1>도시의 오늘을<br />한눈에 확인하세요.</h1>
        <p>
          지역별 실시간 날씨를 검색하고 기온, 습도, 풍속의 차이를 직관적으로 비교할 수
          있는 날씨 관측 대시보드입니다.
        </p>

        <div class="header-tags" aria-label="제공하는 날씨 정보">
          <span>🌡️ 기온</span>
          <span>💧 습도</span>
          <span>🌬️ 풍속</span>
        </div>
      </div>

      <div class="weather-overview" aria-label="날씨 서비스 안내">
        <div class="overview-topline">
          <span class="live-badge"><i></i> LIVE DATA</span>
          <span>OpenWeatherMap</span>
        </div>

        <div class="overview-visual" aria-hidden="true">
          <span class="weather-orb">☀️</span>
          <span class="floating-cloud cloud-one">☁️</span>
          <span class="floating-cloud cloud-two">☁️</span>
        </div>

        <div class="overview-copy">
          <strong>내가 찾는 도시의 지금</strong>
          <span>검색부터 상세 관측 정보까지 한 곳에서 확인하세요.</span>
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
        </nav>

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
      <span>Vue 3 · Pinia · Vue Router · Axios</span>
    </footer>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
