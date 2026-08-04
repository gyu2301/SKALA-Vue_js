<script setup>
// Code Challenge 6. Pinia - Store 사용 예제 화면 ( /practices/store-counter )
import StoreCounter from '@/components/practices/library/StoreCounter.vue'
</script>

<template>
  <div class="practice-wrapper">
    <div class="dashboard-card">
      <h3>🧮 Pinia Store 사용 예제 (counter.js)</h3>
      <StoreCounter />
      <RouterLink class="btn-back" to="/">← 메인 대시보드로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.practice-wrapper {
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
  margin: 0 0 16px;
  border-bottom: 2px solid #eef2f1;
  color: #344054;
  font-size: 16px;
  font-weight: 750;
}

.btn-back {
  display: inline-block;
  margin-top: 20px;
  padding: 9px 14px;
  border-radius: 9px;
  background: #087a55;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}
.btn-back:hover {
  background: #075d42;
}
</style>
