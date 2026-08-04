<script setup>
import { useCounterStore } from '@/stores/counter.js'

const counterStore = useCounterStore()
</script>

<template>
  <div class="practice-section counter-practice">
    <div class="counter-title">
      <div>
        <h2>Pinia Counter Store</h2>
        <p>state, getters, actions의 변화를 Vue Devtools에서도 확인해 보세요.</p>
      </div>
      <span>🍍 PINIA</span>
    </div>

    <div class="state-cards">
      <div>
        <span>STATE · count</span>
        <strong>{{ counterStore.count }}</strong>
      </div>
      <div>
        <span>GETTER · doubleCount</span>
        <strong>{{ counterStore.doubleCount }}</strong>
      </div>
      <div>
        <span>GETTER · parity</span>
        <strong>{{ counterStore.parity }}</strong>
      </div>
    </div>

    <div class="counter-control">
      <label>
        <span>한 번에 변경할 값</span>
        <input v-model.number="counterStore.step" type="number" min="1" @blur="counterStore.normalizeStep" />
      </label>

      <div class="action-buttons">
        <button type="button" :disabled="counterStore.count === 0" @click="counterStore.decrement">− {{ counterStore.step }} 감소</button>
        <button type="button" class="primary-action" @click="counterStore.increment">+ {{ counterStore.step }} 증가</button>
        <button type="button" :disabled="counterStore.count === 0" @click="counterStore.reset">0으로 초기화</button>
      </div>
    </div>

    <div class="action-log">
      <span>ACTION LOG · 총 {{ counterStore.actionCount }}회 실행</span>
      <p>{{ counterStore.lastAction }}</p>
    </div>
  </div>
</template>

<style scoped>
.counter-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.counter-title p {
  margin: 0;
  color: #667085;
}

.counter-title > span {
  padding: 7px 11px;
  border: 1px solid #dfd5ff;
  border-radius: 999px;
  background: #f4f0ff;
  color: #6941c6;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.state-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 22px 0;
}

.state-cards > div {
  display: grid;
  min-height: 120px;
  padding: 16px;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  align-content: center;
  background: #f9fafb;
  text-align: center;
}

.state-cards span,
.action-log span,
.counter-control label > span {
  color: #7d899b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.state-cards strong {
  margin-top: 4px;
  color: #344054;
  font-size: 32px;
}

.counter-control {
  padding: 18px;
  border-radius: 12px;
  background: #f4f0ff;
}

.counter-control label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter-control input {
  width: 90px;
  background: white;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.action-log {
  padding: 14px 16px;
  margin-top: 14px;
  border-left: 3px solid #7f56d9;
  background: #faf9ff;
}

.action-log p {
  margin: 4px 0 0;
  color: #475467;
}

@media (max-width: 650px) {
  .state-cards {
    grid-template-columns: 1fr;
  }
}
</style>
