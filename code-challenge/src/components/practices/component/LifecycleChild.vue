<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const emit = defineEmits(['lifecycle-event'])
const count = ref(0)
let timerId = null

function emitLifecycle(type, message) {
  emit('lifecycle-event', {
    type,
    message,
    time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
  })
}

onMounted(() => {
  emitLifecycle('onMounted', '컴포넌트가 화면에 부착되고 3초 타이머를 시작했습니다.')

  timerId = setInterval(() => {
    count.value++
  }, 3000)
})

onUpdated(() => {
  emitLifecycle('onUpdated', `count가 ${count.value}(으)로 변경되어 화면을 다시 그렸습니다.`)
})

onUnmounted(() => {
  clearInterval(timerId)
  emitLifecycle('onUnmounted', '컴포넌트가 소멸되어 실행 중인 타이머를 정리했습니다.')
})
</script>

<template>
  <div class="counter-display">
    <span>Reactive State</span>
    <strong>{{ count }}</strong>
    <p>3초마다 자동 증가하며, 값이 변경될 때 onUpdated가 실행됩니다.</p>
    <button type="button" class="primary-action" @click="count++">수동으로 count 증가</button>
  </div>
</template>

<style scoped>
.counter-display {
  display: grid;
  min-height: 200px;
  padding: 22px;
  border: 1px solid #c9eadf;
  border-radius: 12px;
  place-items: center;
  align-content: center;
  background: #effcf7;
  text-align: center;
}

.counter-display > span {
  color: #087a55;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.counter-display strong {
  margin: 4px 0;
  color: #075d42;
  font-size: 52px;
  line-height: 1;
}

.counter-display p {
  margin: 8px 0 18px;
  color: #526b63;
  font-size: 13px;
}
</style>
