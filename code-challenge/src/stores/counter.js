import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const step = ref(1)
  const actionCount = ref(0)
  const lastAction = ref('아직 실행한 action이 없습니다.')

  const doubleCount = computed(() => count.value * 2)
  const parity = computed(() => (count.value % 2 === 0 ? '짝수' : '홀수'))

  function normalizeStep() {
    step.value = Math.max(1, Math.trunc(Number(step.value)) || 1)
  }

  function increment() {
    normalizeStep()
    count.value += step.value
    actionCount.value++
    lastAction.value = `increment action: ${step.value}만큼 증가`
  }

  function decrement() {
    normalizeStep()
    count.value = Math.max(0, count.value - step.value)
    actionCount.value++
    lastAction.value = `decrement action: ${step.value}만큼 감소`
  }

  function reset() {
    count.value = 0
    actionCount.value++
    lastAction.value = 'reset action: count를 0으로 초기화'
  }

  return {
    count,
    step,
    actionCount,
    lastAction,
    doubleCount,
    parity,
    normalizeStep,
    increment,
    decrement,
    reset,
  }
})
