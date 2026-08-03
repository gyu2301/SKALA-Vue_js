<script setup>
/**
 * Vue.js 종합실습과제 1 : 날씨 Mockup (Day 1 + Day 2)
 * ------------------------------------------------------------------------
 * [기본 요구사항]
 *   1) v-for + :key         → 날씨 카드 반복 렌더링
 *   2) v-if / v-else        → 기온 25도 기준 라벨 분기
 *   3) :value + @input      → 한글 검색어 양방향 처리
 *   4) @click / @click.stop → 카드 선택 및 버블링 차단 상세보기
 *
 * [추가 구현] 1일차에 배운 문법 범위 안에서 자율 확장
 *   ① 선택 카드 하이라이트      : :class 객체 바인딩
 *   ② 기온 게이지 바           : :style 객체 바인딩
 *   ③ 도움말 패널 토글         : v-show (v-if 와의 선택 근거는 template 주석 참고)
 *   ④ 키보드 단축키            : @keyup.enter / @keyup.esc
 *   ⑤ 여백 클릭 시 선택 해제    : @click.self
 *   ⑥ 초기화 버튼 활성 제어     : :disabled 바인딩
 *   ⑦ 정적 안내문 렌더 최적화   : v-once
 *   ⑧ 신규 스타일 격리         : <style scoped>
 *
 * [Day 2 변경사항] computed / watch / watchEffect 도입
 *   ① filteredWeatherList (computed)
 *      - 기존엔 템플릿에서 <template v-for> + v-if="isMatched(city)" 로
 *        "반복하면서 걸러내는" 방식이었다.
 *      - 이를 걷어내고, searchQuery 로 걸러진 결과를 미리 계산해두는
 *        computed 배열로 교체했다. 템플릿은 이제 필터링 결과만 그대로 v-for.
 *      - 검색어가 비어 있으면 모든 name.includes('') === true 이므로
 *        원본 목록이 그대로 반환된다 → "검색어 없을 때 원본 출력" 요구사항을
 *        별도 분기 없이 자연스럽게 만족.
 *   ② 기존 isMatched() / hasNoResult computed 는 제거
 *      - "결과 없음" 판정은 filteredWeatherList.length === 0 으로 대체.
 *      - selectFirstMatch() 도 filteredWeatherList 를 직접 참조하도록 변경.
 *   ③ watch(selectedCityInfo) 추가
 *      - 상태바 문구(selectedCityInfo)가 바뀔 때마다 콘솔 로그 출력.
 *      - watchEffect 대신 watch 를 쓴 이유: 이전 값(oldVal)과 새 값(newVal)을
 *        둘 다 비교해서 로그로 남기고 싶었고, 감시 대상도 selectedCityInfo
 *        하나로 명확하기 때문 (watch 는 감시 대상을 명시적으로 지정).
 *   ④ watchEffect(searchQuery 추적) 추가
 *      - 콜백 안에서 searchQuery.value 를 읽는 순간 자동으로 의존성 등록.
 *      - 타이핑할 때마다(=searchQuery 가 바뀔 때마다) 즉시 콘솔 로그.
 * ------------------------------------------------------------------------
 */
import { ref, computed, watch, watchEffect } from 'vue'

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
const showDetail = (city) => {
  window.alert(`${city.name}\n현재 기온: ${city.temp}°C\n날씨 상태: ${city.status}`)
}

// :value + @input 조합이 곧 v-model 의 내부 동작이다.
const updateQuery = (event) => {
  searchQuery.value = event.target.value
}

// [추가] Esc 키와 초기화 버튼이 함께 쓰는 핸들러
const resetQuery = () => {
  searchQuery.value = ''
}

// [Day 2] searchQuery 로 걸러진 도시 목록.
// name.includes('') 는 항상 true 이므로 검색어가 비어있으면 원본 그대로 반환된다.
const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value.trim())),
)

// [추가] Enter 를 누르면 검색 결과 중 첫 번째 도시를 자동 선택
const selectFirstMatch = () => {
  if (filteredWeatherList.value.length > 0) selectCity(filteredWeatherList.value[0])
}

// [Day 2] 상태바 문구가 바뀔 때마다 이전/이후 값을 로그로 남긴다.
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log('[watch] selectedCityInfo 변경:', oldInfo, '→', newInfo)
})

// [Day 2] 콜백 안에서 읽은 반응형 값(searchQuery)을 자동 추적한다.
// 타이핑할 때마다 즉시 실행된다.
watchEffect(() => {
  console.log('[watchEffect] searchQuery:', searchQuery.value)
})

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
        <p v-once>· [상세보기]는 카드 선택 없이 alert 창만 띄웁니다. (버블링 차단)</p>
        <p v-once>· 카드 바깥 여백을 클릭하면 선택이 해제됩니다.</p>
      </div>
    </section>

    <!-- ═══════════ 목록 영역 ═══════════ -->
    <section class="list-box">
      <h3>지역별 날씨 현황</h3>

      <!-- [추가] .self : 카드가 아니라 그리드의 빈 여백을 '직접' 눌렀을 때만 발동 -->
      <!-- [Day 2] weatherList 대신 computed 로 미리 걸러둔 filteredWeatherList 를 순회한다.
           v-if 로 카드마다 다시 걸러낼 필요가 없어져 <template v-for> 래퍼도 함께 제거했다. -->
      <div class="weather-grid" @click.self="clearSelection">
        <div
          v-for="city in filteredWeatherList"
          :key="city.id"
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
      </div>

      <!-- [Day 2] 검색 결과가 0건일 때만 안내 문구 출력 -->
      <p v-if="filteredWeatherList.length === 0" class="empty-message">
        '{{ searchQuery }}'와 일치하는 도시가 없습니다. 다른 이름으로 검색해 보세요.
      </p>
    </section>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
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
</style>
