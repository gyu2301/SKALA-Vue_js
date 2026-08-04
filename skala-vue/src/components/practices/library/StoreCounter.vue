<script setup>
// Code Challenge 6. Pinia - Store 사용하기 예제.
// stores/counter.js 의 useCounterStore 를 그대로 가져와 count / doubleCount / increment 를 사용한다.
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div class="store-counter">
    <p>Count: {{ counter.count }}</p>
    <p>Double Count: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">Increment</button>
  </div>
</template>

<style scoped>
.store-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.store-counter p {
  margin: 0;
  color: #2c3e50;
}
.store-counter button {
  padding: 8px 14px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.store-counter button:hover {
  background: #2980b9;
}
</style>
