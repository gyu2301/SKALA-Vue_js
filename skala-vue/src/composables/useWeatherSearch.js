import { ref, computed, watchEffect } from 'vue'

// 도시 날씨 mock 목록 + 검색어 기반 필터링 로직을 재사용 가능한 Composable로 분리했다.
export function useWeatherSearch() {
  const weatherList = ref([
    {
      id: 'city_01',
      name: '서울',
      temp: 28,
      status: '맑음',
      address: '대한민국 서울특별시',
      humidity: 55,
      wind: 2.5,
    },
    {
      id: 'city_02',
      name: '수원',
      temp: 24,
      status: '비',
      address: '대한민국 경기도 수원시',
      humidity: 78,
      wind: 3.1,
    },
    {
      id: 'city_03',
      name: '부산',
      temp: 26,
      status: '구름',
      address: '대한민국 부산광역시',
      humidity: 62,
      wind: 4.2,
    },
    {
      id: 'city_04',
      name: '철원',
      temp: 18,
      status: '흐림',
      address: '대한민국 강원특별자치도 철원군',
      humidity: 70,
      wind: 1.8,
    },
    {
      id: 'city_05',
      name: '광주',
      temp: 27,
      status: '맑음',
      address: '대한민국 광주광역시',
      humidity: 50,
      wind: 2.0,
    },
    {
      id: 'city_06',
      name: '울산',
      temp: 20,
      status: '구름',
      address: '대한민국 울산광역시',
      humidity: 65,
      wind: 3.6,
    },
  ])

  const searchQuery = ref('')

  // name.includes('') 는 항상 true 이므로 검색어가 비어있으면 원본 그대로 반환된다.
  const filteredWeatherList = computed(() =>
    weatherList.value.filter((city) => city.name.includes(searchQuery.value.trim())),
  )

  // 콜백 안에서 읽은 반응형 값(searchQuery)을 자동 추적한다.
  // 타이핑할 때마다 즉시 실행된다.
  watchEffect(() => {
    console.log('[watchEffect] searchQuery:', searchQuery.value)
  })

  return { weatherList, searchQuery, filteredWeatherList }
}
