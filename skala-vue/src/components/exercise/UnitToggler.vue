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
  min-width: 54px;
  padding: 7px 10px;
  border: 1px solid #bde2d4;
  border-radius: 9px;
  background: #effaf6;
  color: #087a55;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}
.unit-toggle:hover {
  border-color: #42b883;
  background: #e2f7ef;
  transform: translateY(-1px);
}
</style>
