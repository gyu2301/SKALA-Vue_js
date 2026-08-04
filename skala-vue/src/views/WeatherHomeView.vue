<script setup>
/**
 * 날씨 대시보드 메인 화면 ( / )
 * WeatherParent.vue 를 대체하는 라우트 뷰. 상세보기는 window.alert 대신
 * Programmatic Navigation(router.push)으로 /weather/:cityId 로 이동한다.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import ThresholdRangeBar from '@/components/exercise/ThresholdRangeBar.vue'
import { useWeatherSearch } from '@/composables/useWeatherSearch'
import { useConfigStore } from '@/stores/configStore'
import {
  HOT_THRESHOLD,
  MILD_THRESHOLD,
  HUMIDITY_HIGH,
  HUMIDITY_LOW,
  WIND_STRONG,
  WIND_CALM,
} from '@/constants/weatherThresholds'

const router = useRouter()
const configStore = useConfigStore()

// 범례를 "낮음 ← ─── → 높음" 그라데이션 바로 보여주기 위한 구간 데이터.
// 색상은 WeatherCard 의 배지/이모지 색과 맞춰 카드 목록과 시각적으로 이어지게 했다.
// 낮음(흰색) → 중간(회색) → 높음(옅은 반투명 색) 3단 그라데이션. 전 구간 글씨는 진한 회색으로 통일.
const NEUTRAL_LOW = '#ffffff'
const NEUTRAL_MID = '#e9ecef'

// 온도 기준값(Celsius 상수)을 현재 단위 설정에 맞춰 표시용으로 변환한다.
const toDisplayTemp = (celsius) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32)
  }
  return celsius
}

// 단위가 바뀌면 범례 문구도 함께 바뀌어야 하므로 computed 로 만든다.
const tempSegments = computed(() => [
  {
    icon: '🥶',
    text: `선선함 (${toDisplayTemp(MILD_THRESHOLD)}${configStore.unitSymbol}↓)`,
    color: NEUTRAL_LOW,
  },
  {
    icon: '🙂',
    text: `보통 (${toDisplayTemp(MILD_THRESHOLD)}~${toDisplayTemp(HOT_THRESHOLD - 1)}${configStore.unitSymbol})`,
    color: NEUTRAL_MID,
  },
  {
    icon: '🥵',
    text: `더움 (${toDisplayTemp(HOT_THRESHOLD)}${configStore.unitSymbol}↑)`,
    color: 'rgba(231, 76, 60, 0.18)',
  },
])
const humiditySegments = [
  { icon: '🌵', text: `건조 (${HUMIDITY_LOW}%↓)`, color: NEUTRAL_LOW },
  { icon: '🌫️', text: `보통 (${HUMIDITY_LOW}~${HUMIDITY_HIGH - 1}%)`, color: NEUTRAL_MID },
  { icon: '💧', text: `습함 (${HUMIDITY_HIGH}%↑)`, color: 'rgba(52, 152, 219, 0.18)' },
]
const windSegments = [
  { icon: '😌', text: `잔잔 (${WIND_CALM}m/s↓)`, color: NEUTRAL_LOW },
  { icon: '🍃', text: `보통 (${WIND_CALM}~${WIND_STRONG}m/s)`, color: NEUTRAL_MID },
  { icon: '🌬️', text: `강풍 (${WIND_STRONG}m/s↑)`, color: 'rgba(52, 73, 94, 0.22)' },
]

const {
  searchQuery,
  filteredWeatherList,
  isLoading,
  errorMessage,
  isSearching,
  searchErrorMessage,
  searchResults,
  searchCity,
  addCityToDashboard,
} = useWeatherSearch()

const selectedCityId = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

const clearSelection = () => {
  selectedCityId.value = ''
  selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
}

// 상세보기: alert 대신 상세 페이지로 이동한다.
const showDetail = (city) => {
  router.push(`/weather/${city.id}`)
}

// 이미 대시보드에 있는 도시 중에 일치하는 곳이 있으면 그중 첫 번째를 바로 선택하고,
// 없으면 OpenWeatherMap 에서 해당 이름(부분 입력 포함)의 도시를 검색한다. 검색 결과는
// 대시보드에 바로 추가되지 않고 "검색 결과" 미리보기 목록(searchResults)에 담기며,
// 사용자가 카드의 "추가하기"를 눌러야 비로소 대시보드로 옮겨진다.
const selectFirstMatch = async () => {
  if (filteredWeatherList.value.length > 0) {
    selectCity(filteredWeatherList.value[0])
    return
  }

  await searchCity(searchQuery.value)
}

// 검색 미리보기 카드의 "추가하기": 대시보드에 추가하고 곧바로 선택 상태로 만든다.
const addAndSelect = (city) => {
  addCityToDashboard(city)
  selectCity(city)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard title="도시 검색">
      <SearchBar v-model.trim.lazy="searchQuery" @select-first="selectFirstMatch" />
    </BaseDashboardCard>

    <BaseDashboardCard v-if="searchResults.length > 0" title="검색 결과">
      <ul class="search-result-list">
        <li v-for="city in searchResults" :key="city.id" class="search-result-item">
          <div class="search-result-info">
            <strong>{{ city.name }}</strong>
            <span>{{ city.address }}</span>
          </div>
          <button class="btn-add" @click="addAndSelect(city)">+ 대시보드에 추가</button>
        </li>
      </ul>
    </BaseDashboardCard>

    <BaseDashboardCard title="지역별 날씨 현황">
      <template #header="{ title }">
        <h3 class="card-title">{{ title }} <span class="result-count">({{ filteredWeatherList.length }})</span></h3>
      </template>

      <div class="legend">
        <ThresholdRangeBar label="🌡️ 온도" :segments="tempSegments" />
        <ThresholdRangeBar label="💧 습도" :segments="humiditySegments" />
        <ThresholdRangeBar label="🌬️ 바람" :segments="windSegments" />
      </div>

      <p v-if="isLoading" class="loading-message">OpenWeatherMap에서 날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="errorMessage" class="api-error" role="alert">{{ errorMessage }}</p>

      <div v-else class="weather-grid" @click.self="clearSelection">
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city="city"
          :is-selected="city.id === selectedCityId"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
      </div>

      <template #footer>
        <p v-if="!isLoading && !errorMessage && isSearching" class="loading-message">
          '{{ searchQuery }}' 도시를 OpenWeatherMap에서 검색하는 중입니다...
        </p>
        <p v-else-if="!isLoading && !errorMessage && searchErrorMessage" class="api-error" role="alert">
          {{ searchErrorMessage }}
        </p>
        <p v-else-if="!isLoading && !errorMessage && filteredWeatherList.length === 0" class="empty-message">
          '{{ searchQuery }}'와 일치하는 도시가 기본 목록에 없습니다. Enter를 눌러 다른 도시를 검색해 보세요.
        </p>
      </template>
    </BaseDashboardCard>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  margin: 0 auto;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 15px;
}

.search-result-list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e4e7ec;
  border-radius: 11px;
  background: #f9fafb;
}

.search-result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.search-result-info strong {
  color: #273849;
  font-size: 14px;
  font-weight: 800;
}
.search-result-info span {
  color: #667085;
  font-size: 12px;
}

.btn-add {
  padding: 8px 12px;
  border: 1px solid #42b883;
  border-radius: 8px;
  background: #effaf6;
  color: #087a55;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}
.btn-add:hover {
  background: #d6f2e6;
  transform: translateY(-1px);
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

.legend {
  padding: 13px 14px;
  margin: 0 0 16px;
  border: 1px solid #d6eee5;
  border-radius: 11px;
  background: linear-gradient(120deg, #fbfefd, #f3faf7);
}

.empty-message {
  margin: 8px 0 0;
  padding: 16px;
  border: 1px solid #fedf89;
  border-radius: 10px;
  background: #fffaeb;
  text-align: center;
  color: #93370d;
  font-size: 13px;
}

.loading-message {
  margin: 8px 0 0;
  padding: 20px 0;
  text-align: center;
  color: #667085;
  font-size: 13px;
}

.api-error {
  margin: 8px 0 0;
  padding: 12px 14px;
  border: 1px solid #fecdca;
  border-radius: 10px;
  background: #fef3f2;
  color: #b42318;
  font-size: 13px;
}

.status-bar {
  padding: 12px 14px;
  border: 1px solid #bde2d4;
  border-radius: 11px;
  background: #effaf6;
  text-align: center;
  color: #087a55;
  font-size: 13px;
  font-weight: 750;
}
</style>
