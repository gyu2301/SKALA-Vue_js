<script setup>
/**
 * Vue.js 종합실습과제 1 : 날씨 Mockup (Day 1 + Day 2 + Component 분리)
 * ------------------------------------------------------------------------
 * 기존 WeatherMockup.vue 단일 컴포넌트를 기능 변경 없이 4개로 분리했다.
 *   - WeatherParent (본 파일)  : 모든 반응형 데이터와 이벤트 핸들러를 그대로 보유
 *   - BaseDashboardCard        : 검색박스/리스트박스 공통 디자인 + <slot>
 *   - SearchBar                : 검색어 표시(props) / update-query, select-first 이벤트(emits)
 *   - WeatherCard               : 도시 카드 표시(props) / select-card, click-detail 이벤트(emits)
 *
 * SearchBar, WeatherCard는 시각적으로는 BaseDashboardCard의 <slot> 안에 위치하지만,
 * <slot> 콘텐츠는 부모(WeatherParent)의 스코프에서 컴파일/평가되므로
 * 아래처럼 WeatherParent에서 직접 props를 내려주고 이벤트를 받을 수 있다.
 * ------------------------------------------------------------------------
 */
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

/* ─── 1. Mock 데이터 ───────────────────────────────────────────── */
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '대구', temp: 30, status: '흐림' },
  { id: 'city_05', name: '광주', temp: 27, status: '맑음' },
  { id: 'city_06', name: '울산', temp: 20, status: '구름' },
])

/* ─── 2. 화면 상태 ─────────────────────────────────────────────── */
const searchQuery = ref('')
const selectedCityId = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const isHelpOpen = ref(false)

/* ─── 3. 이벤트 핸들러 ─────────────────────────────────────────── */

// 카드 선택. WeatherCard 의 select-card 이벤트를 받아 처리한다.
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

// 카드가 아닌 리스트 여백을 '직접' 눌렀을 때만 선택 해제
const clearSelection = () => {
  selectedCityId.value = ''
  selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
}

// 상세보기. WeatherCard 의 click-detail 이벤트를 받아 처리한다.
const showDetail = (city) => {
  window.alert(`${city.name}\n현재 기온: ${city.temp}°C\n날씨 상태: ${city.status}`)
}

// searchQuery 로 걸러진 도시 목록.
// name.includes('') 는 항상 true 이므로 검색어가 비어있으면 원본 그대로 반환된다.
const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value.trim())),
)

// SearchBar 에서 Enter(select-first)를 누르면 검색 결과 중 첫 번째 도시를 자동 선택
const selectFirstMatch = () => {
  if (filteredWeatherList.value.length > 0) selectCity(filteredWeatherList.value[0])
}

// 상태바 문구가 바뀔 때마다 이전/이후 값을 로그로 남긴다.
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log('[watch] selectedCityInfo 변경:', oldInfo, '→', newInfo)
})

// 콜백 안에서 읽은 반응형 값(searchQuery)을 자동 추적한다.
// 타이핑할 때마다 즉시 실행된다.
watchEffect(() => {
  console.log('[watchEffect] searchQuery:', searchQuery.value)
})
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- ═══════════ 검색 영역 ═══════════ -->
    <BaseDashboardCard title="도시 검색">
      <SearchBar
        :search-query="searchQuery"
        @update-query="searchQuery = $event"
        @select-first="selectFirstMatch"
      />

      <button class="btn-ghost" @click="isHelpOpen = !isHelpOpen">
        {{ isHelpOpen ? '▲ 도움말 접기' : '▼ 도움말 펼치기' }}
      </button>

      <!--
        v-show 선택 이유
        도움말은 사용자가 자주 여닫는 영역이다. v-if 로 만들면 토글할 때마다
        DOM 을 부수고 다시 짓지만, v-show 는 display 속성만 바꾸므로 더 가볍다.
      -->
      <div v-show="isHelpOpen" class="help-panel">
        <!-- 절대 바뀌지 않는 문구라 v-once 로 감시 대상에서 제외 -->
        <p v-once>· 카드를 클릭하면 하단 상태바에 선택한 도시가 표시됩니다.</p>
        <p v-once>· [상세보기]는 카드 선택 없이 alert 창만 띄웁니다. (버블링 차단)</p>
        <p v-once>· 카드 바깥 여백을 클릭하면 선택이 해제됩니다.</p>
      </div>
    </BaseDashboardCard>

    <!-- ═══════════ 목록 영역 ═══════════ -->
    <BaseDashboardCard title="지역별 날씨 현황">
      <!-- .self : 카드가 아니라 그리드의 빈 여백을 '직접' 눌렀을 때만 발동 -->
      <div class="weather-grid" @click.self="clearSelection">
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city="city"
          :is-selected="city.id === selectedCityId"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
      </div>

      <!-- 검색 결과가 0건일 때만 안내 문구 출력 -->
      <p v-if="filteredWeatherList.length === 0" class="empty-message">
        '{{ searchQuery }}'와 일치하는 도시가 없습니다. 다른 이름으로 검색해 보세요.
      </p>
    </BaseDashboardCard>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  margin: 0 auto;
}

/* 도움말 토글 버튼 (SearchBar 의 초기화 버튼과 동일한 디자인이라 각자 scoped 로 보유) */
.btn-ghost {
  padding: 7px 12px;
  font-size: 13px;
  background: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.btn-ghost:hover:not(:disabled) {
  background: #f1f3f5;
}

/* 도움말 패널 */
.help-panel {
  margin-top: 8px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px dashed #ced4da;
  border-radius: 6px;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.7;
}
.help-panel p {
  margin: 0;
}

/* 갤러리형 카드 그리드. 컨테이너 폭에 맞춰 한 줄에 들어가는 카드 수가 자동으로 늘고 준다 */
.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

/* 검색 결과 없음 */
.empty-message {
  margin: 8px 0 0;
  padding: 12px 0;
  text-align: center;
  color: #e74c3c;
  font-size: 14px;
}

/* 상태바 */
.status-bar {
  background: #e8f5e9;
  padding: 10px;
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  border-radius: 6px;
}
</style>
