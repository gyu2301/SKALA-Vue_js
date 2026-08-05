import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// [과제 확장 - 이커머스] 숫자 하나만 다루는 counter.js와 달리, 실무형 도메인 상태(장바구니)를
// 액션·게터로 다루는 예시. 10번 Pinia 챌린지와 12번 Element Plus 챌린지 화면이 이 스토어를 함께 공유한다.
export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0))
  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.price * item.qty, 0))
  const isEmpty = computed(() => items.value.length === 0)

  function addItem(product) {
    const existing = items.value.find((item) => item.id === product.id)

    if (existing) {
      existing.qty += 1
      return
    }

    items.value.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      qty: 1,
    })
  }

  function removeItem(id) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function updateQty(id, qty) {
    const target = items.value.find((item) => item.id === id)
    if (!target) return

    if (qty < 1) {
      removeItem(id)
      return
    }

    target.qty = qty
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    isEmpty,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  }
})
