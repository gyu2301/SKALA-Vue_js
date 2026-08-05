<script setup>
/**
 * [실습 8 - 서비스 소개]
 * 이번 실습에서 적용한 Element Plus 컴포넌트와 새로 추가한
 * 지구본·24시간 예보·옷차림·생활 알림 기능을 한눈에 설명하는 정적 페이지이다.
 *
 * [과제 확장 - 대기질 메뉴] 목록 맨 아래에 새로 추가한 대기질 정보 메뉴 소개 항목을 덧붙였다.
 */
</script>

<template>
  <div class="about-wrapper">
    <!-- [Element Plus] 기존 일반 div 카드를 ElCard로 교체하고 ElButton으로 메인 이동 버튼을 구성했다. -->
    <el-card class="dashboard-card" shadow="never">
      <template #header><h3>ℹ️ Element Plus 날씨 프로젝트</h3></template>
      <p class="about-intro">
        Element Plus의 완성도 높은 UI와 Vue의 데이터 흐름을 결합해, “보는 날씨”에서
        “행동을 알려주는 날씨”로 확장한 실습 프로젝트입니다.
      </p>
      <ul class="about-list">
        <li><span>🧩</span><strong>Element Plus</strong><small>검색, 카드, 알림, 로딩, 피드백 UI</small></li>
        <li><span>🌍</span><strong>실시간 지구본</strong><small>회전·확대 가능한 세계 바람 시각화</small></li>
        <li><span>📊</span><strong>24시간 예보</strong><small>기온 추이와 강수 확률을 Canvas 차트로 표현</small></li>
        <li><span>🧥</span><strong>옷차림 추천</strong><small>아침·점심·오후·저녁 기온별 스타일 가이드</small></li>
        <li><span>🛡️</span><strong>생활 날씨 알림</strong><small>비·눈·폭염·건조 조건별 행동 가이드</small></li>
        <li><span>⚡</span><strong>Vue 데이터 흐름</strong><small>Pinia, Router, Axios, Composition API 활용</small></li>
        <!-- [과제 확장 - 대기질 메뉴] Modern JavaScript 과제 확장으로 추가한 새 메뉴/API 소개 항목 -->
        <li><span>🌫️</span><strong>대기질 정보</strong><small>OpenWeather Air Pollution API로 도시별 미세먼지·오존 지수 확인</small></li>
      </ul>
      <RouterLink class="btn-primary" to="/"><el-button type="primary" size="large">대시보드로 돌아가기</el-button></RouterLink>
    </el-card>
  </div>
</template>

<style scoped>
.about-wrapper {
  width: 100%;
  margin: 0 auto;
}

.dashboard-card {
  border: 1px solid var(--line);
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(16, 24, 40, 0.045);
}
.dashboard-card :deep(.el-card__header) {
  padding: 18px 21px;
}

.dashboard-card h3 {
  margin: 0;
  color: #344054;
  font-size: 16px;
  font-weight: 750;
}

.about-intro {
  margin: 0 0 17px;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}

.about-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0;
  margin: 0 0 18px;
  list-style: none;
}

.about-list li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  padding: 14px;
  border: 1px solid #e4e7ec;
  border-radius: 11px;
  background: #fbfdfc;
}

.about-list li > span {
  grid-row: 1 / 3;
  font-size: 19px;
}

.about-list strong {
  color: #344054;
  font-size: 13px;
  font-weight: 750;
}

.about-list small {
  color: #667085;
  font-size: 11px;
  line-height: 1.55;
}

.about-list code {
  color: #087a55;
  font-size: 10px;
}

.btn-primary {
  display: inline-block;
  width: 100%;
  text-align: center;
  text-decoration: none;
}

.btn-primary :deep(.el-button) {
  width: 100%;
  font-weight: 750;
}

@media (max-width: 680px) {
  .dashboard-card {
    padding: 16px;
  }

  .about-list {
    grid-template-columns: 1fr;
  }
}
</style>
