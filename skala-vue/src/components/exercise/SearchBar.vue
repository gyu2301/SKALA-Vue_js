<script setup>
// 검색어(searchQuery)는 부모(WeatherParent)의 반응형 데이터를 props 로 전달받아 "표시"만 한다.
// 입력이 바뀌면 값을 들고 있지 않고 update-query 이벤트로 부모에게 그대로 전달한다.
defineProps({
  searchQuery: { type: String, required: true },
})

const emit = defineEmits(['update-query', 'select-first'])

// :value + @input 조합이 곧 v-model 의 내부 동작이다.
const handleInput = (event) => {
  emit('update-query', event.target.value)
}

const handleReset = () => {
  emit('update-query', '')
}
</script>

<template>
  <div class="search-row">
    <!--
      한글은 자음·모음이 조합되는 IME 입력이라 v-model 대신
      :value + @input 을 직접 엮어 조합 과정을 그대로 반영한다.
    -->
    <input
      type="text"
      :value="searchQuery"
      @input="handleInput"
      @keyup.enter="emit('select-first')"
      @keyup.esc="handleReset"
      placeholder="도시 이름 입력 (Enter: 첫 결과 선택 / Esc: 초기화)"
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
