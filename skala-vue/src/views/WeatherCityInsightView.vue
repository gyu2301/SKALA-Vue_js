<script setup>
/**
 * [과제 확장 - 도시 정보 메뉴]
 * 새 메뉴(라우트: /city-info)의 화면. WeatherAirQualityView와 같은 상태 처리 패턴
 * (로딩=el-skeleton, 오류=el-alert)을 따르고, 데이터 로직은 useCityInsights에 위임한다.
 */
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import CityInsightCard from '@/components/weather/CityInsightCard.vue'
import { useCityInsights } from '@/composables/useCityInsights'

const { citiesWithInsights, isLoading, errorMessage } = useCityInsights()
</script>

<template>
  <div class="city-insight-wrapper">
    <BaseDashboardCard title="도시별 현지 시각 · 위키 요약">
      <template #header="{ title }">
        <h3 class="card-title">
          {{ title }} <span class="result-count">({{ citiesWithInsights.length }})</span>
        </h3>
      </template>

      <el-skeleton v-if="isLoading && citiesWithInsights.length === 0" :rows="5" animated />
      <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />

      <div v-else class="city-insight-grid">
        <CityInsightCard v-for="city in citiesWithInsights" :key="city.id" :city="city" />
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.city-insight-wrapper {
  width: 100%;
  margin: 0 auto;
}

.card-title {
  padding-bottom: 11px;
  margin: 0 0 15px;
  border-bottom: 2px solid #eef2f1;
  color: #344054;
  font-size: 16px;
  font-weight: 750;
}

.result-count {
  color: #087a55;
  font-size: 0.85em;
  font-weight: 700;
}

.city-insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 15px;
}
</style>
