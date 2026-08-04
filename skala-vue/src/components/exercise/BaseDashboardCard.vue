<script setup>
// 검색박스 / 리스트박스가 공유하는 공통 카드 껍데기.
// 실제 콘텐츠(도시 검색, 날씨 현황)는 부모(WeatherParent)가 <slot> 을 통해 주입한다.
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <section class="dashboard-card">
    <!-- header 슬롯: 기본은 title prop 을 그대로 보여주지만, 부모가 원하면 완전히 대체할 수 있다. -->
    <slot name="header" :title="title">
      <h3>{{ title }}</h3>
    </slot>
    <slot />
    <!-- footer 슬롯: 기본 콘텐츠 없음. 채우지 않으면 아무것도 렌더링되지 않는다. -->
    <slot name="footer" />
  </section>
</template>

<style scoped>
.dashboard-card {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--line);
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(16, 24, 40, 0.045);
}
.dashboard-card h3 {
  padding-bottom: 11px;
  margin: 0 0 15px;
  border-bottom: 2px solid #eef2f1;
  color: #344054;
  font-size: 16px;
  font-weight: 750;
}

@media (max-width: 680px) {
  .dashboard-card {
    padding: 16px;
  }
}
</style>
