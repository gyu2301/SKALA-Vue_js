<script setup>
// 서비스 소개 정적 페이지 ( /about )
</script>

<template>
  <div class="about-wrapper">
    <div class="dashboard-card">
      <h3>ℹ️ 서비스 소개</h3>
      <ul class="about-list">
        <li>본 앱은 Vue 3 및 Vue Router 4 기반으로 제작된 실습용 가상 대시보드 시스템입니다.</li>
        <li><code>components/exercise/</code> 폴더 내부의 독립 부품 연동으로 구성됩니다.</li>
        <li>클라이언트 사이드 라우팅을 통한 새로고침 없는 화면 전환을 지원합니다.</li>
        <li>URL 쿼리 스트링 매핑을 활용한 실시간 검색 상태 유지가 가능합니다.</li>
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
  background: #f8f9fa;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
.dashboard-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
}

.about-list {
  margin: 0 0 16px;
  padding-left: 20px;
  color: #495057;
  line-height: 1.8;
  font-size: 14px;
}

.btn-primary {
  display: inline-block;
  width: 100%;
  padding: 10px;
  background: #3498db;
  color: #fff;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  box-sizing: border-box;
}
.btn-primary:hover {
  background: #2980b9;
}
</style>
