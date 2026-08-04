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
  background: #f8f9fa;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
.dashboard-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px;
}

.btn-back {
  display: inline-block;
  margin-top: 20px;
  padding: 8px 14px;
  background: #2c3e50;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}
.btn-back:hover {
  background: #1a252f;
}
</style>
