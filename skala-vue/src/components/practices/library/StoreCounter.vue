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
  padding: 16px;
  border: 1px solid #d6eee5;
  border-radius: 11px;
  background: #f5fbf9;
}
.store-counter p {
  margin: 0;
  color: #344054;
}
.store-counter button {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: #087a55;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.store-counter button:hover {
  background: #075d42;
}
</style>
