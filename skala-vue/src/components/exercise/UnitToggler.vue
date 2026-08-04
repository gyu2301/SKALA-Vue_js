<script setup>
// Navigation Bar 옆에 배치되어 configStore 의 온도 단위(섭씨/화씨)를 토글하는 버튼.
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <button class="unit-toggle" @click="configStore.toggleUnit">
    🌡️ {{ configStore.unitSymbol }}
  </button>
</template>

<style scoped>
.unit-toggle {
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  color: #495057;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}
.unit-toggle:hover {
  background: #f1f3f5;
}
</style>
