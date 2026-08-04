<script setup>
// v-model.trim.lazy="searchQuery" 로 부모(WeatherParent)와 진짜 v-model 을 맺는다.
// defineModel 은 modelModifiers 를 두 번째 반환값으로 노출하므로, 그 값을 직접 해석해서
// trim / lazy 를 수동으로 구현한다. (네이티브 <input> 이 아니라 커스텀 컴포넌트라
// 이 모디파이어들이 자동 적용되지 않는다.)
const [searchQuery, modifiers] = defineModel({ type: String, required: true })

const emit = defineEmits(['select-first'])

const commitValue = (rawValue) => {
  searchQuery.value = modifiers.trim ? rawValue.trim() : rawValue
}

// lazy 모디파이어가 있으면 input(타이핑 즉시) 대신 change(포커스 아웃) 시점에만 반영한다.
const handleInput = (event) => {
  if (modifiers.lazy) return
  commitValue(event.target.value)
}

const handleChange = (event) => {
  if (!modifiers.lazy) return
  commitValue(event.target.value)
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

  commitValue(event.target.value)
  emit('select-first')
}

const handleReset = () => {
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
    <input
      type="text"
      :value="searchQuery"
      @input="handleInput"
      @change="handleChange"
      @keyup.enter="handleEnter"
      @keyup.esc="handleReset"
      placeholder="도시 이름 입력 (Enter: 첫 결과 선택, 없으면 실시간 검색 / Esc: 초기화)"
    />
    <!-- 검색어가 없으면 누를 이유가 없으므로 비활성화 -->
    <button class="btn-ghost" :disabled="searchQuery.length === 0" @click="handleReset">
      초기화
    </button>
  </div>

  <p>
    검색 중인 도시: <strong>{{ searchQuery || '(전체)' }}</strong>
  </p>
</template>

<style scoped>
.search-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
input {
  padding: 8px 10px;
  width: auto;
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
  background: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 4px;
}
input:focus {
  outline: none;
  border-color: #3498db;
}

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
</style>
