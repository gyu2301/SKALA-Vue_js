import { computed, onMounted, watch } from 'vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { AQI_LEVELS, UNKNOWN_AQI_LEVEL } from '@/constants/airQualityLevels'

// [과제 확장 - 대기질 메뉴] useWeatherSearch.js와 같은 결로, 대기질 화면 전용 로직을
// Composable로 분리했다. weatherStore(대기질 캐시)는 Pinia 싱글턴이라 화면을 벗어났다
// 다시 들어와도 이미 불러온 도시는 API를 다시 호출하지 않는다.
export function useAirQuality() {
  const weatherStore = useWeatherStore()

  // 대시보드 도시 목록이 아직 없으면(=검색/홈 화면을 거치지 않고 바로 이 메뉴로 들어온 경우)
  // 먼저 날씨 목록을 채운 뒤 대기질을 조회한다.
  onMounted(async () => {
    if (!weatherStore.hasFetched && !weatherStore.isLoading) {
      await weatherStore.fetchWeatherList()
    }
    weatherStore.fetchAirQuality(weatherStore.weatherList)
  })

  // weatherList에 도시가 늘어나면(검색으로 새 도시를 추가한 경우 등) 새로 늘어난 도시의
  // 대기질도 함께 불러온다. fetchAirQuality 내부에서 이미 캐시된 도시는 걸러내므로 중복 호출은 없다.
  watch(
    () => weatherStore.weatherList.length,
    () => weatherStore.fetchAirQuality(weatherStore.weatherList),
  )

  // 도시 원본 정보(name, address 등)와 대기질 데이터(aqi, pm2_5 ...)를 하나로 합쳐
  // 카드가 바로 쓸 수 있는 형태로 만든다. 아직 안 불러와진 도시는 level에 기본값을 채운다.
  const citiesWithAirQuality = computed(() =>
    weatherStore.weatherList.map((city) => {
      const airQuality = weatherStore.airQualityByCity[city.id]
      // Map.get()은 없는 키에 undefined를 주므로, 널 병합(??)으로 "정보 없음" 기본값을 붙인다.
      const level = AQI_LEVELS.get(airQuality?.aqi) ?? UNKNOWN_AQI_LEVEL

      return { ...city, ...airQuality, level }
    }),
  )

  // Modern JS 포인트) 아직 aqi가 없는(로딩 중인) 도시는 정렬 대상에서 제외하고,
  // 남은 도시만 aqi 오름차순(좋음 → 나쁨)으로 정렬한다.
  const rankedCities = computed(() =>
    citiesWithAirQuality.value.filter((city) => city.aqi != null).sort((a, b) => a.aqi - b.aqi),
  )

  // Modern JS 포인트) 배열 구조분해로 정렬된 목록의 첫 항목(가장 맑은 도시)을 바로 꺼내고,
  // Array.prototype.at(-1)로 마지막 항목(가장 나쁜 도시)을 꺼낸다.
  const cleanestCity = computed(() => {
    const [first] = rankedCities.value
    return first ?? null
  })
  const worstCity = computed(() => rankedCities.value.at(-1) ?? null)

  return {
    citiesWithAirQuality,
    rankedCities,
    cleanestCity,
    worstCity,
    isLoading: computed(() => weatherStore.isLoadingAirQuality),
    errorMessage: computed(() => weatherStore.airQualityError),
  }
}
