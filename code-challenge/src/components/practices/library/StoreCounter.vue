<script setup>
import { useCounterStore } from '@/stores/counter.js'
import { useCartStore } from '@/stores/cart.js'
import { useLearningStore } from '@/stores/learning.js'

const counterStore = useCounterStore()

// [과제 확장 - 이커머스] 실전형 스토어 예시: useCartStore는 여러 컴포넌트가 공유하는 전역 상태다.
// 12번 Element Plus 챌린지의 이커머스 카드에서 상품을 담으면 이 화면에도 실시간으로 반영된다.
const cartStore = useCartStore()
const dashboardStore = useLearningStore()

// [과제 확장 - 이커머스] 12번 UI 라이브러리 챌린지(상품을 실제로 담는 화면)로 바로 이동하는 버튼용 핸들러
const goToEcommerceChallenge = () => {
  dashboardStore.selectChallenge(12)
}
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

    <div class="cart-preview">
      <div class="cart-preview-title">
        <div>
          <h3>실전형 스토어 예시 — useCartStore</h3>
          <p>도메인 상태(장바구니)를 다루는 액션·게터 예시입니다. 12번 UI 라이브러리 챌린지에서 상품을 담으면 여기 실시간으로 반영됩니다.</p>
        </div>
        <div class="cart-preview-actions">
          <span>🛒 SHARED STATE</span>
          <!-- [과제 확장 - 이커머스] 이 상태를 실제로 채울 수 있는 12번 UI 라이브러리 챌린지로 바로 이동하는 버튼 -->
          <button type="button" class="cross-link-button" @click="goToEcommerceChallenge">🛍️ 이커머스 카탈로그에서 담아보기 →</button>
        </div>
      </div>

      <div class="state-cards">
        <div>
          <span>GETTER · totalCount</span>
          <strong>{{ cartStore.totalCount }}</strong>
        </div>
        <div>
          <span>GETTER · totalPrice</span>
          <strong>${{ cartStore.totalPrice.toFixed(2) }}</strong>
        </div>
        <div>
          <span>GETTER · isEmpty</span>
          <strong>{{ cartStore.isEmpty ? 'true' : 'false' }}</strong>
        </div>
      </div>

      <p v-if="cartStore.isEmpty" class="cart-empty-note">아직 담긴 상품이 없습니다. UI 라이브러리 챌린지에서 상품을 담아보세요.</p>
      <ul v-else class="cart-item-list">
        <li v-for="item in cartStore.items" :key="item.id">
          <span>{{ item.title }}</span>
          <b>{{ item.qty }}개</b>
        </li>
      </ul>

      <button type="button" :disabled="cartStore.isEmpty" @click="cartStore.clearCart">clearCart() action 실행 — 장바구니 비우기</button>
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

.cart-preview {
  padding: 18px;
  margin-top: 20px;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  background: #f9fafb;
}

.cart-preview-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.cart-preview-title h3 {
  margin: 0;
  color: #344054;
  font-size: 15px;
}

.cart-preview-title p {
  margin: 4px 0 0;
  color: #667085;
  font-size: 12px;
}

.cart-preview-actions {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.cart-preview-actions > span {
  padding: 6px 10px;
  border: 1px solid #d6eee5;
  border-radius: 999px;
  background: #effaf6;
  color: #087a55;
  font-size: 10px;
  font-weight: 800;
}

.cross-link-button {
  padding: 7px 12px;
  border: 1px solid #d6eee5;
  border-radius: 999px;
  background: #effaf6;
  color: #087a55;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease;
}

.cross-link-button:hover {
  background: #e3f8ee;
}

.cart-preview .state-cards {
  margin: 16px 0;
}

.cart-empty-note {
  padding: 12px;
  border: 1px dashed #d0d5dd;
  border-radius: 10px;
  color: #667085;
  font-size: 12px;
  text-align: center;
}

.cart-item-list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0 0 14px;
  list-style: none;
}

.cart-item-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background: white;
  color: #475467;
  font-size: 12px;
}

.cart-item-list b {
  color: #344054;
}

.cart-preview > button {
  width: 100%;
}

@media (max-width: 650px) {
  .state-cards {
    grid-template-columns: 1fr;
  }

  .cart-preview-title {
    flex-direction: column;
  }

  .cart-preview-actions {
    align-items: flex-start;
    width: 100%;
  }
}
</style>
