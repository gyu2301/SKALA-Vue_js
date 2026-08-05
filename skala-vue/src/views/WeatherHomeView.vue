<script setup>
/**
 * 날씨 대시보드 메인 화면 ( / )
 * WeatherParent.vue 를 대체하는 라우트 뷰. 상세보기는 window.alert 대신
 * Programmatic Navigation(router.push)으로 /weather/:cityId 로 이동한다.
 *
 * [실습 8 - Element Plus 적용]
 * ElAlert, ElButton, ElSkeleton, ElEmpty, ElMessage를 적용해 알림·로딩·오류·빈 상태의 UI를 통일했다.
 * [Weather Idea 구현]
 * 실시간 세계 바람 지구본과 비·눈·더위·건조 조건별 생활 날씨 알림을 추가했다.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import ThresholdRangeBar from '@/components/exercise/ThresholdRangeBar.vue'
import EarthWindGlobe from '@/components/weather/EarthWindGlobe.vue'
import { ElMessage } from 'element-plus'
import { useWeatherSearch } from '@/composables/useWeatherSearch'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import {
  HOT_THRESHOLD,
  MILD_THRESHOLD,
  COLD_ADVISORY_THRESHOLD,
  HUMIDITY_HIGH,
  HUMIDITY_LOW,
  WIND_STRONG,
  WIND_CALM,
} from '@/constants/weatherThresholds'

const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

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
  weatherList,
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
const isWideScreen = ref(false)
const isLocating = ref(false)
const locationError = ref('')
const locationNotice = ref('')
let desktopMediaQuery

// 1050px을 기준으로 지구본을 왼쪽 WEATHER MENU 아래로 옮기거나 본문 하단으로 복귀시킨다.
const updateLayoutMode = (event) => {
  isWideScreen.value = event.matches
}

// 기기 좌표를 받지 못할 때 공인 IP의 도시 수준 위치로 한 번 더 시도한다.
const useNetworkLocationFallback = async (reason) => {
  const result = await weatherStore.fetchApproximateLocationWeather()

  if (result) {
    locationNotice.value = `${reason} 네트워크 기반의 대략적인 현재 지역을 보여드려요.`
    locationError.value = ''
  } else {
    locationError.value = `${reason} 대체 위치도 확인하지 못해 서울 날씨를 보여드려요.`
  }
}

// [현재 위치] 브라우저 Geolocation으로 좌표를 받고 OpenWeatherMap 현재 날씨를 조회한다.
const requestCurrentLocation = async () => {
  locationError.value = ''
  locationNotice.value = ''
  isLocating.value = true

  // Geolocation API는 HTTPS 또는 localhost에서만 보장된다. LAN IP의 HTTP 접속이면 네트워크 위치로 대체한다.
  if (!window.isSecureContext) {
    await useNetworkLocationFallback('현재 접속 주소가 HTTPS/localhost가 아니어서 정확한 좌표를 요청할 수 없어요.')
    isLocating.value = false
    return
  }

  if (!navigator.geolocation) {
    await useNetworkLocationFallback('이 브라우저는 기기 위치 기능을 지원하지 않아요.')
    isLocating.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const result = await weatherStore.fetchWeatherByCoordinates(
        coords.latitude,
        coords.longitude,
        'device',
      )
      if (!result) {
        locationError.value = weatherStore.currentLocationError || '현재 위치 날씨를 확인하지 못했어요.'
      }
      isLocating.value = false
    },
    async (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        await useNetworkLocationFallback('브라우저 또는 운영체제가 정확한 좌표 제공을 차단했어요.')
      } else if (error.code === error.TIMEOUT) {
        await useNetworkLocationFallback('기기 위치 응답이 20초 안에 도착하지 않았어요.')
      } else {
        await useNetworkLocationFallback('운영체제에서 현재 좌표를 제공하지 못했어요.')
      }
      isLocating.value = false
    },
    { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 },
  )
}

onMounted(() => {
  desktopMediaQuery = window.matchMedia('(min-width: 1051px)')
  isWideScreen.value = desktopMediaQuery.matches
  desktopMediaQuery.addEventListener('change', updateLayoutMode)
  requestCurrentLocation()
})

onBeforeUnmount(() => desktopMediaQuery?.removeEventListener('change', updateLayoutMode))

// Today's Brief는 현재 위치 날씨를 우선하고, 위치 동의 전/거부 시 서울을 안전한 대체값으로 사용한다.
const briefCity = computed(
  () => weatherStore.currentLocationCity ?? weatherList.value.find((city) => city.id === 'city_01') ?? null,
)

const briefLocationLabel = computed(() => {
  if (weatherStore.currentLocationSource === 'device') return '기기의 현재 위치'
  if (weatherStore.currentLocationSource === 'network') return '네트워크 기반 대략 위치'
  return '서울 기준 · 위치 확인 전'
})

// [생활 날씨 규칙] 날씨·기온·습도에 따라 우산, 방한복, 수분, 선크림 등의 행동을 추천한다.
const weatherAdvice = computed(() => {
  const city = briefCity.value
  if (!city) return []

  const advice = []
  if (city.status === '비') advice.push({ icon: '☂️', text: '외출 전 우산을 챙기세요.', type: 'primary' })
  if (city.status === '눈') advice.push({ icon: '🧣', text: '우산과 따뜻한 방한복을 챙기세요.', type: 'primary' })
  if (city.temp >= 28) {
    advice.push({ icon: '💧', text: '자주 수분을 섭취하고 그늘에서 휴식하세요.', type: 'warning' })
    advice.push({ icon: '🧴', text: '자외선이 강해요. 선크림을 바르세요.', type: 'warning' })
  }
  if (city.temp < COLD_ADVISORY_THRESHOLD) {
    advice.push({ icon: '🧥', text: '쌀쌀해요. 겉옷을 챙겨 체온을 유지하세요.', type: 'primary' })
  }
  if (city.wind >= WIND_STRONG) {
    advice.push({ icon: '🌬️', text: '바람이 강해요. 우산이나 모자가 날아가지 않게 주의하세요.', type: 'warning' })
  }
  if (city.humidity <= 40) {
    advice.push({ icon: '🌵', text: '건조한 날씨예요. 수분을 섭취하고 목감기를 조심하세요.', type: 'error' })
  }
  if (city.humidity >= HUMIDITY_HIGH) {
    advice.push({ icon: '💦', text: '습도가 높아 꿉꿉해요. 통풍이 잘 되는 옷차림이 좋아요.', type: 'error' })
  }
  if (advice.length === 0) {
    advice.push({ icon: '😊', text: '활동하기 무난한 날씨예요. 즐거운 하루 보내세요!', type: 'success' })
  }
  return advice.slice(0, 4)
})

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
  // 현재 위치 도시도 상세 라우트에서 찾을 수 있도록 스토어 목록에 한 번 등록한다.
  if (city.id === 'current_location') addCityToDashboard(city)
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
  // [Element Plus] 도시 추가가 완료되었음을 ElMessage 토스트로 즉시 알린다.
  ElMessage.success(`${city.name}을(를) 대시보드에 추가했습니다.`)
}

// 검색어를 비워 검색 결과/필터를 정리하고 전체 도시 목록으로 복귀한다.
const backToDashboard = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- [Weather Idea 2 + Element Plus] 현재 위치에 맞는 생활 수칙을 ElAlert로 표시 -->
    <section v-if="briefCity" class="daily-brief" aria-label="오늘의 생활 날씨 알림">
      <div class="brief-city">
        <span>TODAY'S BRIEF · 📍 {{ briefLocationLabel }}</span>
        <strong>{{ briefCity.name }}의 생활 날씨</strong>
        <small v-if="isLocating">현재 위치를 확인하는 중이에요…</small>
        <small v-else-if="locationError">{{ locationError }}</small>
        <small v-else-if="locationNotice">{{ locationNotice }}</small>
        <small v-else>브라우저에서 확인한 현재 위치예요.</small>
      </div>
      <div class="brief-alerts">
        <el-alert
          v-for="item in weatherAdvice"
          :key="item.text"
          :type="item.type"
          :closable="false"
          show-icon
        >
          <template #title>{{ item.icon }} {{ item.text }}</template>
        </el-alert>
      </div>
      <div class="brief-actions">
        <el-button
          v-if="weatherStore.currentLocationSource !== 'device'"
          plain
          round
          :loading="isLocating"
          @click="requestCurrentLocation"
        >
          {{ weatherStore.currentLocationCity ? '정확한 위치 다시 찾기' : '현재 위치 다시 찾기' }}
        </el-button>
        <el-button type="primary" round @click="showDetail(briefCity)">
          시간대별 예보 · 옷차림 보기
        </el-button>
      </div>
    </section>

    <!-- [Element Plus] SearchBar 안에 ElInput·ElButton을 적용한 도시 검색 영역 -->
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
          <el-button type="primary" plain round @click="addAndSelect(city)">
            + 대시보드에 추가
          </el-button>
        </li>
      </ul>
      <el-button class="back-to-dashboard" plain round @click="backToDashboard">
        ← 대시보드로 돌아가기
      </el-button>
    </BaseDashboardCard>

    <!-- 도시 카드는 원래 위치인 메인 영역의 지역별 날씨 현황에 표시한다. -->
    <BaseDashboardCard title="지역별 날씨 현황">
      <template #header="{ title }">
        <h3 class="card-title">
          {{ title }} <span class="result-count">({{ filteredWeatherList.length }})</span>
        </h3>
      </template>

      <div class="legend">
        <ThresholdRangeBar label="🌡️ 온도" :segments="tempSegments" />
        <ThresholdRangeBar label="💧 습도" :segments="humiditySegments" />
        <ThresholdRangeBar label="🌬️ 바람" :segments="windSegments" />
      </div>

      <!-- [Element Plus 상태 UI] 로딩=Skeleton, API 오류=Alert, 결과 없음=Empty -->
      <el-skeleton v-if="isLoading" :rows="5" animated />
      <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />

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
        <el-alert
          v-if="!isLoading && !errorMessage && isSearching"
          :title="`'${searchQuery}' 도시를 OpenWeatherMap에서 검색하는 중입니다.`"
          type="info"
          :closable="false"
        />
        <div v-else-if="!isLoading && !errorMessage && searchErrorMessage" class="empty-state">
          <el-alert :title="searchErrorMessage" type="error" show-icon :closable="false" />
          <el-button plain round @click="backToDashboard">← 대시보드로 돌아가기</el-button>
        </div>
        <div v-else-if="!isLoading && !errorMessage && filteredWeatherList.length === 0" class="empty-state">
          <el-empty
            :description="`'${searchQuery}'와 일치하는 도시가 없어요. 도시 찾기를 눌러보세요.`"
            :image-size="72"
          />
          <el-button plain round @click="backToDashboard">← 대시보드로 돌아가기</el-button>
        </div>
      </template>
    </BaseDashboardCard>

    <!--
      넓은 화면: 지구본을 App.vue의 WEATHER MENU 아래로 Teleport
      좁은 화면: Teleport를 비활성화해 도시 카드 아래에 표시
    -->
    <Teleport to="#desktop-globe-slot" :disabled="!isWideScreen">
      <section
        class="world-weather-section"
        :class="{ 'is-sidebar': isWideScreen }"
        aria-label="실시간 세계 바람 지구본"
      >
        <EarthWindGlobe :compact="isWideScreen" />
      </section>
    </Teleport>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  margin: 0 auto;
}

.world-weather-section {
  margin-top: 18px;
}

.world-weather-section.is-sidebar {
  margin-top: 0;
}

.daily-brief {
  display: grid;
  grid-template-columns: minmax(180px, 0.7fr) minmax(280px, 1.5fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px 20px;
  margin-bottom: 18px;
  border: 1px solid #cfe2f4;
  border-radius: 17px;
  background: linear-gradient(120deg, #f8fbff, #eef7ff);
}

.brief-city {
  display: grid;
  gap: 2px;
}

.brief-city span {
  color: #337ecc;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.16em;
}

.brief-city strong {
  color: #26384b;
  font-size: 16px;
  font-weight: 800;
}

.brief-city small {
  color: #8292a6;
  font-size: 10px;
}

.brief-alerts {
  display: grid;
  gap: 7px;
}

.brief-alerts :deep(.el-alert) {
  padding-block: 7px;
}

.brief-alerts :deep(.el-alert__title) {
  font-size: 11px;
  font-weight: 700;
}

.brief-actions {
  display: grid;
  gap: 7px;
}

.brief-actions :deep(.el-button) {
  width: 100%;
  margin: 0;
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

.back-to-dashboard {
  width: 100%;
  margin: 12px 0 0;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 10px;
}

.empty-state :deep(.el-alert) {
  width: 100%;
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

@media (max-width: 980px) {
  .daily-brief {
    grid-template-columns: 1fr;
  }

  .daily-brief > .el-button {
    width: 100%;
  }
}

</style>
