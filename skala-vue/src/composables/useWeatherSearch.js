import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useWeatherStore } from '@/stores/weatherStore'

// 7. Axios : 도시 날씨 목록(weatherStore, OpenWeatherMap 연동) + 검색어 기반 필터링 로직을
// 재사용 가능한 Composable로 분리했다. weatherStore는 Pinia 싱글턴이라 여러 화면에서
// 이 Composable을 호출해도 API 호출은 한 번만 일어난다.
export function useWeatherSearch() {
  const weatherStore = useWeatherStore()

  onMounted(() => {
    if (!weatherStore.hasFetched && !weatherStore.isLoading) {
      weatherStore.fetchWeatherList()
    }
  })

  const weatherList = computed(() => weatherStore.weatherList)
  const searchQuery = ref('')

  // name.includes('') 는 항상 true 이므로 검색어가 비어있으면 원본 그대로 반환된다.
  // 대소문자 구분 없이 비교한다: OpenWeatherMap Geocoding으로 새로 가져온 영문 도시명은
  // "New"처럼 대문자로 저장되는데, 사용자가 소문자로 입력하면(예: "new") 원래 방식(case-sensitive
  // includes)으로는 매칭되지 않아 이미 store에 있는 도시인데도 목록에서 빠지는 문제가 있었다.
  const filteredWeatherList = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    return weatherList.value.filter((city) => city.name.toLowerCase().includes(query))
  })

  // 콜백 안에서 읽은 반응형 값(searchQuery)을 자동 추적한다.
  // 타이핑할 때마다 즉시 실행된다.
  watchEffect(() => {
    console.log('[watchEffect] searchQuery:', searchQuery.value)
  })

  // 검색어가 바뀌면 이전 검색(다른 도시 이름)에서 남은 에러 문구/미리보기 결과를 지운다.
  watch(searchQuery, () => {
    weatherStore.searchErrorMessage = ''
    weatherStore.searchResults = []
  })

  return {
    weatherList,
    searchQuery,
    filteredWeatherList,
    isLoading: computed(() => weatherStore.isLoading),
    errorMessage: computed(() => weatherStore.errorMessage),
    isSearching: computed(() => weatherStore.isSearching),
    searchErrorMessage: computed(() => weatherStore.searchErrorMessage),
    searchResults: computed(() => weatherStore.searchResults),
    searchCity: weatherStore.searchCity,
    addCityToDashboard: weatherStore.addCityToDashboard,
  }
}
