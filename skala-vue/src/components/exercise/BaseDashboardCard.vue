<script setup>
// 검색박스 / 리스트박스가 공유하는 공통 카드 껍데기.
// 실제 콘텐츠(도시 검색, 날씨 현황)는 부모(WeatherParent)가 <slot> 을 통해 주입한다.
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <section class="dashboard-card">
    <h3>{{ title }}</h3>
    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  background: #f8f9fa;
  padding: 18px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
}
.dashboard-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
}
</style>
