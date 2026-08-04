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
  padding: 58px 20px;
  border: 1px solid #d6eee5;
  border-radius: 15px;
  background: linear-gradient(145deg, #ffffff, #f1faf7);
  text-align: center;
}
.icon {
  display: block;
  margin-bottom: 14px;
  font-size: 3rem;
}
.not-found-wrapper h3 {
  margin: 0 0 8px;
  color: #273849;
  font-size: 1.25rem;
  font-weight: 800;
}
.not-found-wrapper p {
  margin: 0 0 20px;
  color: #667085;
  font-size: 13px;
}

.btn-primary {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 9px;
  background: #087a55;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}
.btn-primary:hover {
  background: #075d42;
}
</style>
