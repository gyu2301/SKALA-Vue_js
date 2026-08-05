<script setup>
/**
 * [실습 8 - Element Plus 검색 UI]
 * 기존 native input/button을 ElInput의 prefix·append 슬롯과 ElButton으로 교체했다.
 * clearable, large size, disabled 상태를 라이브러리 속성으로 처리하며 기존 v-model 검색 로직은 유지한다.
 */
// v-model.trim.lazy="searchQuery" 로 부모(WeatherParent)와 진짜 v-model 을 맺는다.
// defineModel 은 modelModifiers 를 두 번째 반환값으로 노출하므로, 그 값을 직접 해석해서
// trim / lazy 를 수동으로 구현한다. (네이티브 <input> 이 아니라 커스텀 컴포넌트라
// 이 모디파이어들이 자동 적용되지 않는다.)
import { ref, watch } from 'vue'

const [searchQuery, modifiers] = defineModel({ type: String, required: true })

const emit = defineEmits(['select-first'])

// 입력창에 실제로 보이는 값. 타이핑 중에는 trim을 적용하지 않아야 스페이스바가
// 눌리는 즉시 지워지지 않는다(예전에는 매 keystroke마다 trim된 값을 model-value로
// 되돌려 보내서 방금 입력한 공백이 렌더링에서 사라졌다).
const displayValue = ref(searchQuery.value)

// 부모가 searchQuery를 외부에서 바꾸는 경우(예: "대시보드로 돌아가기" 초기화)에도
// 입력창 표시값을 함께 맞춘다.
watch(searchQuery, (value) => {
  if (value !== displayValue.value) displayValue.value = value
})

// lazy 모디파이어: 타이핑 중(input)에는 로컬 표시값만 갱신하고, blur/change 시점에만
// trim된 값을 실제 v-model(searchQuery)로 커밋한다.
const commit = () => {
  const next = modifiers.trim ? displayValue.value.trim() : displayValue.value
  displayValue.value = next
  searchQuery.value = next
}

const handleInput = (value) => {
  displayValue.value = value
}

const handleChange = () => {
  commit()
}

// Enter 는 "지금 입력값으로 검색해줘"라는 명시적 커밋 의도이므로,
// lazy 라서 아직 반영 안 된 값이 있어도 select-first 이전에 강제로 flush 한다.
//
// isComposing 가드: 한글/일본어 등 IME로 조합 중인 마지막 글자를 확정하려고 누른 Enter도
// keyup.enter 로 감지된다. 이 경우를 그대로 처리하면 "조합 확정용 Enter"와 "그다음 실제
// 제출용 Enter"가 겹쳐서 select-first 가 두 번 emit 되어(예: 도시 검색이 중복 실행됨) 버린다.
// event.isComposing 이 true 인 시점의 Enter는 무시하고, 조합이 끝난 뒤의 Enter만 처리한다.
// (이 버그의 전체 원인/해결 기록은 @/stores/weatherStore.js 의 pendingSearches 위 주석 참고)
const handleEnter = (event) => {
  if (event.isComposing) return
  commit()
  emit('select-first')
}

// "도시 찾기" 버튼도 blur 없이 바로 눌릴 수 있으므로 emit 전에 먼저 커밋해야 한다.
const submitSearch = () => {
  commit()
  emit('select-first')
}

const handleReset = () => {
  displayValue.value = ''
  searchQuery.value = ''
}
</script>

<template>
  <div class="search-row">
    <!--
      v-model.trim.lazy 적용: 타이핑 도중(input)에는 반영하지 않고 포커스 아웃(change)
      시점에만 searchQuery 를 갱신한다. 한글 IME 조합 중간 상태가 그대로 change 로
      넘어오므로 조합 자체는 깨지지 않지만, 매 keystroke 마다 갱신되던 예전
      (:value + @input) 방식과 달리 필터링/로그가 "포커스를 벗어나거나 Enter 를 누를 때"
      까지 지연된다.
    -->
    <!-- [Element Plus] prefix에 검색 아이콘, append에 도시 찾기 버튼을 배치한 복합 입력창 -->
    <el-input
      :model-value="displayValue"
      size="large"
      clearable
      placeholder="도시 이름을 입력해 보세요. 예) 파리, 도쿄, 제주"
      aria-label="도시 검색"
      @input="handleInput"
      @change="handleChange"
      @clear="handleReset"
      @keyup.enter="handleEnter"
    >
      <template #prefix><span aria-hidden="true">🔎</span></template>
      <template #append>
        <el-button
          class="search-submit"
          type="primary"
          :disabled="displayValue.length === 0"
          @click="submitSearch"
        >
          도시 찾기
        </el-button>
      </template>
    </el-input>
  </div>

  <p>
    검색 중인 도시: <strong>{{ searchQuery || '(전체)' }}</strong>
  </p>
  <!-- [안내 멘트] OpenWeatherMap Geocoding은 한글 도시명 부분 일치를 지원하지 않아
       CITY_DIRECTORY 밖의 도시는 한국어로 찾히지 않는 경우가 있다(예: weatherStore.js의
       searchByGeocoding 주석 참고). 검색 전에 미리 영어 재시도를 안내한다. -->
  <p class="search-hint">💡 한국어로 검색해도 안 나오면 영어 도시명(예: Tokyo, Paris)으로 다시 검색해 보세요.</p>
</template>

<style scoped>
.search-row {
  width: 100%;
  margin-bottom: 9px;
}

.search-row :deep(.el-input) {
  width: 100%;
}

.search-row :deep(.el-input-group__append) {
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0 11px 11px 0;
  background: var(--el-color-primary);
  box-shadow: none;
}

.search-row :deep(.search-submit) {
  width: 104px;
  height: 40px;
  min-height: 40px;
  padding: 0 16px;
  margin: 0;
  border: 0;
  border-radius: 0;
  color: #fff;
  font-weight: 750;
}

.search-row :deep(.search-submit:hover),
.search-row :deep(.search-submit:focus) {
  color: #fff;
  background: var(--el-color-primary-dark-2);
}

.search-row :deep(.search-submit.is-disabled) {
  color: #a8abb2;
  background: #f2f4f7;
}

p {
  margin: 0;
  color: #667085;
  font-size: 12px;
}

p strong {
  color: #087a55;
  font-weight: 750;
}

.search-hint {
  margin-top: 4px;
  color: #98a2b3;
}

@media (max-width: 420px) {
  .search-row :deep(.search-submit) {
    width: 88px;
    padding-inline: 10px;
    font-size: 12px;
  }
}
</style>
