<script setup>
/**
 * [실습 8 확장 - 도시 상세 화면]
 * 선택한 도시의 실시간 관측값, 생활 날씨 알림, 24시간 그래프,
 * 아침·점심·오후·저녁 옷차림을 한 페이지에서 보여준다.
 * ElCard, ElTag, ElSkeleton, ElAlert, ElEmpty, ElButton을 화면 상태와 정보 구조에 활용했다.
 *
 * [과제 확장 - 도시 정보] 현지 시각(timeapi.io)과 위키백과 요약을 히어로/새 섹션에 추가했다.
 */
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWeatherSearch } from '@/composables/useWeatherSearch'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import HourlyWeatherChart from '@/components/weather/HourlyWeatherChart.vue'

const route = useRoute()
const { weatherList, isLoading, errorMessage } = useWeatherSearch()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

// URL의 cityId와 Pinia 스토어의 도시를 연결한다. API 응답이 늦게 도착해도 computed가 자동 갱신된다.
const city = computed(() => weatherList.value.find((item) => item.id === route.params.cityId) ?? null)

// [24시간 예보] 도시 데이터가 준비되면 해당 좌표의 예보를 자동으로 조회한다.
// [과제 확장 - 도시 정보] 같은 시점에 현지 시각·위키 요약도 함께 요청한다.
watch(
  city,
  (value) => {
    if (value) {
      weatherStore.fetchCityForecast(value)
      weatherStore.fetchCityInsights([value])
    }
  },
  { immediate: true },
)

// [과제 확장 - 도시 정보] 캐시된 현지 시각·위키 요약을 꺼내 화면에서 바로 쓸 수 있게 가공한다.
const cityInsight = computed(() => weatherStore.cityInsightsByCity[route.params.cityId] ?? null)
const localTimeLabel = computed(() => {
  const time = cityInsight.value?.localTime
  if (!time) return null
  // Modern JS 포인트) padStart로 "9:5" 대신 "09:05" 두 자리 형식을 만든다.
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
})
const isDaytime = computed(() => {
  const hour = cityInsight.value?.localTime?.hour
  return hour == null ? null : hour >= 6 && hour < 18
})
const wikipediaUrl = computed(() => (city.value ? `https://ko.wikipedia.org/wiki/${encodeURIComponent(city.value.name)}` : ''))

const toDisplayTemp = (celsius) => {
  if (configStore.unit === 'fahrenheit') return Math.round((celsius * 9) / 5 + 32)
  return celsius
}

const displayTemp = computed(() => (city.value ? toDisplayTemp(city.value.temp) : null))
const forecast = computed(() => weatherStore.forecastByCity[route.params.cityId] ?? [])

const statusIcon = computed(() => {
  const icons = { '맑음': '☀️', '비': '🌧️', '눈': '❄️', '구름': '☁️', '흐림': '🌥️' }
  return icons[city.value?.status] ?? '🌤️'
})

// [Weather Idea - 생활 알림] 비·눈·더위·건조 조건을 판별해 우산, 방한복, 수분 섭취 등을 추천한다.
const safetyTips = computed(() => {
  if (!city.value) return []
  const tips = []

  if (city.value.status === '비') tips.push({ icon: '☂️', title: '우산을 챙기세요', text: '강수 예보가 있어요. 미끄러운 길도 조심하세요.' })
  if (city.value.status === '눈') tips.push({ icon: '🧥', title: '방한복이 필요해요', text: '우산과 목도리, 따뜻한 외투를 챙기세요.' })
  if (city.value.temp >= 28) {
    tips.push({ icon: '💧', title: '수분을 충분히', text: '물을 자주 마시고 그늘에서 휴식하세요.' })
    tips.push({ icon: '🧴', title: '자외선 차단', text: '외출 20분 전에 선크림을 바르세요.' })
  }
  if (city.value.humidity <= 40) tips.push({ icon: '🌵', title: '건조함 주의', text: '수분을 섭취하고 목감기를 조심하세요.' })
  if (tips.length === 0) tips.push({ icon: '🌿', title: '활동하기 좋은 날', text: '큰 불편 없이 일상 활동을 즐길 수 있어요.' })

  return tips
})

// [Weather Idea - 옷차림] 예보 기온과 눈 여부를 기준으로 시간대별 옷차림을 결정한다.
const getOutfit = (temp, status) => {
  if (status === '눈' || temp <= 4) return { icon: '🧥', name: '패딩 · 목도리', detail: '방한 소품과 두꺼운 외투' }
  if (temp <= 11) return { icon: '🧥', name: '코트 · 니트', detail: '여러 겹으로 체온 조절' }
  if (temp <= 17) return { icon: '🧥', name: '자켓 · 맨투맨', detail: '가벼운 아우터를 추천' }
  if (temp <= 23) return { icon: '👕', name: '긴팔 · 면바지', detail: '활동하기 편한 차림' }
  if (temp <= 27) return { icon: '👕', name: '반팔 · 얇은 바지', detail: '통기성 좋은 소재' }
  return { icon: '🩳', name: '반팔 · 반바지', detail: '모자와 선글라스 추천' }
}

// 예보 배열에서 아침·점심·오후·저녁 대표 시간을 골라 옷차림 카드 데이터로 가공한다.
const dayParts = computed(() => {
  if (!city.value) return []
  const periods = [
    { label: '아침', time: '07:00', index: 0 },
    { label: '점심', time: '12:00', index: 2 },
    { label: '오후', time: '16:00', index: 4 },
    { label: '저녁', time: '20:00', index: 6 },
  ]

  return periods.map((period) => {
    const item = forecast.value[period.index] ?? city.value
    return {
      ...period,
      temp: item.temp,
      status: item.status,
      outfit: getOutfit(item.temp, item.status),
    }
  })
})
</script>

<template>
  <div class="detail-wrapper">
    <!-- [Element Plus 상태 UI] 초기 API 로딩과 오류를 Skeleton/Alert로 구분한다. -->
    <el-skeleton v-if="isLoading" :rows="8" animated />
    <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />

    <template v-else-if="city">
      <section class="detail-hero">
        <div class="location-copy">
          <el-tag effect="dark" type="primary" round>NOW</el-tag>
          <span>{{ city.address }}</span>
          <h3>{{ city.name }}</h3>
          <p>{{ statusIcon }} {{ city.status }}</p>
        </div>
        <div class="hero-temperature">
          <strong>{{ displayTemp }}<small>{{ configStore.unitSymbol }}</small></strong>
          <span>실시간 관측 기온</span>
        </div>
        <div class="hero-metrics">
          <div><span>💧 습도</span><strong>{{ city.humidity }}%</strong></div>
          <div><span>🌬️ 풍속</span><strong>{{ city.wind }}m/s</strong></div>
          <!-- [과제 확장 - 도시 정보] 타임존 정보가 없는 검색 도시는 시각 배지를 생략한다. -->
          <div v-if="localTimeLabel">
            <span>{{ isDaytime ? '☀️' : '🌙' }} 현지 시각</span><strong>{{ localTimeLabel }}</strong>
          </div>
        </div>
      </section>

      <!-- [과제 확장 - 도시 정보] 위키백과 요약 카드. 아직 못 불러왔으면 조용히 숨긴다. -->
      <section v-if="cityInsight?.wiki" class="city-info-section">
        <div class="section-heading">
          <div>
            <span>CITY INFO</span>
            <h3>{{ city.name }}에 관하여</h3>
          </div>
        </div>
        <div class="city-info-body">
          <img
            v-if="cityInsight.wiki.thumbnail"
            :src="cityInsight.wiki.thumbnail"
            :alt="city.name"
            class="city-info-thumbnail"
          />
          <div>
            <p>{{ cityInsight.wiki.extract }}</p>
            <a :href="wikipediaUrl" target="_blank" rel="noopener noreferrer">위키백과에서 더 보기 →</a>
          </div>
        </div>
      </section>

      <!-- [Weather Idea 2] 날씨 조건별 생활 주의사항 -->
      <section class="tip-section">
        <div class="section-heading">
          <div>
            <span>WEATHER CARE</span>
            <h3>오늘 {{ city.name }}에서 이것만은 챙기세요</h3>
          </div>
        </div>
        <div class="tip-grid">
          <el-card v-for="tip in safetyTips" :key="tip.title" shadow="hover" class="tip-card">
            <span class="tip-icon">{{ tip.icon }}</span>
            <div><strong>{{ tip.title }}</strong><p>{{ tip.text }}</p></div>
          </el-card>
        </div>
      </section>

      <!-- [Weather Idea 3 + Element Plus] ElCard 안에 24시간 기온/강수 그래프를 배치 -->
      <el-card class="forecast-card" shadow="never">
        <template #header>
          <div class="section-heading compact">
            <div>
              <span>24H FORECAST</span>
              <h3>하루 기온 · 강수 확률</h3>
            </div>
            <el-tag type="info" round>3시간 단위</el-tag>
          </div>
        </template>
        <el-skeleton v-if="weatherStore.forecastLoading" :rows="5" animated />
        <el-alert
          v-else-if="weatherStore.forecastError"
          :title="weatherStore.forecastError"
          type="warning"
          show-icon
          :closable="false"
        />
        <HourlyWeatherChart v-else :entries="forecast" :unit="configStore.unit" />
      </el-card>

      <!-- [Weather Idea 4] 아침·점심·오후·저녁 옷차림 추천 -->
      <section class="outfit-section">
        <div class="section-heading">
          <div>
            <span>OUTFIT GUIDE</span>
            <h3>시간대별 옷차림 추천</h3>
          </div>
          <p>기온과 기상 상태를 기준으로 추천해요.</p>
        </div>
        <div class="outfit-grid">
          <article v-for="part in dayParts" :key="part.label" class="outfit-card">
            <div class="outfit-time"><strong>{{ part.label }}</strong><span>{{ part.time }}</span></div>
            <div class="outfit-visual">{{ part.outfit.icon }}</div>
            <strong>{{ part.outfit.name }}</strong>
            <p>{{ part.outfit.detail }}</p>
            <el-tag effect="plain" round>{{ toDisplayTemp(part.temp) }}{{ configStore.unitSymbol }} · {{ part.status }}</el-tag>
          </article>
        </div>
      </section>

      <RouterLink class="back-link" to="/">
        <el-button size="large" plain>← 세계 날씨 대시보드로</el-button>
      </RouterLink>
    </template>

    <el-empty v-else :description="`'${route.params.cityId}' 도시 정보를 찾을 수 없어요.`">
      <RouterLink to="/"><el-button type="primary">메인으로 돌아가기</el-button></RouterLink>
    </el-empty>
  </div>
</template>

<style scoped>
.detail-wrapper {
  width: 100%;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto minmax(190px, 0.7fr);
  gap: 26px;
  align-items: center;
  padding: 28px;
  margin-bottom: 18px;
  overflow: hidden;
  border-radius: 22px;
  color: #fff;
  background:
    radial-gradient(circle at 72% 10%, rgba(92, 195, 255, 0.35), transparent 32%),
    linear-gradient(135deg, #143a62, #256aa2 58%, #2d8fb9);
  box-shadow: 0 18px 38px rgba(31, 86, 132, 0.2);
}

.location-copy > span {
  margin-left: 8px;
  color: #b7d9f3;
  font-size: 11px;
}

.location-copy h3 {
  margin: 12px 0 3px;
  font-size: clamp(28px, 5vw, 44px);
  letter-spacing: -0.05em;
}

.location-copy p {
  margin: 0;
  color: #d8ebf8;
  font-size: 15px;
}

.hero-temperature {
  display: grid;
  justify-items: center;
}

.hero-temperature strong {
  font-size: clamp(50px, 7vw, 72px);
  letter-spacing: -0.08em;
  line-height: 1;
}

.hero-temperature small {
  font-size: 22px;
}

.hero-temperature span {
  margin-top: 7px;
  color: #bdd9ec;
  font-size: 10px;
}

.hero-metrics {
  display: grid;
  gap: 8px;
}

.hero-metrics div {
  display: grid;
  gap: 3px;
  padding: 13px 15px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.hero-metrics span {
  color: #cce4f4;
  font-size: 10px;
}

.hero-metrics strong {
  font-size: 18px;
}

.tip-section,
.outfit-section,
.city-info-section,
.forecast-card {
  margin-bottom: 18px;
}

.tip-section,
.outfit-section,
.city-info-section {
  padding: 22px;
  border: 1px solid #e4eaf1;
  border-radius: 18px;
  background: #fff;
}

/* [과제 확장 - 도시 정보] 위키 썸네일 + 요약 텍스트를 나란히 배치한다. */
.city-info-body {
  display: grid;
  grid-template-columns: minmax(140px, 220px) minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}

.city-info-thumbnail {
  width: 100%;
  height: 140px;
  border-radius: 14px;
  object-fit: cover;
}

.city-info-body p {
  margin: 0 0 8px;
  color: #475467;
  font-size: 13px;
  line-height: 1.7;
}

.city-info-body a {
  color: #337ecc;
  font-size: 12px;
  font-weight: 750;
  text-decoration: none;
}

.city-info-body a:hover {
  text-decoration: underline;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.section-heading.compact {
  margin: 0;
}

.section-heading span {
  color: #337ecc;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.15em;
}

.section-heading h3 {
  margin: 3px 0 0;
  color: #273849;
  font-size: 18px;
}

.section-heading > p {
  margin: 0;
  color: #98a2b3;
  font-size: 11px;
}

.tip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
}

.tip-card :deep(.el-card__body) {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 15px;
}

.tip-icon {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: #eff6ff;
  font-size: 22px;
  place-items: center;
}

.tip-card strong {
  color: #344054;
  font-size: 13px;
}

.tip-card p {
  margin: 3px 0 0;
  color: #7c8b9d;
  font-size: 10px;
  line-height: 1.45;
}

.forecast-card {
  border-radius: 18px;
}

.forecast-card :deep(.el-card__header) {
  padding: 18px 22px;
}

.forecast-card :deep(.el-card__body) {
  padding: 18px 22px;
}

.outfit-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 11px;
}

.outfit-card {
  display: grid;
  justify-items: center;
  padding: 15px;
  border: 1px solid #e4eaf1;
  border-radius: 15px;
  background: linear-gradient(160deg, #fff, #f7faff);
  text-align: center;
}

.outfit-time {
  display: flex;
  width: 100%;
  justify-content: space-between;
  color: #7c8b9d;
  font-size: 10px;
}

.outfit-time strong {
  color: #344054;
}

.outfit-visual {
  display: grid;
  width: 66px;
  height: 66px;
  margin: 13px 0 10px;
  border-radius: 50%;
  background: #eaf4ff;
  font-size: 35px;
  place-items: center;
}

.outfit-card > strong {
  color: #273849;
  font-size: 13px;
}

.outfit-card > p {
  min-height: 30px;
  margin: 4px 0 10px;
  color: #8292a6;
  font-size: 10px;
  line-height: 1.45;
}

.back-link {
  display: inline-block;
  text-decoration: none;
}

@media (max-width: 820px) {
  .detail-hero {
    grid-template-columns: 1fr auto;
  }

  .hero-metrics {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, 1fr);
  }

  .outfit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .city-info-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .detail-hero {
    grid-template-columns: 1fr;
  }

  .hero-temperature {
    justify-items: start;
  }

  .outfit-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
