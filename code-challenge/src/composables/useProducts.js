import { ref } from 'vue'
import axios from 'axios'

// [과제 확장 - 이커머스] 11번 Axios 챌린지(API 연동 데모)와 12번 Element Plus 챌린지(상품 카탈로그 UI)가
// 동일한 axios.get 로직을 재사용하도록 composable로 분리했다.
const PRODUCTS_API_URL = 'https://dummyjson.com/products'

// API가 응답하지 않을 때를 대비한 최소한의 대체 데이터 (배포 데모가 죽지 않도록 방어)
const FALLBACK_PRODUCTS = [
  { id: 1, title: 'Essence Mascara Lash Princess', price: 9.99, thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp', discountPercentage: 10.48, rating: 2.56, stock: 99 },
  { id: 2, title: 'Eyeshadow Palette with Mirror', price: 19.99, thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp', discountPercentage: 18.19, rating: 2.86, stock: 34 },
  { id: 3, title: 'Powder Canister', price: 14.99, thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp', discountPercentage: 9.84, rating: 4.64, stock: 89 },
  { id: 4, title: 'Red Lipstick', price: 12.99, thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp', discountPercentage: 7.17, rating: 4.36, stock: 62 },
]

export function useProducts() {
  const products = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function fetchProducts(limit = 6) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await axios.get(PRODUCTS_API_URL, {
        params: { limit, select: 'id,title,price,thumbnail,discountPercentage,rating,stock' },
      })

      products.value = response.data.products
    } catch (error) {
      errorMessage.value = `상품 목록을 불러오지 못해 예시 데이터를 표시합니다. (${error.message})`
      products.value = FALLBACK_PRODUCTS
    } finally {
      isLoading.value = false
    }
  }

  return { products, isLoading, errorMessage, fetchProducts }
}
