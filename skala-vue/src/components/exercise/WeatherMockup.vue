<script setup>
/**
 * Vue.js 종합실습과제 1 : 날씨 Mockup (Day 1, 일부 Day 2 반영)
 * ------------------------------------------------------------------------
 * [기본 요구사항]
 *   1) v-for + :key         → 날씨 카드 반복 렌더링
 *   2) v-if / v-else        → 기온 25도 기준 라벨 분기
 *   3) :value + @input      → 한글 검색어 양방향 처리
 *   4) @click / @click.stop → 카드 선택 및 버블링 차단 상세보기
 *
 * [추가 구현] 1일차에 배운 문법 범위 안에서 자율 확장
 *   ① 실시간 검색 필터링       : <template v-for> + v-if
 *   ② 선택 카드 하이라이트      : :class 객체 바인딩
 *   ③ 기온 게이지 바           : :style 객체 바인딩
 *   ④ 도움말 패널 토글         : v-show (v-if 와의 선택 근거는 template 주석 참고)
 *   ⑤ 키보드 단축키            : @keyup.enter / @keyup.esc
 *   ⑥ 여백 클릭 시 선택 해제    : @click.self
 *   ⑦ 초기화 버튼 활성 제어     : :disabled 바인딩
 *   ⑧ 정적 안내문 렌더 최적화   : v-once
 *   ⑨ 신규 스타일 격리         : <style scoped>
 *   ⑩ 검색 결과 없음 판정       : computed (Day 2 문법으로 리팩터링)
 * ------------------------------------------------------------------------
 */
import { ref, computed } from 'vue'

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
const selectedCityId = ref('') //  [추가] 하이라이트 대상 식별자
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const isHelpOpen = ref(false) //  [추가] 도움말 패널 개폐 상태

// 기준 온도를 상수로 빼두면 25 → 27 로 바뀌어도 한 곳만 고치면 된다.
const HOT_THRESHOLD = 25
// 게이지 환산 상한(℃). 이 값을 100% 로 보고 막대 길이를 계산한다.
const GAUGE_MAX_TEMP = 40

/* ─── 3. 이벤트 핸들러 ─────────────────────────────────────────── */

// 카드 선택. 갱신할 상태가 2개라 인라인 대신 함수로 분리했다.
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

// [추가] 카드가 아닌 리스트 여백을 '직접' 눌렀을 때만 선택 해제
const clearSelection = () => {
  selectedCityId.value = ''
  selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
}

// 상세보기. 인자를 (이름, 상태)로 나열하는 대신 도시 객체 하나만 받도록 했다.
// 표시 항목이 늘어나도 함수 시그니처를 고치지 않아도 된다.
// 브라우저 기본 alert() 은 디자인을 입힐 수 없어서, 같은 톤의 패널로 대체했다.
const detailCity = ref(null)
const showDetail = (city) => {
  detailCity.value = city
}
const closeDetail = () => {
  detailCity.value = null
}

// :value + @input 조합이 곧 v-model 의 내부 동작이다.
const updateQuery = (event) => {
  searchQuery.value = event.target.value
}

// [추가] Esc 키와 초기화 버튼이 함께 쓰는 핸들러
const resetQuery = () => {
  searchQuery.value = ''
}

// [추가] 검색어 포함 여부. 앞뒤 공백은 잘라내고 비교한다.
const isMatched = (city) => city.name.includes(searchQuery.value.trim())

// [추가] 필터 결과가 0건인지 판정
// searchQuery, weatherList 에 의존하는 파생값이라 computed 로 캐싱한다.
const hasNoResult = computed(() => weatherList.value.every((city) => !isMatched(city)))

// [추가] Enter 를 누르면 검색 결과 중 첫 번째 도시를 자동 선택
const selectFirstMatch = () => {
  const matched = weatherList.value.filter(isMatched)
  if (matched.length > 0) selectCity(matched[0])
}

// [추가] 기온을 막대 길이(%)와 색상으로 표현한다.
const gaugeStyle = (temp) => {
  const ratio = Math.min(Math.max(temp / GAUGE_MAX_TEMP, 0), 1)
  return {
    width: `${Math.round(ratio * 100)}%`,
    backgroundColor: temp >= HOT_THRESHOLD ? '#ff7675' : '#74b9ff',
  }
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- ═══════════ 검색 영역 ═══════════ -->
    <section class="search-box">
      <h3>도시 검색</h3>

      <div class="search-row">
        <!--
          한글은 자음·모음이 조합되는 IME 입력이라 v-model 대신
          :value + @input 을 직접 엮어 조합 과정을 그대로 반영한다.
        -->
        <input
          type="text"
          :value="searchQuery"
          @input="updateQuery"
          @keyup.enter="selectFirstMatch"
          @keyup.esc="resetQuery"
          placeholder="도시 이름 입력 (Enter: 첫 결과 선택 / Esc: 초기화)"
        />
        <!-- [추가] 검색어가 없으면 누를 이유가 없으므로 비활성화 -->
        <button class="btn-ghost" :disabled="searchQuery.length === 0" @click="resetQuery">
          초기화
        </button>
      </div>

      <p>
        검색 중인 도시: <strong>{{ searchQuery || '(전체)' }}</strong>
      </p>

      <button class="btn-ghost" @click="isHelpOpen = !isHelpOpen">
        {{ isHelpOpen ? '▲ 도움말 접기' : '▼ 도움말 펼치기' }}
      </button>

      <!--
        [추가] v-show 선택 이유
        도움말은 사용자가 자주 여닫는 영역이다. v-if 로 만들면 토글할 때마다
        DOM 을 부수고 다시 짓지만, v-show 는 display 속성만 바꾸므로 더 가볍다.
        (반대로 아래 '검색 결과 없음'은 평소엔 나타나지 않는 예외 상태라 v-if 로 처리했다.)
      -->
      <div v-show="isHelpOpen" class="help-panel">
        <!-- [추가] 절대 바뀌지 않는 문구라 v-once 로 감시 대상에서 제외 -->
        <p v-once>· 카드를 클릭하면 하단 상태바에 선택한 도시가 표시됩니다.</p>
        <p v-once>· [상세보기]는 카드 선택 없이 상세 정보 패널만 띄웁니다. (버블링 차단)</p>
        <p v-once>· 카드 바깥 여백을 클릭하면 선택이 해제됩니다.</p>
      </div>
    </section>

    <!-- ═══════════ 목록 영역 ═══════════ -->
    <section class="list-box">
      <h3>지역별 날씨 현황</h3>

      <!-- [추가] .self : 카드가 아니라 그리드의 빈 여백을 '직접' 눌렀을 때만 발동 -->
      <div class="weather-grid" @click.self="clearSelection">
        <!--
          [추가] Vue 3 는 같은 태그에서 v-if 를 v-for 보다 먼저 평가하므로 <div v-for v-if> 로 쓰면 반복 변수를 읽지 못한다.
          (ESLint 규칙 vue/no-use-v-if-with-v-for 위반)
          그래서 <template v-for> 로 감싸고 안쪽 카드에 v-if 를 걸었다.
        -->
        <template v-for="city in weatherList" :key="city.id">
          <div
            v-if="isMatched(city)"
            class="weather-card"
            :class="{ 'is-selected': city.id === selectedCityId }"
            :title="`${city.name}의 현재 상태: ${city.status}`"
            @click="selectCity(city)"
          >
            <h4>{{ city.name }} ({{ city.status }})</h4>
            <p>현재 기온: {{ city.temp }}°C</p>

            <span v-if="city.temp >= HOT_THRESHOLD" class="badge hot">더움 (25도 이상)</span>
            <span v-else class="badge cool">선선함 (25도 미만)</span>

            <!-- [추가] 기온을 한눈에 비교할 수 있는 게이지 -->
            <div class="gauge-track">
              <div class="gauge-fill" :style="gaugeStyle(city.temp)"></div>
            </div>

            <!-- .stop으로 부모 카드의 @click 까지 함께 실행되는걸 방지 -->
            <button class="btn-detail" @click.stop="showDetail(city)">상세보기</button>
          </div>
        </template>
      </div>

      <p v-if="hasNoResult" class="empty-message">
        '{{ searchQuery }}'와 일치하는 도시가 없습니다. 다른 이름으로 검색해 보세요.
      </p>
    </section>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>

  <!-- [추가] 상세보기 패널. 브라우저 기본 alert() 대신 같은 톤으로 디자인된 오버레이를 쓴다. -->
  <Teleport to="body">
    <Transition name="veil">
      <div v-if="detailCity" class="detail-backdrop" @click.self="closeDetail">
        <div
          class="detail-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="`${detailCity.name} 상세 정보`"
        >
          <button class="detail-close" type="button" @click="closeDetail" aria-label="닫기">
            ×
          </button>
          <p class="detail-eyebrow">현재 날씨</p>
          <h4 class="detail-city">{{ detailCity.name }}</h4>
          <p class="detail-temp">{{ detailCity.temp }}<span class="unit">°C</span></p>
          <span class="badge" :class="detailCity.temp >= HOT_THRESHOLD ? 'hot' : 'cool'">
            {{ detailCity.status }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 검색창 + 초기화 버튼 가로 배치 */
.search-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
.search-row input {
  flex: 1;
  width: auto;
}

/* 보조 버튼 */
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
.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

/* 기온 게이지 */
.gauge-track {
  height: 6px;
  margin-top: 10px;
  background: #eef1f4;
  border-radius: 3px;
  overflow: hidden;
}
.gauge-fill {
  height: 100%;
  border-radius: 3px;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

/* 선택된 카드 강조 (:class 객체 바인딩으로 붙는다) */
.weather-card.is-selected {
  border-color: #2e7d32;
  box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.15);
}

/* 검색 결과 없음 */
.empty-message {
  margin: 8px 0 0;
  padding: 12px 0;
  text-align: center;
  color: #e74c3c;
  font-size: 14px;
}

/* 상세보기 패널 - 브라우저 기본 alert() 대신 같은 톤으로 디자인된 오버레이를 쓴다 */
.detail-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(44, 62, 80, 0.4);
  z-index: 100;
}
.detail-panel {
  position: relative;
  width: 100%;
  max-width: 280px;
  background: #ffffff;
  border-radius: 10px;
  padding: 26px 24px 22px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
}
.detail-close {
  position: absolute;
  top: 8px;
  right: 10px;
  padding: 4px 8px;
  background: none;
  border: none;
  font-size: 18px;
  line-height: 1;
  color: #adb5bd;
  cursor: pointer;
}
.detail-close:hover {
  color: #2c3e50;
}
.detail-eyebrow {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 6px;
}
.detail-city {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px;
}
.detail-temp {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
  line-height: 1;
}
.detail-temp .unit {
  font-size: 1.2rem;
  color: #6c757d;
  margin-left: 2px;
}

.veil-enter-active,
.veil-leave-active {
  transition: opacity 0.15s ease;
}
.veil-enter-active .detail-panel,
.veil-leave-active .detail-panel {
  transition: transform 0.15s ease;
}
.veil-enter-from,
.veil-leave-to {
  opacity: 0;
}
.veil-enter-from .detail-panel,
.veil-leave-to .detail-panel {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .veil-enter-active,
  .veil-leave-active,
  .veil-enter-active .detail-panel,
  .veil-leave-active .detail-panel {
    transition: none;
  }
}
</style>
