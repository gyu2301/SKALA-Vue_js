import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 대시보드 전역에서 공유하는 날씨 단위(섭씨/화씨) 설정 스토어.
export const useConfigStore = defineStore('config', () => {
  const unit = ref('celsius') // 초기값: celsius

  const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})
