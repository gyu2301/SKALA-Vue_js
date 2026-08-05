<script setup>
/**
 * [과제 확장 - 대기질 메뉴]
 * 새 메뉴(라우트: /air-quality)의 화면. WeatherHomeView와 같은 상태 처리 패턴
 * (로딩=el-skeleton, 오류=el-alert)을 따르고, 실제 데이터/정렬 로직은 전부
 * useAirQuality Composable에 위임한다.
 */
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import AirQualityCard from '@/components/weather/AirQualityCard.vue'
import { useAirQuality } from '@/composables/useAirQuality'

const { citiesWithAirQuality, cleanestCity, worstCity, isLoading, errorMessage } = useAirQuality()
</script>

<template>
  <div class="air-quality-wrapper">
    <!-- 가장 맑은/나쁜 도시 요약 스트립. 두 도시 모두 있을 때만(=최소 1개 이상 대기질 데이터 확보) 보여준다. -->
    <section v-if="cleanestCity && worstCity" class="ranking-brief" aria-label="대기질 요약">
      <div class="ranking-item best">
        <span>가장 맑은 도시</span>
        <strong>{{ cleanestCity.name }}</strong>
        <small>{{ cleanestCity.level.label }} · PM2.5 {{ cleanestCity.pm2_5?.toFixed(1) }}</small>
      </div>
      <div class="ranking-item worst">
        <span>가장 나쁜 도시</span>
        <strong>{{ worstCity.name }}</strong>
        <small>{{ worstCity.level.label }} · PM2.5 {{ worstCity.pm2_5?.toFixed(1) }}</small>
      </div>
    </section>

    <BaseDashboardCard title="도시별 대기질 현황">
      <template #header="{ title }">
        <h3 class="card-title">
          {{ title }} <span class="result-count">({{ citiesWithAirQuality.length }})</span>
        </h3>
      </template>

      <el-skeleton v-if="isLoading && citiesWithAirQuality.length === 0" :rows="5" animated />
      <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />

      <div v-else class="air-quality-grid">
        <AirQualityCard v-for="city in citiesWithAirQuality" :key="city.id" :city="city" />
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.air-quality-wrapper {
  width: 100%;
  margin: 0 auto;
}

.ranking-brief {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.ranking-item {
  display: grid;
  gap: 3px;
  padding: 16px 18px;
  border-radius: 15px;
}

.ranking-item.best {
  border: 1px solid #bde2d4;
  background: linear-gradient(120deg, #f4fbf8, #effaf6);
}

.ranking-item.worst {
  border: 1px solid #f4c7c3;
  background: linear-gradient(120deg, #fdf5f4, #fef3f2);
}

.ranking-item span {
  color: #667085;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.ranking-item strong {
  color: #1b2b3b;
  font-size: 18px;
  font-weight: 800;
}

.ranking-item small {
  color: #667085;
  font-size: 11px;
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

.air-quality-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 15px;
}

@media (max-width: 640px) {
  .ranking-brief {
    grid-template-columns: 1fr;
  }
}
</style>
