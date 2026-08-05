import { computed, onMounted, watch } from 'vue'
import { useWeatherStore } from '@/stores/weatherStore'

// [과제 확장 - 도시 정보 메뉴] useAirQuality.js와 같은 구조. 대시보드 도시 목록에
// 현지 시각·위키 요약(cityInsightsByCity)을 합쳐 화면이 바로 쓸 수 있는 형태로 만든다.
export function useCityInsights() {
  const weatherStore = useWeatherStore()

  onMounted(async () => {
    if (!weatherStore.hasFetched && !weatherStore.isLoading) {
      await weatherStore.fetchWeatherList()
    }
    weatherStore.fetchCityInsights(weatherStore.weatherList)
  })

  // 검색으로 도시가 새로 추가되면 그 도시의 정보도 함께 불러온다.
  // fetchCityInsights 내부에서 이미 캐시된 도시는 걸러내므로 중복 호출은 없다.
  watch(
    () => weatherStore.weatherList.length,
    () => weatherStore.fetchCityInsights(weatherStore.weatherList),
  )

  // Modern JS 포인트) padStart로 "9시 5분"이 아닌 "09:05" 형태의 두 자리 시각 문자열을 만든다.
  const formatTime = ({ hour, minute }) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  const citiesWithInsights = computed(() =>
    weatherStore.weatherList.map((city) => {
      const insight = weatherStore.cityInsightsByCity[city.id]
      const localTime = insight?.localTime ?? null

      return {
        ...city,
        wiki: insight?.wiki ?? null,
        localTime,
        localTimeLabel: localTime ? formatTime(localTime) : null,
        // 6시~18시는 낮, 그 외는 밤으로 간단히 구분한다.
        isDaytime: localTime ? localTime.hour >= 6 && localTime.hour < 18 : null,
      }
    }),
  )

  return {
    citiesWithInsights,
    isLoading: computed(() => weatherStore.isLoadingCityInsights),
    errorMessage: computed(() => weatherStore.cityInsightsError),
  }
}
