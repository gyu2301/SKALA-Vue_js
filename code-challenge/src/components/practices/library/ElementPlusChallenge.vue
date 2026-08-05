<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProducts } from '@/composables/useProducts.js'
import { useCartStore } from '@/stores/cart.js'
import { useLearningStore } from '@/stores/learning.js'

// 실습 1. 회원가입 Form & Input 제어
const userForm = ref({
  email: '',
  agree: false,
})

const handleRegister = () => {
  if (!userForm.value.email.includes('@')) {
    ElMessage.error('❌ 올바른 이메일 형식이 아닙니다.')
    return
  }

  if (!userForm.value.agree) {
    ElMessage.warning('⚠️ 이용약관에 동의하셔야 합니다.')
    return
  }

  ElMessage.success('🎉 가입 신청이 정상적으로 완료되었습니다!')
}

// 실습 2. 커머스 상품 수량 및 별점 시스템
const productQuantity = ref(1)
const productRate = ref(4)
const productSummary = computed(() => `선택 수량 ${productQuantity.value}개 / 평가 점수 ${productRate.value}점`)

// 실습 3. 시스템 피드백 & 프로그레스 인터랙션
const downloadProgress = ref(0)
const isDownloading = ref(false)
let downloadTimer = null

const confirmDelete = () => {
  ElMessageBox.confirm('서버에서 해당 파일을 영구히 삭제하시겠습니까?', '🔥 최종 경고', {
    confirmButtonText: '네, 삭제합니다',
    cancelButtonText: '취소',
    type: 'warning',
    confirmButtonType: 'danger',
  })
    .then(() => {
      ElMessage.success('🗑️ 파일이 안전하게 파쇄되었습니다.')
    })
    .catch(() => {
      ElMessage.info('❌ 삭제 작업이 취소되었습니다.')
    })
}

const startDownload = () => {
  if (isDownloading.value) return

  isDownloading.value = true
  downloadProgress.value = 0

  downloadTimer = setInterval(() => {
    downloadProgress.value += 20

    if (downloadProgress.value >= 100) {
      clearInterval(downloadTimer)
      downloadTimer = null
      downloadProgress.value = 100
      isDownloading.value = false
      ElMessage.success('💾 대용량 데이터 로드가 완료되었습니다!')
    }
  }, 400)
}

onUnmounted(() => {
  if (downloadTimer) {
    clearInterval(downloadTimer)
  }
})

// [과제 확장 - 이커머스] 실습 4. 이커머스 상품 카탈로그 & 장바구니
// 상품 데이터는 11번 Axios API 챌린지와 동일한 useProducts composable을 재사용하고,
// 장바구니 상태는 10번 Pinia 챌린지의 useCartStore를 그대로 공유한다 (전역 상태 → 두 화면이 실시간으로 동기화됨).
const { products, isLoading: productsLoading, fetchProducts } = useProducts()
const cartStore = useCartStore()
const dashboardStore = useLearningStore()
const cartDrawerVisible = ref(false)

// [과제 확장 - 이커머스] 10번 Pinia 챌린지로 바로 이동해 같은 장바구니 상태를 확인시켜주는 버튼용 핸들러
const goToCartStoreChallenge = () => {
  dashboardStore.selectChallenge(10)
}

onMounted(() => fetchProducts(6))

const discountedPrice = (product) => (product.price * (1 - product.discountPercentage / 100)).toFixed(2)

const addToCart = (product) => {
  cartStore.addItem(product)
  ElMessage.success(`🛍️ ${product.title}을(를) 장바구니에 담았습니다.`)
}

const handleQtyChange = (id, qty) => {
  cartStore.updateQty(id, qty)
}

const handleRemoveItem = (id) => {
  cartStore.removeItem(id)
  ElMessage.info('장바구니에서 상품을 제거했습니다.')
}

const handleCheckout = () => {
  ElMessageBox.confirm(`총 ${cartStore.totalCount}개 상품, $${cartStore.totalPrice.toFixed(2)}를 결제하시겠습니까?`, '🧾 주문 확인', {
    confirmButtonText: '결제하기',
    cancelButtonText: '취소',
    type: 'info',
  }).then(() => {
    ElMessage.success('🎉 결제가 완료되었습니다! (데모용 – 실제 결제는 이루어지지 않습니다)')
    cartStore.clearCart()
    cartDrawerVisible.value = false
  })
}
</script>

<template>
  <div class="practice-section element-plus-practice">
    <div class="library-heading">
      <div>
        <span>ELEMENT PLUS · UI COMPONENTS</span>
        <h2>UI 라이브러리 Code Challenge</h2>
        <p>Element Plus 컴포넌트와 Vue 반응형 데이터를 결합한 세 가지 인터랙션입니다.</p>
      </div>
      <span class="library-badge">Element Plus</span>
    </div>

    <div class="ui-library-grid">
      <el-card class="challenge-card register-card" shadow="hover">
        <template #header>
          <div class="element-card-header">
            <span class="header-icon green">✉</span>
            <div>
              <strong>실습 1. 회원가입 Form</strong>
              <small>Input · Switch · Message</small>
            </div>
          </div>
        </template>

        <div class="register-form">
          <label for="element-email">이메일 주소</label>
          <el-input id="element-email" v-model.trim="userForm.email" type="email" placeholder="example@email.com" clearable @keyup.enter="handleRegister" />

          <div class="agreement-row">
            <el-switch v-model="userForm.agree" aria-label="개인정보 수집 및 이용약관 동의" />
            <span>개인정보 수집 및 필수 이용약관에 동의합니다.</span>
          </div>

          <el-button type="success" size="large" @click="handleRegister">🚀 회원가입 신청</el-button>
        </div>
      </el-card>

      <el-card class="challenge-card commerce-card" shadow="hover">
        <template #header>
          <div class="element-card-header">
            <span class="header-icon amber">🛒</span>
            <div>
              <strong>실습 2. 커머스 상품 제어</strong>
              <small>InputNumber · Rate</small>
            </div>
          </div>
        </template>

        <div class="commerce-form">
          <div class="control-row">
            <span>구매 수량 선택</span>
            <el-input-number v-model="productQuantity" :min="1" :max="10" />
            <small>최대 10개 구매 가능</small>
          </div>

          <div class="control-row rating-row">
            <span>상품 만족도 별점</span>
            <el-rate v-model="productRate" show-score score-template="{value}점" />
          </div>

          <div class="live-summary">
            <i></i>
            <span>실시간 장부 요약: {{ productSummary }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="challenge-card feedback-card" shadow="hover">
        <template #header>
          <div class="element-card-header">
            <span class="header-icon purple">⚙</span>
            <div>
              <strong>실습 3. 시스템 피드백 & Progress</strong>
              <small>MessageBox · Button · Progress</small>
            </div>
          </div>
        </template>

        <div class="feedback-content">
          <div class="feedback-copy">
            <strong>비동기 작업 제어 패널</strong>
            <p>삭제 확인창과 다운로드 진행률을 통해 즉각적인 시스템 피드백을 제공합니다.</p>
          </div>

          <div class="feedback-actions">
            <el-button type="danger" plain @click="confirmDelete">🗑️ 서버 파일 삭제 테스트</el-button>
            <el-button type="primary" :loading="isDownloading" @click="startDownload">
              {{ isDownloading ? '데이터 동기화 중...' : '💾 데이터 동기화 시작' }}
            </el-button>
          </div>

          <div class="progress-area">
            <el-progress :percentage="downloadProgress" :stroke-width="12" :status="downloadProgress === 100 ? 'success' : ''" striped striped-flow :duration="8" />
            <small>{{ downloadProgress === 100 ? '동기화가 완료되었습니다.' : '버튼을 누르면 게이지가 20%씩 증가합니다.' }}</small>
          </div>
        </div>
      </el-card>

      <el-card class="challenge-card ecommerce-card" shadow="hover">
        <template #header>
          <div class="ecommerce-card-header">
            <div class="element-card-header">
              <span class="header-icon teal">🛍</span>
              <div>
                <strong>실습 4. 이커머스 상품 카탈로그 & 장바구니</strong>
                <small>Image · Tag · Badge · Drawer · Popconfirm (Axios 챌린지와 상품 데이터 공유)</small>
              </div>
            </div>
            <div class="ecommerce-header-actions">
              <!-- [과제 확장 - 이커머스] 이 장바구니는 10번 Pinia 챌린지와 같은 useCartStore를 쓴다는 것을 보여주는 이동 버튼 -->
              <button type="button" class="cross-link-button" @click="goToCartStoreChallenge">🍍 Pinia 스토어에서 실시간으로 보기 →</button>
              <el-badge :value="cartStore.totalCount" :hidden="cartStore.isEmpty">
                <el-button circle size="small" @click="cartDrawerVisible = true">🛒</el-button>
              </el-badge>
            </div>
          </div>
        </template>

        <div v-if="productsLoading && products.length === 0" class="ecommerce-loading">상품을 불러오는 중입니다...</div>

        <div v-else class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <el-image :src="product.thumbnail" :alt="product.title" fit="cover" class="product-image" loading="lazy" />
            <el-tag v-if="product.discountPercentage > 10" type="danger" size="small" class="discount-tag">-{{ Math.round(product.discountPercentage) }}%</el-tag>
            <strong class="product-title">{{ product.title }}</strong>
            <div class="product-price-row">
              <span class="product-price">${{ discountedPrice(product) }}</span>
              <span v-if="product.discountPercentage > 10" class="product-price-original">${{ product.price }}</span>
            </div>
            <el-button type="warning" size="small" @click="addToCart(product)">🛒 담기</el-button>
          </div>
        </div>

        <el-drawer v-model="cartDrawerVisible" title="🛒 장바구니" size="360px">
          <el-empty v-if="cartStore.isEmpty" description="장바구니가 비어있습니다" />

          <div v-else class="cart-items">
            <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
              <img :src="item.thumbnail" :alt="item.title" />
              <div class="cart-item-info">
                <strong>{{ item.title }}</strong>
                <span>${{ item.price }} × {{ item.qty }}</span>
              </div>
              <el-input-number :model-value="item.qty" :min="1" :max="99" size="small" @change="(val) => handleQtyChange(item.id, val)" />
              <el-popconfirm title="이 상품을 삭제할까요?" confirm-button-text="삭제" cancel-button-text="취소" @confirm="handleRemoveItem(item.id)">
                <template #reference>
                  <el-button circle size="small" text>✕</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>

          <template #footer>
            <div class="cart-footer">
              <div class="cart-total">
                <span>총 합계</span>
                <strong>${{ cartStore.totalPrice.toFixed(2) }}</strong>
              </div>
              <el-button :disabled="cartStore.isEmpty" @click="cartStore.clearCart">비우기</el-button>
              <el-button type="success" :disabled="cartStore.isEmpty" @click="handleCheckout">결제하기</el-button>
            </div>
          </template>
        </el-drawer>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.library-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.library-heading > div > span {
  color: #409eff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.library-heading h2 {
  margin-top: 3px;
}

.library-heading p {
  margin: 0;
  color: #667085;
}

.library-badge {
  flex: 0 0 auto;
  padding: 7px 11px;
  border: 1px solid #b3d8ff;
  border-radius: 999px;
  background: #ecf5ff;
  color: #337ecc;
  font-size: 11px;
  font-weight: 800;
}

.ui-library-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.challenge-card {
  min-width: 0;
  border-radius: 14px;
}

.feedback-card,
.ecommerce-card {
  grid-column: 1 / -1;
}

:deep(.challenge-card .el-card__header) {
  padding: 15px 18px;
  background: #fbfcfe;
}

:deep(.challenge-card .el-card__body) {
  padding: 20px;
}

.element-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.element-card-header > div {
  display: grid;
}

.element-card-header strong {
  color: #344054;
  font-size: 14px;
}

.element-card-header small {
  color: #98a2b3;
  font-size: 10px;
}

.header-icon {
  display: grid;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  place-items: center;
  font-weight: 800;
}

.header-icon.green {
  background: #e8fff5;
  color: #087a55;
}

.header-icon.amber {
  background: #fffaeb;
  color: #dc6803;
}

.header-icon.purple {
  background: #f4f0ff;
  color: #6941c6;
}

.header-icon.teal {
  background: #e6fbfa;
  color: #0e7c86;
}

.register-form {
  display: grid;
  gap: 14px;
}

.register-form > label,
.control-row > span {
  color: #475467;
  font-size: 12px;
  font-weight: 750;
}

.agreement-row {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #667085;
  font-size: 12px;
}

.register-form :deep(.el-button) {
  width: 100%;
}

.commerce-form {
  display: grid;
  gap: 20px;
}

.control-row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.control-row > small {
  grid-column: 2;
  color: #98a2b3;
  font-size: 10px;
}

.control-row :deep(.el-input-number) {
  width: 150px;
}

.rating-row :deep(.el-rate) {
  min-width: 180px;
}

.live-summary {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 13px;
  border-radius: 9px;
  background: #f2f4f7;
  color: #475467;
  font-size: 12px;
}

.live-summary i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #32d583;
  box-shadow: 0 0 0 4px #d1fadf;
}

.feedback-content {
  display: grid;
  grid-template-columns: minmax(180px, 0.7fr) minmax(300px, 1fr);
  gap: 18px 28px;
  align-items: center;
}

.feedback-copy strong {
  color: #344054;
}

.feedback-copy p {
  margin: 5px 0 0;
  color: #667085;
  font-size: 12px;
}

.feedback-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.feedback-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.progress-area {
  grid-column: 1 / -1;
  padding: 15px;
  border-radius: 10px;
  background: #f8fafc;
}

.progress-area small {
  display: block;
  margin-top: 7px;
  color: #98a2b3;
  font-size: 10px;
}

.ecommerce-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.ecommerce-header-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
}

.cross-link-button {
  padding: 7px 12px;
  border: 1px solid #dfd5ff;
  border-radius: 999px;
  background: #f4f0ff;
  color: #6941c6;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease;
}

.cross-link-button:hover {
  background: #ebe4ff;
}

.ecommerce-loading {
  padding: 30px;
  color: #667085;
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.product-card {
  position: relative;
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  background: white;
}

.product-card :deep(.product-image) {
  width: 100%;
  height: 110px;
  border-radius: 8px;
}

.discount-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}

.product-title {
  overflow: hidden;
  color: #344054;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.product-price {
  color: #087a55;
  font-size: 14px;
  font-weight: 800;
}

.product-price-original {
  color: #98a2b3;
  font-size: 11px;
  text-decoration: line-through;
}

.cart-items {
  display: grid;
  gap: 14px;
}

.cart-item {
  display: grid;
  grid-template-columns: 48px 1fr auto auto;
  gap: 10px;
  align-items: center;
}

.cart-item img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.cart-item-info {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.cart-item-info strong {
  overflow: hidden;
  color: #344054;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-info span {
  color: #98a2b3;
  font-size: 11px;
}

.cart-item :deep(.el-input-number) {
  width: 110px;
}

.cart-footer {
  display: grid;
  gap: 10px;
}

.cart-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475467;
  font-size: 13px;
}

.cart-total strong {
  color: #087a55;
  font-size: 16px;
}

@media (max-width: 900px) {
  .ui-library-grid {
    grid-template-columns: 1fr;
  }

  .feedback-card,
  .ecommerce-card {
    grid-column: auto;
  }

  .feedback-content {
    grid-template-columns: 1fr;
  }

  .feedback-actions {
    justify-content: flex-start;
  }

  .progress-area {
    grid-column: auto;
  }
}

@media (max-width: 600px) {
  .library-heading {
    flex-direction: column;
  }

  .ecommerce-card-header {
    flex-wrap: wrap;
  }

  .control-row {
    grid-template-columns: 1fr;
  }

  .control-row > small {
    grid-column: auto;
  }

  .feedback-actions {
    display: grid;
  }
}
</style>
