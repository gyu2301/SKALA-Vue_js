<script setup>
import { onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts.js'

// [과제 확장 - 이커머스] useProducts()는 axios.get 호출을 감싼 재사용 가능한 composable이다.
// 12번 UI 라이브러리 챌린지의 상품 카탈로그에서도 동일한 composable을 그대로 가져다 쓴다.
const { products, isLoading, errorMessage, fetchProducts } = useProducts()

onMounted(() => fetchProducts(6))
</script>

<template>
  <div class="practice-section products-practice">
    <div class="json-heading">
      <div>
        <span>DUMMYJSON · REST</span>
        <h2>Axios Product List Example</h2>
        <p>실제 공개 API(dummyjson.com)에서 상품 목록을 GET으로 조회합니다. 이 데이터는 UI 라이브러리 챌린지의 이커머스 카탈로그와 동일한 composable을 공유합니다.</p>
      </div>
      <button type="button" class="reload-button" :disabled="isLoading" @click="fetchProducts(6)">
        {{ isLoading ? '불러오는 중...' : '🔄 GET 다시 실행' }}
      </button>
    </div>

    <p v-if="errorMessage" class="api-error" role="alert">{{ errorMessage }}</p>

    <div v-if="isLoading && products.length === 0" class="loading-state">Axios로 상품 데이터를 불러오는 중입니다...</div>

    <div v-else class="product-preview-grid">
      <article v-for="product in products" :key="product.id" class="product-preview-item">
        <img :src="product.thumbnail" :alt="product.title" loading="lazy" />
        <strong>{{ product.title }}</strong>
        <span>${{ product.price }}</span>
      </article>
    </div>

    <details class="response-preview">
      <summary>Axios 요청 코드 확인</summary>
      <pre><code>axios.get('https://dummyjson.com/products', {
  params: { limit: 6, select: 'id,title,price,thumbnail,discountPercentage,rating,stock' }
})</code></pre>
    </details>
  </div>
</template>

<style scoped>
.json-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.json-heading > div > span {
  color: #7f56d9;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.json-heading h2 {
  margin-top: 3px;
}

.json-heading p {
  margin: 0;
  color: #667085;
}

.reload-button {
  flex: 0 0 auto;
  border-color: #7f56d9;
  background: #7f56d9;
  color: white;
}

.api-error {
  padding: 10px 12px;
  margin-top: 14px;
  border-radius: 8px;
  background: #fff1f3;
  color: #c01048;
  font-size: 13px;
}

.loading-state {
  display: grid;
  min-height: 140px;
  margin-top: 16px;
  border: 1px dashed #d0d5dd;
  border-radius: 12px;
  place-content: center;
  color: #667085;
  text-align: center;
}

.product-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.product-preview-item {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  background: white;
  text-align: center;
}

.product-preview-item img {
  width: 100%;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
}

.product-preview-item strong {
  overflow: hidden;
  color: #344054;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-preview-item span {
  color: #087a55;
  font-size: 13px;
  font-weight: 800;
}

.response-preview {
  margin-top: 18px;
  color: #475467;
  font-size: 13px;
}

.response-preview summary {
  cursor: pointer;
  font-weight: 700;
}

.response-preview pre {
  padding: 13px;
  overflow: auto;
  border-radius: 9px;
  background: #101828;
  color: #d1fadf;
  font-size: 12px;
}

@media (max-width: 680px) {
  .json-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
