<script setup>
// 서비스 소개 정적 페이지 ( /about )
</script>

<template>
  <div class="about-wrapper">
    <div class="dashboard-card">
      <h3>ℹ️ 프로젝트 구성</h3>
      <p class="about-intro">
        Vue의 핵심 기능을 실제 날씨 데이터 흐름에 연결한 실습용 대시보드입니다.
      </p>
      <ul class="about-list">
        <li><span>⚡</span><strong>Vue 3 기반</strong><small>Composition API로 구성한 반응형 UI</small></li>
        <li><span>🧩</span><strong>독립 컴포넌트</strong><small><code>components/exercise/</code> 단위의 재사용 구조</small></li>
        <li><span>🛣️</span><strong>Vue Router</strong><small>새로고침 없는 목록·상세 화면 전환</small></li>
        <li><span>🔎</span><strong>검색 상태 유지</strong><small>URL 쿼리 스트링과 연결된 도시 검색</small></li>
      </ul>
      <RouterLink class="btn-primary" to="/">대시보드로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.about-wrapper {
  width: 100%;
  margin: 0 auto;
}

.dashboard-card {
  padding: 21px;
  border: 1px solid var(--line);
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(16, 24, 40, 0.045);
}
.dashboard-card h3 {
  padding-bottom: 12px;
  margin: 0 0 15px;
  border-bottom: 2px solid #eef2f1;
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
  padding: 11px;
  border-radius: 9px;
  background: #087a55;
  color: #fff;
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: #075d42;
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
