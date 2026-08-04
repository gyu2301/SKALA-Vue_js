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
        <div class="location-summary">
          <span>📍 지정 지역</span>
          <strong>{{ city.address }}</strong>
        </div>

        <div class="observation-grid">
          <article>
            <span>🌡️ 실시간 기온</span>
            <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
          </article>
          <article>
            <span>⛅ 기상 현황</span>
            <strong>{{ city.status }}</strong>
          </article>
          <article>
            <span>💧 대기 습도</span>
            <strong>{{ city.humidity }}%</strong>
          </article>
          <article>
            <span>🌬️ 현재 풍속</span>
            <strong>{{ city.wind }}m/s</strong>
          </article>
        </div>
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

.detail-body {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #d6eee5;
  border-radius: 13px;
  background: linear-gradient(135deg, #f9fdfb, #f1faf7);
}

.location-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #d6eee5;
}

.location-summary span,
.observation-grid span {
  color: #667085;
  font-size: 12px;
  font-weight: 650;
}

.location-summary strong {
  color: #273849;
  font-size: 15px;
  font-weight: 800;
  text-align: right;
}

.observation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.observation-grid article {
  display: grid;
  gap: 4px;
  padding: 14px;
  border: 1px solid #e4e7ec;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.88);
}

.observation-grid strong {
  color: #087a55;
  font-size: 20px;
  font-weight: 800;
}

.empty-message {
  margin: 8px 0 16px;
  padding: 12px 0;
  text-align: center;
  color: #b42318;
  font-size: 13px;
}

.loading-message {
  margin: 8px 0 16px;
  padding: 20px 0;
  text-align: center;
  color: #667085;
  font-size: 13px;
}

.api-error {
  margin: 8px 0 16px;
  padding: 10px 12px;
  border: 1px solid #fecdca;
  border-radius: 10px;
  background: #fef3f2;
  color: #b42318;
  font-size: 13px;
}

.btn-back {
  display: inline-block;
  padding: 9px 14px;
  border-radius: 9px;
  background: #087a55;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}
.btn-back:hover {
  background: #075d42;
  transform: translateY(-1px);
}

@media (max-width: 560px) {
  .dashboard-card {
    padding: 16px;
  }

  .location-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .location-summary strong {
    text-align: left;
  }

  .observation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
