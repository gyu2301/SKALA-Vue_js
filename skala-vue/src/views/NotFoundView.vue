<script setup>
// Catch-all Route ( /:pathMatch(.*)* ) 에 연결되는 404 안내 페이지
</script>

<template>
  <div class="not-found-wrapper">
    <span class="icon">☀️❓</span>
    <h3>페이지를 찾을 수 없습니다.</h3>
    <p>요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.</p>
    <RouterLink class="btn-primary" to="/">날씨 메인으로 이동</RouterLink>
  </div>
</template>

<style scoped>
.not-found-wrapper {
  text-align: center;
  padding: 60px 20px;
}
.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}
.not-found-wrapper h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 8px;
}
.not-found-wrapper p {
  color: #868e96;
  font-size: 14px;
  margin: 0 0 20px;
}

.btn-primary {
  display: inline-block;
  padding: 10px 20px;
  background: #3498db;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}
.btn-primary:hover {
  background: #2980b9;
}
</style>
