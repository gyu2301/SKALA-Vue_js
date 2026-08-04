<script setup>
/**
 * 지역별 상세 기상 관측 정보 ( /weather/:cityId )
 * 동적 경로 매칭으로 전달된 cityId 를 기반으로 weatherStore(OpenWeatherMap 연동) 목록에서
 * 해당 도시 객체를 찾아 보여준다. weatherList 가 API 응답 도착 후에 채워지는 비동기
 * 데이터이므로, onMounted 시점의 1회성 조회 대신 computed 로 만들어 데이터 도착 시 자동 반영한다.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWeatherSearch } from '@/composables/useWeatherSearch'
import { useConfigStore } from '@/stores/configStore'

const route = useRoute()
const { weatherList, isLoading, errorMessage } = useWeatherSearch()
const configStore = useConfigStore()

const city = computed(() => weatherList.value.find((item) => item.id === route.params.cityId) ?? null)

// 화면 표시용 기온. Mock 데이터(city.temp)는 항상 섭씨 원본이며, 단위 설정에 맞춰 변환해 보여준다.
const displayTemp = computed(() => {
  if (!city.value) return null
  if (configStore.unit === 'fahrenheit') {
    return Math.round((city.value.temp * 9) / 5 + 32)
  }
  return city.value.temp
})
</script>

<template>
  <div class="detail-wrapper">
    <div class="dashboard-card">
      <h3>🌡️ 지역별 상세 기상 관측 정보</h3>

      <p v-if="isLoading" class="loading-message">OpenWeatherMap에서 날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="errorMessage" class="api-error" role="alert">{{ errorMessage }}</p>

      <div v-else-if="city" class="detail-body">
        <p>
          📍 지정 지역: <strong>{{ city.address }}</strong>
        </p>
        <p>실시간 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>
        <p>기상 현황: {{ city.status }}</p>
        <p>대기 습도: {{ city.humidity }}%</p>
        <p>현재 풍속: {{ city.wind }}m/s</p>
      </div>
      <p v-else class="empty-message">
        '{{ route.params.cityId }}'에 해당하는 도시 정보를 찾을 수 없습니다.
      </p>

      <RouterLink class="btn-back" to="/">← 메인 대시보드로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.detail-wrapper {
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

.detail-body {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.detail-body p {
  margin: 6px 0;
  color: #2c3e50;
}

.empty-message {
  margin: 8px 0 16px;
  padding: 12px 0;
  text-align: center;
  color: #e74c3c;
  font-size: 14px;
}

.loading-message {
  margin: 8px 0 16px;
  padding: 20px 0;
  text-align: center;
  color: #868e96;
  font-size: 14px;
}

.api-error {
  margin: 8px 0 16px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #fff1f3;
  color: #c01048;
  font-size: 13px;
}

.btn-back {
  display: inline-block;
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
