<script setup>
/**
 * [실습 8 - Element Plus 선택 UI]
 * 기존 하나의 toggle button을 ElRadioGroup + ElRadioButton으로 교체해
 * 현재 선택된 섭씨/화씨 단위를 더 명확하게 보여준다.
 */
// Navigation Bar 옆에 배치되어 configStore 의 온도 단위(섭씨/화씨)를 토글하는 버튼.
import { useConfigStore } from '@/stores/configStore'
import { computed } from 'vue'

const configStore = useConfigStore()

const selectedUnit = computed({
  get: () => configStore.unit,
  set: (value) => {
    if (value !== configStore.unit) configStore.toggleUnit()
  },
})
</script>

<template>
  <!-- Pinia의 unit 값과 ElRadioGroup을 양방향 computed로 연결한다. -->
  <el-radio-group v-model="selectedUnit" size="small" aria-label="온도 단위">
    <el-radio-button value="celsius">℃</el-radio-button>
    <el-radio-button value="fahrenheit">℉</el-radio-button>
  </el-radio-group>
</template>

<style scoped>
:deep(.el-radio-button__inner) {
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 800;
}
</style>
