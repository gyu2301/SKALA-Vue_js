<script setup>
/**
 * Vue.js 종합실습과제 1 : 날씨 Mockup (Day 1 + Day 2 + Component 분리)
 * ------------------------------------------------------------------------
 * 기존 WeatherMockup.vue 단일 컴포넌트를 기능 변경 없이 4개로 분리했다.
 *   - WeatherParent (본 파일)  : 모든 반응형 데이터와 이벤트 핸들러를 그대로 보유
 *   - BaseDashboardCard        : 검색박스/리스트박스 공통 디자인 + <slot>
 *   - SearchBar                : v-model.trim.lazy(defineModel)로 검색어 양방향 바인딩 / select-first 이벤트(emits)
 *   - WeatherCard               : 도시 카드 표시(props) / select-card, click-detail 이벤트(emits)
 *
 * SearchBar, WeatherCard는 시각적으로는 BaseDashboardCard의 <slot> 안에 위치하지만,
 * <slot> 콘텐츠는 부모(WeatherParent)의 스코프에서 컴파일/평가되므로
 * 아래처럼 WeatherParent에서 직접 props를 내려주고 이벤트를 받을 수 있다.
 * ------------------------------------------------------------------------
 */
import { ref, watch } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import { useWeatherSearch } from '@/composables/useWeatherSearch'

/* ─── 1. Mock 데이터 + 검색 ────────────────────────────────────── */
// weatherList / searchQuery / filteredWeatherList 는 useWeatherSearch 로 추출해 재사용 가능하게 했다.
const { searchQuery, filteredWeatherList } = useWeatherSearch()

/* ─── 2. 화면 상태 ─────────────────────────────────────────────── */
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

// SearchBar 에서 Enter(select-first)를 누르면 검색 결과 중 첫 번째 도시를 자동 선택
const selectFirstMatch = () => {
  if (filteredWeatherList.value.length > 0) selectCity(filteredWeatherList.value[0])
}

// 상태바 문구가 바뀔 때마다 이전/이후 값을 로그로 남긴다.
// immediate: true 라서 마운트 직후에도 한 번 실행되는데, 이때는 "이전 값"이 없으므로
// oldInfo 가 undefined 로 넘어온다.
watch(
  selectedCityInfo,
  (newInfo, oldInfo) => {
    console.log('[watch] selectedCityInfo 변경:', oldInfo ?? '(마운트 직후, 이전값 없음)', '→', newInfo)
  },
  { immediate: true },
)
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- ═══════════ 검색 영역 ═══════════ -->
    <BaseDashboardCard title="도시 검색">
      <SearchBar v-model.trim.lazy="searchQuery" @select-first="selectFirstMatch" />

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
      <!--
        header 슬롯 커스터마이징 예시: title 뒤에 현재 검색된 도시 개수를 붙여서 보여준다.
        이 슬롯 콘텐츠는 WeatherParent 스코프에서 컴파일되므로 BaseDashboardCard 의
        scoped 스타일(.dashboard-card h3)이 적용되지 않는다. 그래서 card-title 클래스로
        같은 스타일을 여기서 다시 정의했다.
      -->
      <template #header="{ title }">
        <h3 class="card-title">{{ title }} <span class="result-count">({{ filteredWeatherList.length }})</span></h3>
      </template>

      <!-- .self : 카드가 아니라 그리드의 빈 여백을 '직접' 눌렀을 때만 발동 -->
      <div class="weather-grid" @click.self="clearSelection">
        <!--
          v-memo="[city.id === selectedCityId]": 이 카드의 선택 여부가 이전 렌더와 같으면
          해당 서브트리의 vnode 비교/패치를 건너뛴다. (city.temp/status 는 목데이터라 안 바뀌므로
          의존성 배열에서 제외했다.)
        -->
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          v-memo="[city.id === selectedCityId]"
          :city="city"
          :is-selected="city.id === selectedCityId"
          @select-card="selectCity"
          @click-detail="showDetail"
        >
          <!-- detail-button 슬롯 커스터마이징 예시: 기본 버튼 대신 텍스트 링크로 대체 -->
          <template #detail-button="{ onDetail }">
            <button class="link-detail" @click="onDetail">자세히 보기 →</button>
          </template>
        </WeatherCard>
      </div>

      <!-- footer 슬롯 커스터마이징 예시: 검색 결과가 0건일 때만 안내 문구를 카드 하단에 출력 -->
      <template #footer>
        <p v-if="filteredWeatherList.length === 0" class="empty-message">
          '{{ searchQuery }}'와 일치하는 도시가 없습니다. 다른 이름으로 검색해 보세요.
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

/* WeatherCard의 detail-button 슬롯 커스터마이징: 기본 버튼 대신 텍스트 링크 */
.link-detail {
  display: block;
  margin-top: 10px;
  padding: 0;
  background: none;
  border: none;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
.link-detail:hover {
  color: #1b5e20;
}

/* header 슬롯 커스터마이징: BaseDashboardCard 의 h3 스타일을 그대로 재현 */
.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
}
.result-count {
  font-weight: 400;
  color: #868e96;
  font-size: 0.85em;
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
